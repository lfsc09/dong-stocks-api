import { RowDataPacket } from 'mysql2';
import { AdditionalRequestData } from '../../../../main';

export interface LoadFieldSuggestInterface {
	additionalRequestData: AdditionalRequestData;

	getFieldByField__DoubleWild(data: Input_GetFieldByField): Promise<Output_GetFieldByField__DoubleWild[]>;
}

export type Input_GetFieldByField = {
	field: string;
	value: string;
};
export type Output_GetFieldByField__DoubleWild = {
	value: string;
	label: string;
};
export interface Mysql_Output_GetFieldByField__DoubleWild extends RowDataPacket {
	value: string;
	label: string;
}
