import { RowDataPacket } from 'mysql2';
import { AdditionalRequestData } from '../../../../main';

export interface LoadDetailsInterface {
	additionalRequestData: AdditionalRequestData;

	getDetails(data: Input_GetDetails): Promise<Output_GetDetails>;

	getBranchesWithAccess(data: Input_GetBranchesWithAccess): Promise<Output_GetBranchesWithAccess>;
}

export type Input_GetDetails = {
	id_user: number;
};
export type Output_GetDetails = {
	id: number;
	deleted_flag: boolean;
	is_admin_flag: boolean;
	last_login_datetime: string;
	login_count: number;
	username: string;
	name: string;
	email: string;
	insert_datetime: string;
	update_datetime: string;
	deleted_datetime: string;
	password: string;
	login_ipv4_address: string;
	branch: string;
};
export interface Mysql_Output_GetDetails extends RowDataPacket {
	id: number;
	deleted_flag: number;
	is_admin_flag: number;
	login_count: number;
	username: string;
	name: string;
	email: string;
	insert_datetime: string;
	update_datetime: string;
	deleted_datetime: string;
	password: string;
	login_ipv4_address: string;
	last_login_time: string;
	branch: string;
}

export type Input_GetBranchesWithAccess = {
	id_user: number;
};
export type Output_GetBranchesWithAccess = string;
export interface Mysql_GetBranchesWithAccess extends RowDataPacket {
	access_branch: number;
}
