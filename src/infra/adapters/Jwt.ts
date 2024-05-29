import { sign, verify } from 'jsonwebtoken';
import { ApiError } from '../../core/exceptions/ApiError';
import { ApiLog } from '../../core/exceptions/ApiLog';
import { TokenManager, TokenPayload } from './abstractions/TokenManager';

/**
 * Interface for JWT token
 */
export class JwtAdapter implements TokenManager {
	private className: string = 'JwtAdapter';
	readonly secret: string;

	constructor(secret: string, readonly secureOnly: boolean) {
		this.secret = secret;
	}

	/**
	 * Creates a new token
	 *
	 * @param {TokenPayload} tokenPayload - [Additional information to be contained inside the token]
	 * @param {JwtOption}    options      - [Additional options passed to JWT tokan library, expecific to it]
	 */
	createToken(tokenPayload: TokenPayload, options: JwtOption): string {
		try {
			return sign(tokenPayload, this.secret, options);
		} catch (err: any) {
			throw new ApiError(500, 'Erro ao autenticar', new ApiLog(2, err.message, `${this.className}->createToken`, new Date().toLocaleString('pt-BR')));
		}
	}

	/**
	 * Verify a given token to be regular, and returns it payload.
	 *
	 * @param {string} requestToken - [The given token]
	 */
	verify(requestToken: string): any {
		try {
			return verify(requestToken, this.secret);
		} catch (err: any) {
			throw new ApiError(401, 'Credenciais inválidas', new ApiLog(1, err.message, `${this.className}->verify`, new Date().toLocaleString('pt-BR')));
		}
	}
}

type JwtOption = {
	expiresIn: string;
};
