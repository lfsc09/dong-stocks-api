import { RowDataPacket } from 'mysql2';
import { AdditionalRequestData } from '../../../../main';

export interface LoadDatagridInterface {
	additionalRequestData: AdditionalRequestData;

	getTotalAmountOfRows(): Promise<number>;

	getFilteredAmountOfRows(): Promise<number>;

	getRows(data: Input_GetRows): Promise<Output_GetRows[]>;
}

export interface Mysql_Output_GetTotalAmountOfRows extends RowDataPacket {
	row_total: number;
}

export interface Mysql_Output_GetFilteredAmountOfRows extends RowDataPacket {
	row_count: number;
}

export type Input_GetRows = {
	page: number;
	page_size: number;
};
export type Output_GetRows = {
	id: number;
	deleted_flag: boolean;
	id_admin_flag: boolean;
	name: string;
	username: string;
	branch: string;
	last_login_datetime: string;
};
export interface Mysql_Output_GetRows extends RowDataPacket {
	id: number;
	deleted_flag: number;
	id_admin_flag: number;
	name: string;
	username: string;
	branch: string;
	last_login_datetime: string;
}
