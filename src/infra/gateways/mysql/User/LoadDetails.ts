import { ApiError } from '../../../../core/exceptions/ApiError';
import { ApiLog } from '../../../../core/exceptions/ApiLog';
import { AdditionalRequestData } from '../../../../main';
import { MysqlAdapter } from '../../../adapters/Mysql';
import { LoadDetailsPresenter } from '../../../presenter/mysql/User/LoadDetails';
import {
	Input_GetBranchesWithAccess,
	Input_GetDetails,
	LoadDetailsInterface,
	Mysql_GetBranchesWithAccess,
	Mysql_Output_GetDetails,
	Output_GetBranchesWithAccess,
	Output_GetDetails,
} from '../../abstrations/User/LoadDetails';

export class LoadDetailsInterfaceMysql implements LoadDetailsInterface {
	private className: string = 'LoadDetailsInterfaceMysql';

	constructor(readonly additionalRequestData: AdditionalRequestData, readonly loadDetailsPresenter: LoadDetailsPresenter) {}

	async getBranchesWithAccess(data: Input_GetBranchesWithAccess): Promise<Output_GetBranchesWithAccess> {
		let [branches] = await MysqlAdapter.connPool
			.execute<Mysql_GetBranchesWithAccess[]>(
				`
                    SELECT
                        \`branch\`.name AS \`access_branch\`
                    FROM \`user__branch_access\`
                    INNER JOIN \`branch\`
                    ON
                        \`user__branch_access\`.id_branch = \`branch\`.id
                    WHERE
                        \`user__branch_access\`.id_user = ?
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
						`${this.additionalRequestData.stack}/${this.className}->getBranchesWithAccess`,
						this.additionalRequestData.timestamp,
						this.additionalRequestData.userRequesting
					)
				);
			});
		if (branches.length <= 0)
			throw new ApiError(
				500,
				'Falha ao trazer os dados',
				new ApiLog(
					2,
					`User '${data.id_user}' does not exists or should have at least one branch access`,
					`${this.additionalRequestData.stack}/${this.className}->getBranchesWithAccess`,
					this.additionalRequestData.timestamp,
					this.additionalRequestData.userRequesting
				)
			);
		return this.loadDetailsPresenter.getBranchesWithAccess(branches);
	}

	async getDetails(data: Input_GetDetails): Promise<Output_GetDetails> {
		let [user] = await MysqlAdapter.connPool
			.execute<Mysql_Output_GetDetails[]>(
				`
                    SELECT
                        \`user\`.id,
                        \`user\`.deleted_flag,
                        \`user\`.is_admin_flag,
                        \`user\`.last_login_datetime,
                        \`user\`.login_count,
                        \`user\`.username,
                        \`user\`.name,
                        \`user\`.email,
                        \`user\`.insert_datetime,
                        \`user\`.update_datetime,
                        \`user\`.deleted_datetime,
                        "" AS \`password\`,
                        INET_NTOA(\`user\`.login_ipv4_address) AS \`login_ipv4_address\`,
                        \`branch\`.name AS \`branch\`
                    FROM \`user\`
                    INNER JOIN \`branch\`
                    ON
                        \`user\`.id_branch = \`branch\`.id
                    WHERE
                        \`user\`.id = ?
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
						`${this.additionalRequestData.stack}/${this.className}->getDetails`,
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
					`${this.additionalRequestData.stack}/${this.className}->getDetails`,
					this.additionalRequestData.timestamp,
					this.additionalRequestData.userRequesting
				)
			);
		return this.loadDetailsPresenter.getDetails(user[0]);
	}
}
