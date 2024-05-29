import bodyParser from 'body-parser';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import http from 'http';
import https from 'https';
import { ApiError } from '../../core/exceptions/ApiError';
import { ApiLog } from '../../core/exceptions/ApiLog';
import { Consts } from '../../core/services/Consts';
import { Logger } from './abstractions/Logger';
import { TokenManager, TokenPayload } from './abstractions/TokenManager';
import { Input_AdditionalData, Input_EnvironmentData, Input_HttpsCertificates, Input_RouteData, WebServer } from './abstractions/WebServer';

export class ExpressAdapter implements WebServer {
	server: any;
	private httpServer: any;
	private httpsServer: any;
	readonly logger: Logger;
	readonly tokenManager: TokenManager;

	constructor(readonly environmentData: Input_EnvironmentData, logger: Logger, tokenManager: TokenManager) {
		this.logger = logger;
		this.tokenManager = tokenManager;
		this.server = express();
		this.server.use(this.configCors);
		this.server.use(helmet());
		this.server.use(bodyParser.json());
	}

	private configCors(request: Request, response: Response, next: NextFunction): void {
		response.setHeader('Access-Control-Allow-Origin', this.environmentData.apiUrl);
		response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
		response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		next();
	}

	registerRoute(method: string, url: string, additionalData: Input_AdditionalData, middlewares: Function[], callback: Function): void {
		this.server[method](url, ...middlewares, async function (request: RequestCustom, response: Response, next: NextFunction) {
			const requestTimestamp = new Date().toLocaleString('pt-BR');
			try {
				const input: Input_RouteData = {
					fingerprint: {
						ipv4Address: request.socket.remoteAddress?.split(':')?.pop() ?? '',
					},
					query: request.query,
					params: request.params,
					body: request.body,
					callerStack: additionalData.callerStack,
					requestTimestamp,
					userRequesting: { id: request.tokenPayload?.id ?? -1, username: request.tokenPayload?.username ?? 'Unknown' },
				};
				const output = await callback(input);
				response.status(200).json(output);
			} catch (err: any) {
				next(err instanceof ApiError ? err : new ApiError(500, 'Algo deu errado', new ApiLog(2, err.message, additionalData.callerStack, requestTimestamp)));
			}
		});
	}

	registerErrorCatchRoute(): void {
		this.server.use((error: ApiError, request: Request, response: Response, next: NextFunction) => {
			this.logger.write(error.logMessage);
			response
				.status(error.code)
				.json(this.environmentData.nodeEnv === Consts.ENV_DEVELOPMENT ? { message: error.message, logMessage: error.logMessage.toObject() } : { message: error.message });
		});
	}

	handleTokenExtraction(request: RequestCustom, response: Response, next: NextFunction): void {
		let decodedToken: any;
		const requestToken = request.get('Authorization')?.split(' ')?.[1] ?? '';

		try {
			decodedToken = this.tokenManager.verify(requestToken);
		} catch (err: any) {
			return next(err);
		}

		request['tokenPayload'] = decodedToken;
		next();
	}

	listenHttp(port: string): void {
		try {
			this.httpServer = http.createServer(this.server);
			this.httpServer.listen(port);
			console.log(`HTTP server start at: ${port}`);
		} catch (err: any) {
			throw `Catastrophic Failure: Fail start HTTP server at ${port}\n[${new Date().toLocaleString('pt-BR')}]\n${JSON.stringify(err, null, 4)}\n`;
		}
	}

	listenHttps(port: string, certificates: Input_HttpsCertificates): void {
		try {
			this.httpsServer = https.createServer(certificates, this.server);
			this.httpsServer.listen(port);
			console.log(`HTTPS server start at: ${port}`);
		} catch (err: any) {
			throw `Catastrophic Failure: Fail start HTTPS server at ${port}\n[${new Date().toLocaleString('pt-BR')}]\n${JSON.stringify(err, null, 4)}\n`;
		}
	}
}

interface RequestCustom extends Request {
	tokenPayload: TokenPayload;
}
