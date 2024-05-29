import { escapeId } from 'mysql2';
import { ApiError } from '../../../../core/exceptions/ApiError';
import { ApiLog } from '../../../../core/exceptions/ApiLog';
import { AdditionalRequestData } from '../../../../main';
import { MysqlAdapter } from '../../../adapters/Mysql';
import {
	Input_GetFieldByField,
	LoadFieldSuggestInterface,
	Mysql_Output_GetFieldByField__DoubleWild,
	Output_GetFieldByField__DoubleWild,
} from '../../abstrations/User/LoadFieldSuggest';

export class LoadFieldSuggestInterfaceMysql implements LoadFieldSuggestInterface {
	private className: string = 'LoadFieldSuggestInterfaceMysql';

	constructor(readonly additionalRequestData: AdditionalRequestData) {}

	async getFieldByField__DoubleWild(data: Input_GetFieldByField): Promise<Output_GetFieldByField__DoubleWild[]> {
		let column = escapeId(data.field);

		let [users] = await MysqlAdapter.connPool
			.execute<Mysql_Output_GetFieldByField__DoubleWild[]>(
				`
                    SELECT
                        \`user\`.${column} AS \`label\`,
                        \`user\`.${column} AS \`value\`
                    FROM \`user\`
                    WHERE
                        \`user\`.${column} LIKE ?
                    ORDER BY
                        \`user\`.${column}
                    ;
                `,
				[`%${data.value}%`]
			)
			.catch((err: any) => {
				throw new ApiError(
					500,
					'Falha ao trazer os dados',
					new ApiLog(
						3,
						err.message,
						`${this.additionalRequestData.stack}/${this.className}->getFieldByField__DoubleWild`,
						this.additionalRequestData.timestamp,
						this.additionalRequestData.userRequesting
					)
				);
			});
		return users;
	}
}
