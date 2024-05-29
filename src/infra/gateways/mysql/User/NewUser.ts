import { ResultSetHeader } from 'mysql2';
import { ApiError } from '../../../../core/exceptions/ApiError';
import { ApiLog } from '../../../../core/exceptions/ApiLog';
import { AdditionalRequestData } from '../../../../main';
import { InsertBatchConfig, MysqlAdapter } from '../../../adapters/Mysql';
import { Input_CreateUser, NewUserInterface } from '../../abstrations/User/NewUser';

export class NewUserInterfaceMysql implements NewUserInterface {
	private className: string = 'NewUserInterfaceMysql';

	constructor(readonly additionalRequestData: AdditionalRequestData) {}

	private prepareAccessBranches(newUserId: number, accessBranches: number[]): Output_PrepareAccessBranches {
		let queryData: Output_PrepareAccessBranches = {
			wildcards: '',
			values: [],
		};
		for (let id_branch of accessBranches) {
			queryData.wildcards += ',(?,?)';
			queryData.values.push(newUserId);
			queryData.values.push(id_branch);
		}
		queryData.wildcards = queryData.wildcards.replace(/^,/, '');
		return queryData;
	}

	private preparePermissions(newUserId: number, permissions: number[], batchLimits: [number, number]): Output_PreparePermissions {
		let queryData: Output_PrepareAccessBranches = {
			wildcards: '',
			values: [],
		};
		for (; batchLimits[0] <= batchLimits[1]; batchLimits[0]++) {
			queryData.wildcards += ',(?,?)';
			queryData.values.push(newUserId);
			queryData.values.push(permissions[batchLimits[0]]);
		}
		queryData.wildcards = queryData.wildcards.replace(/^,/, '');
		return queryData;
	}

	async createUser(data: Input_CreateUser): Promise<void> {
		let conn;

		try {
			conn = await MysqlAdapter.connPool.getConnection();
			await conn.beginTransaction();

			// Cria o usuário
			let [insertSuccess] = await conn.execute<ResultSetHeader>(
				`
                    INSERT INTO
                        \`user\` (
                            id_branch,
                            is_admin_flag,
                            username,
                            name,
                            password,
                            email,
                            configs_json
                        )
                    VALUES
                        (?, ?, ?, ?, ?, ?, ?)
                    ;
                `,
				[data.user.id_branch, data.user.is_admin_flag, data.user.username, data.user.name, data.user.password, data.user.email, data.user.configs_json]
			);

			let newUserId = insertSuccess.insertId;

			// Insere as filiais que o usuário tem acesso
			let userBranchAccess = this.prepareAccessBranches(newUserId, data.access_branches);
			await conn.execute(
				`
                    INSERT INTO
                        \`user__branch_access\` (
                            id_user,
                            id_branch
                        )
                    VALUES ${userBranchAccess.wildcards}
                    ;
                `,
				userBranchAccess.values
			);

			// Insere as permissões do usuário (Em Batch)
			let queryBatchConfigs = new InsertBatchConfig(100, data.permissions.length);
			while (queryBatchConfigs.hasNext()) {
				let userPermissions = this.preparePermissions(newUserId, data.permissions, queryBatchConfigs.currentBatch());
				await conn.execute(
					`
                        INSERT INTO
                            \`user__permission\` (
                                id_user,
                                id_permission
                            )
                        VALUES ${userPermissions.wildcards}
                        ;
                    `,
					userPermissions.values
				);
				queryBatchConfigs.nextBatch();
			}

			await conn.commit();
			conn.release();
		} catch (err: any) {
			if (conn) {
				await conn.rollback();
				conn.release();
			}
			if ((err.hasOwnProperty('code') && err.code === 'ER_DUP_ENTRY') || (err.hasOwnProperty('errno') && err.errno === 1062))
				throw new ApiError(
					500,
					'Usuário já existe',
					new ApiLog(
						1,
						err.message,
						`${this.additionalRequestData.stack}/${this.className}->createUser`,
						this.additionalRequestData.timestamp,
						this.additionalRequestData.userRequesting
					)
				);
			else
				throw new ApiError(
					500,
					'Falha ao cadastrar usuário',
					new ApiLog(
						3,
						err.message,
						`${this.additionalRequestData.stack}/${this.className}->createUser`,
						this.additionalRequestData.timestamp,
						this.additionalRequestData.userRequesting
					)
				);
		}
	}
}

type Output_PrepareAccessBranches = {
	wildcards: string;
	values: number[];
};

type Output_PreparePermissions = {
	wildcards: string;
	values: number[];
};
