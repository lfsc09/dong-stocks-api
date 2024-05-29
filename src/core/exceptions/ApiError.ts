import { ApiLog } from './ApiLog';

/**
 * Generic new Error type for this API.
 *
 * @var {number}  code       - [Code number that will be used as HTTP status Code]
 * @var {Message} message    - [Default Error message]
 * @var {ApiLog}  logMessage - [Error log object with detailed information of error]
 */
export class ApiError extends Error {
	private className: string = 'ApiError';
	readonly code: number;
	readonly logMessage: ApiLog;

	isCodeInvalid(code: number): boolean {
		return !code || code <= 0;
	}

	constructor(code: number, message: string, logMessage: ApiLog) {
		super();
		this.message = message || 'Erro desconhecido';
		this.code = this.isCodeInvalid(code) ? 500 : code;
		this.logMessage =
			logMessage && logMessage instanceof ApiLog
				? logMessage
				: new ApiLog(3, `No ApiLog was provided in new ApiError(${code}, ${message})`, this.className, new Date().toLocaleString('pt-BR'), { id: -1, username: 'Unknown' });
	}
}
