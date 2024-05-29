import { ApiError } from '../../../../core/exceptions/ApiError';
import { ApiLog } from '../../../../core/exceptions/ApiLog';
import { ApiUserPermission } from '../../../../core/utils/ApiUserPermission';
import { AdditionalRequestData } from '../../../../main';
import { MysqlAdapter } from '../../../adapters/Mysql';
import { LoadNewUserPresenter } from '../../../presenter/mysql/User/LoadNewUser';
import {
	LoadNewUserInterface,
	Mysql_Output_GetActiveUsers,
	Mysql_Output_GetAvailableBranches,
	Output_GetActiveUsers,
	Output_GetAvailableBranches,
	Output_GetAvailableUserPermissions,
} from '../../abstrations/User/LoadNewUser';

export class LoadNewUserInterfaceMysql implements LoadNewUserInterface {
	private className: string = 'LoadNewUserInterfaceMysql';

	constructor(readonly additionalRequestData: AdditionalRequestData, readonly loadNewUserPresenter: LoadNewUserPresenter) {}

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
		return this.loadNewUserPresenter.getAvailableBranches(branches);
	}

	getAvailableUserPermissions(): Output_GetAvailableUserPermissions[] {
		return this.loadNewUserPresenter.getAvailableUserPermissions(ApiUserPermission.getPerms());
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
		return this.loadNewUserPresenter.getActiveUsers(users);
	}
}
