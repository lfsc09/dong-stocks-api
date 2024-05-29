export interface TokenManager {
    readonly secret: string;
    createToken(tokenPayload: TokenPayload, options: any): string;
    verify(requestToken: string): any;
}

export type TokenPayload = {
	id: number;
	username: string;
	name: string;
	admin_flag: boolean;
	perms: string;
	configs: string;
	host: string;
	fingerprint: {};
};