import { RowDataPacket } from 'mysql2';
import { Permission } from '../../../../core/utils/ApiUserPermission';
import { AdditionalRequestData } from '../../../../main';

export interface LoadEditUserInterface {
	additionalRequestData: AdditionalRequestData;

	getUser(data: Input_GetUser): Promise<Output_GetUser>;

	getAvailableBranches(): Promise<Output_GetAvailableBranches[]>;

	getAvailableUserPermissions(): Output_GetAvailableUserPermissions[];

	getActiveUsers(): Promise<Output_GetActiveUsers[]>;
}

export type Input_GetUser = {
	id_user: number;
};
export type Output_GetUser = {
	id: number;
	id_branch: number;
	is_admin_flag: boolean;
	username: string;
	name: string;
	email: string;
	access_branches: string;
};
export interface Mysql_Output_GetUser extends RowDataPacket {
	id: number;
	id_branch: number;
	is_admin_flag: number;
	username: string;
	name: string;
	email: string;
	access_branches: string;
}

export type Output_GetAvailableBranches = {
	value: number;
	label: string;
};
export interface Mysql_Output_GetAvailableBranches extends RowDataPacket {
	value: number;
	label: string;
}

export type Output_GetAvailableUserPermissions = {
	group: string;
	permissions: Permission[];
};

export type Output_GetActiveUsers = {
	value: number;
	label: string;
	group_label: string;
};
export interface Mysql_Output_GetActiveUsers extends RowDataPacket {
	value: number;
	label: string;
	group_label: string;
}
