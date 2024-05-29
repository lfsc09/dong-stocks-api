import { Logger } from "./Logger";
import { TokenManager } from "./TokenManager";

export interface WebServer {
    readonly logger: Logger;
    readonly tokenManager: TokenManager;
	registerRoute(method: string, url: string, additionalData: Input_AdditionalData, middlewares: Function[], callback: Function): void;
	registerErrorCatchRoute(): void;
	listenHttp(port: string): void;
	listenHttps(port: string, certificates: Input_HttpsCertificates): void;
}

export type Input_EnvironmentData = {
	nodeEnv: string;
	apiUrl: string;
};

export type Input_AdditionalData = {
    callerStack: string;
}

export type Input_HttpsCertificates = {
	key: any;
	cert: any;
};

export type UserRequesting = {
    id: number;
    username: string;
};

export type Fingerprint = {
    ipv4Address: string;
}

export type Input_RouteData = {
    fingerprint: Fingerprint;
	query: any;
	params: any;
	body: any;
	callerStack: string;
	requestTimestamp: string;
	userRequesting: UserRequesting;
};

