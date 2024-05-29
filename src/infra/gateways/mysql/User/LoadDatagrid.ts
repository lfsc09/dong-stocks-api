import { Filter, Sorter } from '../../../../core/entities/Datagrid';
import { ApiError } from '../../../../core/exceptions/ApiError';
import { ApiLog } from '../../../../core/exceptions/ApiLog';
import { AdditionalRequestData } from '../../../../main';
import { MysqlAdapter } from '../../../adapters/Mysql';
import { LoadDatagridPresenter } from '../../../presenter/mysql/User/LoadDatagrid';
import {
	Input_GetRows,
	LoadDatagridInterface,
	Mysql_Output_GetFilteredAmountOfRows,
	Mysql_Output_GetRows,
	Mysql_Output_GetTotalAmountOfRows,
	Output_GetRows,
} from '../../abstrations/User/LoadDatagrid';

export class LoadDatagridInterfaceMysql implements LoadDatagridInterface {
	private className: string = 'LoadDatagridInterfaceMysql';
	private whereClause: { qString: string; qValues: (string | number)[] };
	private sortClause: string;

	constructor(readonly additionalRequestData: AdditionalRequestData, readonly loadDatagridPresenter: LoadDatagridPresenter, inicializationData: InitializationData) {
		this.whereClause = this.buildWhereClause(inicializationData.filters);
		this.sortClause = this.buildSortClause(inicializationData.sorters);
	}

	private buildWhereClause(filters: Filter): { qString: string; qValues: (string | number)[] } {
		if (Object.keys(filters).length === 0) return { qString: '', qValues: [] };

		let qValues: (string | number)[] = [];
		let qString: string = '';

		if ('deleted_flag' in filters) {
			let cString: string = '';
			for (let value of filters.deleted_flag) {
				cString += ` OR \`user\`.deleted_flag = ?`;
				qValues.push(value);
			}
			if (cString !== '') qString += ` AND (${cString.slice(4)})`;
		}

		if ('name' in filters) {
			let cString: string = '';
			for (let value of filters.name) {
				cString += ` OR \`user\`.name LIKE ?`;
				qValues.push(value);
			}
			if (cString !== '') qString += ` AND (${cString.slice(4)})`;
		}

		if ('username' in filters) {
			let cString: string = '';
			for (let value of filters.username) {
				cString += ` OR \`user\`.username LIKE ?`;
				qValues.push(value);
			}
			if (cString !== '') qString += ` AND (${cString.slice(4)})`;
		}

		if ('branch' in filters) {
			let cString: string = '';
			for (let value of filters.branch) {
				cString += ` OR \`branch\`.name LIKE ?`;
				qValues.push(value);
			}
			if (cString !== '') qString += ` AND (${cString.slice(4)})`;
		}

		if ('permission' in filters) {
			let cString: string = '';
			for (let value of filters.permission) {
				cString += ` OR \`user__permission\`.id_permission = ?`;
				qValues.push(value);
			}
			if (cString !== '') qString += ` AND (${cString.slice(4)})`;
		}

		return { qString: qString, qValues: qValues };
	}

	private buildSortClause(sorters: Sorter): string {
		if (Object.keys(sorters).length === 0) return '`user`.id';

		let sString: string = '';

		for (let colName in sorters) {
			if (colName === 'branch') sString += `, \`branch\`.name ${sorters[colName]}`;
			else sString += `, \`user\`.${colName} ${sorters[colName]}`;
		}

		return sString.slice(2);
	}

	async getTotalAmountOfRows(): Promise<number> {
		let [rowTotal] = await MysqlAdapter.connPool
			.execute<Mysql_Output_GetTotalAmountOfRows[]>(
				`
                    SELECT
                        COUNT(\`user\`.id) AS \`row_total\`
                    FROM \`user\`
                    ;
                `
			)
			.catch((err: any) => {
				throw new ApiError(
					500,
					'Falha ao trazer os dados',
					new ApiLog(
						3,
						err.message,
						`${this.additionalRequestData.stack}/${this.className}->getTotalAmountOfRows`,
						this.additionalRequestData.timestamp,
						this.additionalRequestData.userRequesting
					)
				);
			});
		if (rowTotal.length <= 0)
			throw new ApiError(
				500,
				'Falha ao trazer os dados',
				new ApiLog(
					3,
					'Failed to get `totalAmountOfRows`, should have returned a value',
					`${this.additionalRequestData.stack}/${this.className}->getTotalAmountOfRows`,
					this.additionalRequestData.timestamp,
					this.additionalRequestData.userRequesting
				)
			);
		return +rowTotal[0].row_total;
	}

	async getFilteredAmountOfRows(): Promise<number> {
		let [rowCount] = await MysqlAdapter.connPool
			.execute<Mysql_Output_GetFilteredAmountOfRows[]>(
				`
                    SELECT
                        COUNT(\`virt_user\`.id) AS \`row_count\`
                    FROM
                        (
                            SELECT
                                \`user\`.id
                            FROM \`user\`
                            INNER JOIN \`branch\`
                            ON
                                \`user\`.id_branch = \`branch\`.id
                            LEFT JOIN \`user__permission\`
                            ON
                                \`user\`.id = \`user__permission\`.id_user
                            WHERE 1=1
                                ${this.whereClause.qString}
                            GROUP BY
                                \`user\`.id
                        ) \`virt_user\`
                `,
				this.whereClause.qValues
			)
			.catch((err: any) => {
				throw new ApiError(
					500,
					'Falha ao trazer os dados',
					new ApiLog(
						3,
						err.message,
						`${this.additionalRequestData.stack}/${this.className}->getFilteredAmountOfRows`,
						this.additionalRequestData.timestamp,
						this.additionalRequestData.userRequesting
					)
				);
			});
		if (rowCount.length <= 0)
			throw new ApiError(
				500,
				'Falha ao trazer os dados',
				new ApiLog(
					3,
					'Failed to get `filteredAmountOfRows`, should have returned a value',
					`${this.additionalRequestData.stack}/${this.className}->getFilteredAmountOfRows`,
					this.additionalRequestData.timestamp,
					this.additionalRequestData.userRequesting
				)
			);
		return +rowCount[0].row_count;
	}

	async getRows(data: Input_GetRows): Promise<Output_GetRows[]> {
		const offset = data.page * data.page_size;

		let qValues = [...this.whereClause.qValues, offset, data.page_size];

		let [rows] = await MysqlAdapter.connPool
			.execute<Mysql_Output_GetRows[]>(
				`
                    SELECT
                        \`user\`.id,
                        \`user\`.deleted_flag,
                        \`user\`.is_admin_flag,
                        \`user\`.last_login_datetime,
                        \`user\`.name,
                        \`user\`.username,
                        \`branch\`.name AS \`branch\`

                    FROM \`user\`

                    INNER JOIN \`branch\`
                    ON
                        \`user\`.id_branch = \`branch\`.id

                    LEFT JOIN \`user__permission\`
                    ON
                        \`user\`.id = \`user__permission\`.id_user

                    WHERE 1=1
                        ${this.whereClause.qString}

                    GROUP BY
                        \`user\`.id

                    ORDER BY
                        ${this.sortClause}

                    LIMIT ?, ?
                    ;
                `,
				qValues
			)
			.catch((err: any) => {
				throw new ApiError(
					500,
					'Falha ao trazer os dados',
					new ApiLog(
						3,
						err.message,
						`${this.additionalRequestData.stack}/${this.className}->getRows`,
						this.additionalRequestData.timestamp,
						this.additionalRequestData.userRequesting
					)
				);
			});
		return this.loadDatagridPresenter.getRows(rows);
	}
}

type InitializationData = {
	filters: Filter;
	sorters: Sorter;
};
