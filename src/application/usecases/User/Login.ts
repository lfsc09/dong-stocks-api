import { User } from '../../../core/entities/User';
import { ApiError } from '../../../core/exceptions/ApiError';
import { ApiLog } from '../../../core/exceptions/ApiLog';
import { ApiUserPermission } from '../../../core/utils/ApiUserPermission';
import { Logger } from '../../../infra/adapters/abstractions/Logger';
import { TokenManager, TokenPayload } from '../../../infra/adapters/abstractions/TokenManager';
import { LoginInterface } from '../../../infra/interfaces/abstractions/User/Login';

export class LoginUsecase {
	private className: string = 'LoginUsecase';

	constructor(readonly loginInterface: LoginInterface, readonly logger: Logger, readonly tokenManager: TokenManager) {}

	async execute(input: Input): Promise<Output> {
		const userFound = await this.loginInterface.getByUsername(input.username);

		if (userFound.password !== User.sanitizePassword(input.password))
			throw new ApiError(
				401,
				'Credenciais inválidas',
				new ApiLog(
					1,
					'User password is incorrect',
					`${this.loginInterface.additionalRequestData.stack}/${this.className}->execute`,
					this.loginInterface.additionalRequestData.timestamp
				)
			);

		// Captura as permissões desse usuário
		const userPermissions = ApiUserPermission.getPermissionBinary(await this.loginInterface.getPermissions(<number>userFound.id));

		// Constoi o token
		const tokenFingerprint = {};

		const tokenPayload: TokenPayload = {
			id: userFound.id,
			username: userFound.username,
			name: userFound.name,
			admin_flag: userFound.is_admin_flag,
			perms: userPermissions,
			configs: userFound.configs_json,
			host: 'postosmantra',
			fingerprint: tokenFingerprint,
		};

		let token = this.tokenManager.createToken(tokenPayload, { expiresIn: '1d' });

		// Atualiza as estatisticas de login desse usuário
		await this.loginInterface.updateUserLogged({ id_user: <number>userFound.id, ipv4_address: this.loginInterface.additionalRequestData.ipv4_address });

		return { token: token };
	}
}

type Input = {
	username: string;
	password: string;
};

type Output = {
	token: string | undefined;
};
