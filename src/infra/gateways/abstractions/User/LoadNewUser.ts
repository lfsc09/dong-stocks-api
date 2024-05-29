import { RowDataPacket } from 'mysql2';
import { Permission } from '../../../../core/utils/ApiUserPermission';
import { AdditionalRequestData } from '../../../../main';

export interface LoadNewUserInterface {
	additionalRequestData: AdditionalRequestData;

	getAvailableBranches(): Promise<Output_GetAvailableBranches[]>;

	getAvailableUserPermissions(): Output_GetAvailableUserPermissions[];

	getActiveUsers(): Promise<Output_GetActiveUsers[]>;
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
