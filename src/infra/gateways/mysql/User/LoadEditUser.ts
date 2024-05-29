import { ApiError } from '../../../../core/exceptions/ApiError';
import { ApiLog } from '../../../../core/exceptions/ApiLog';
import { ApiUserPermission } from '../../../../core/utils/ApiUserPermission';
import { AdditionalRequestData } from '../../../../main';
import { MysqlAdapter } from '../../../adapters/Mysql';
import { LoadEditUserPresenter } from '../../../presenter/mysql/User/LoadEditUser';
import {
	Input_GetUser,
	LoadEditUserInterface,
	Mysql_Output_GetActiveUsers,
	Mysql_Output_GetAvailableBranches,
	Mysql_Output_GetUser,
	Output_GetActiveUsers,
	Output_GetAvailableBranches,
	Output_GetAvailableUserPermissions,
	Output_GetUser,
} from '../../abstrations/User/LoadEditUser';

export class LoadEditUserInterfaceMysql implements LoadEditUserInterface {
	private className: string = 'LoadEditUserInterfaceMysql';

	constructor(readonly additionalRequestData: AdditionalRequestData, readonly loadEditUserPresenter: LoadEditUserPresenter) {}

	async getUser(data: Input_GetUser): Promise<Output_GetUser> {
		let [user] = await MysqlAdapter.connPool
			.execute<Mysql_Output_GetUser[]>(
				`
                    SELECT
                        \`user\`.id,
                        \`user\`.id_branch,
                        \`user\`.is_admin_flag,
                        \`user\`.username,
                        \`user\`.name,
                        \`user\`.email,
                        GROUP_CONCAT( \`user__branch_access\`.id_branch ) AS \`access_branches\`
                    FROM \`user\`
                    INNER JOIN \`user__branch_access\`
                    ON
                        \`user\`.id = \`user__branch_access\`.id_user
                    WHERE
                        \`user\`.id = ?
                    GROUP BY
                        \`user\`.id
                    ;
                `,
				[data.id_user]
			)
			.catch((err: any) => {
				throw new ApiError(
					500,
					'Falha ao trazer os dados',
					new ApiLog(
						3,
						err.message,
						`${this.additionalRequestData.stack}/${this.className}->getUser`,
						this.additionalRequestData.timestamp,
						this.additionalRequestData.userRequesting
					)
				);
			});
		if (user.length <= 0)
			throw new ApiError(
				404,
				'Usuário não encontrado',
				new ApiLog(
					1,
					`User '${data.id_user}' not found`,
					`${this.additionalRequestData.stack}/${this.className}->getUser`,
					this.additionalRequestData.timestamp,
					this.additionalRequestData.userRequesting
				)
			);
		return this.loadEditUserPresenter.getUser(user[0]);
	}

	async getAvailableBranches(): Promise<Output_GetAvailableBranches[]> {
		let [branches] = await MysqlAdapter.connPool
			.execute<Mysql_Output_GetAvailableBranches[]>(
				`
                    SELECT
                        \`branch\`.id AS \`value\`,
                        \`branch\`.name AS \`label\`
                    FROM \`branch\`
                    WHERE
                        \`branch\`.deleted_flag = 0
                    ORDER BY
                        \`branch\`.name
                    ;
                `,
				[]
			)
			.catch((err: any) => {
				throw new ApiError(
					500,
					'Falha ao trazer os dados',
					new ApiLog(
						3,
						err.message,
						`${this.additionalRequestData.stack}/${this.className}->getAvailableBranches`,
						this.additionalRequestData.timestamp,
						this.additionalRequestData.userRequesting
					)
				);
			});
		if (branches.length <= 0)
			throw new ApiError(
				404,
				'Não há filiais cadastradas',
				new ApiLog(
					2,
					'Should have branches registered to be used',
					`${this.additionalRequestData.stack}/${this.className}->getAvailableBranches`,
					this.additionalRequestData.timestamp,
					this.additionalRequestData.userRequesting
				)
			);
		return this.loadEditUserPresenter.getAvailableBranches(branches);
	}

	getAvailableUserPermissions(): Output_GetAvailableUserPermissions[] {
		return this.loadEditUserPresenter.getAvailableUserPermissions(ApiUserPermission.getPerms());
	}

	async getActiveUsers(): Promise<Output_GetActiveUsers[]> {
		let [users] = await MysqlAdapter.connPool
			.execute<Mysql_Output_GetActiveUsers[]>(
				`
                    SELECT
                        \`user\`.id AS \`value\`,
                        \`user\`.name AS \`label\`,
                        \`branch\`.name AS \`group_label\`
                    FROM \`user\`
                    INNER JOIN \`branch\`
                    ON
                        \`user\`.id_branch = \`branch\`.id
                    WHERE
                        \`user\`.deleted_flag = 0 AND \`branch\`.deleted_flag = 0
                    ORDER BY
                        \`user\`.name
                    ;
                `,
				[]
			)
			.catch((err: any) => {
				throw new ApiError(
					500,
					'Falha ao trazer os dados',
					new ApiLog(
						3,
						err.message,
						`${this.additionalRequestData.stack}/${this.className}->getActiveUsers`,
						this.additionalRequestData.timestamp,
						this.additionalRequestData.userRequesting
					)
				);
			});
		return this.loadEditUserPresenter.getActiveUsers(users);
	}
}
