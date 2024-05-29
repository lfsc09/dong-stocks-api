import { ResultSetHeader } from 'mysql2';
import { ApiError } from '../../../../core/exceptions/ApiError';
import { ApiLog } from '../../../../core/exceptions/ApiLog';
import { MysqlAdapter } from '../../../adapters/Mysql';
import { Database } from '../../../adapters/abstractions/Database';
import { LoginPresenter } from '../../../presenter/mysql/User/Login';
import {
	AdditionalRequestData,
	Input_UpdateUserLogged,
	LoginInterface,
	Mysql_Out_GetPermissions,
	Mysql_Output_GetByUsername,
	Out_GetPermissions,
	Output_GetByUsername,
} from '../../abstractions/User/Login';

export class LoginInterfaceMysql implements LoginInterface {
	private className: string = 'LoginInterfaceMysql';
    readonly additionalRequestData: AdditionalRequestData;

	constructor(readonly database: Database, additionalRequestData: AdditionalRequestData, readonly loginPresenter: LoginPresenter) {
        this.additionalRequestData = additionalRequestData;
    }

	/**
	 * Busca apenas usuários ativos.
	 */
	async getByUsername(username: string): Promise<Output_GetByUsername> {
		let [user] = await MysqlAdapter.connPool
			.execute<Mysql_Output_GetByUsername[]>(
				`
                    SELECT
                        \`user\`.id,
                        \`user\`.is_admin_flag,
                        \`user\`.username,
                        \`user\`.name,
                        \`user\`.password,
                        \`user\`.configs_json
                    FROM \`user\`
                    WHERE 1=1
                        AND \`user\`.username = ?
                        AND \`user\`.deleted_flag = 0
                    ;
                `,
				[username]
			)
			.catch((err: any) => {
				throw new ApiError(
					500,
					'Erro ao autenticar',
					new ApiLog(3, err.message, `${this.additionalRequestData.stack}/${this.className}->getByUsername`, this.additionalRequestData.timestamp)
				);
			});
		if (user.length <= 0)
			throw new ApiError(
				401,
				'Credenciais inválidas',
				new ApiLog(1, 'User not found', `${this.additionalRequestData.stack}/${this.className}->getByUsername`, this.additionalRequestData.timestamp)
			);
		return this.loginPresenter.getByUsername(user[0]);
	}

	/**
	 * Busca as permissões de um usuário.
	 */
	async getPermissions(id_user: number): Promise<Out_GetPermissions[]> {
		let [user_permissions] = await MysqlAdapter.connPool
			.execute<Mysql_Out_GetPermissions[]>(
				`
                    SELECT
                        \`user__permission\`.id_permission
                    FROM \`user__permission\`
                    WHERE
                        \`user__permission\`.id_user = ?
                    ;
                `,
				[id_user]
			)
			.catch((err: any) => {
				throw new ApiError(
					500,
					'Erro ao autenticar',
					new ApiLog(3, err.message, `${this.additionalRequestData.stack}/${this.className}->getPermissions`, this.additionalRequestData.timestamp)
				);
			});
		return <Out_GetPermissions[]>user_permissions;
	}

	/**
	 * Atualiza informações de login do usuário autenticado.
	 */
	async updateUserLogged(data: Input_UpdateUserLogged): Promise<void> {
		let [updateSuccess] = await MysqlAdapter.connPool
			.execute<ResultSetHeader>(
				`
                    UPDATE
                        \`user\`
                    SET
                        \`user\`.last_login_datetime = NOW(),
                        \`user\`.login_count = \`user\`.login_count + 1,
                        \`user\`.login_ipv4_address = INET_ATON(?)
                    WHERE
                        \`user\`.id = ?
                    ;
                `,
				[data.ipv4_address, data.id_user]
			)
			.catch((err: any) => {
				throw new ApiError(
					500,
					'Erro ao autenticar',
					new ApiLog(3, err.message, `${this.additionalRequestData.stack}/${this.className}->updateUserLogged`, this.additionalRequestData.timestamp)
				);
			});
		if (updateSuccess.affectedRows <= 0)
			throw new ApiError(
				500,
				'Erro ao autenticar',
				new ApiLog(
					3,
					`User '${data.id_user}' was not updated on login`,
					`${this.additionalRequestData.stack}/${this.className}->updateUserLogged`,
					this.additionalRequestData.timestamp
				)
			);
	}
}
