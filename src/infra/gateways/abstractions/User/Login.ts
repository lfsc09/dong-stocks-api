import { RowDataPacket } from 'mysql2';

export interface LoginInterface {
    readonly additionalRequestData: AdditionalRequestData;
	getByUsername(username: string): Promise<Output_GetByUsername>;
	getPermissions(id: number): Promise<Out_GetPermissions[]>;
	updateUserLogged(data: Input_UpdateUserLogged): Promise<void>;
}

export type AdditionalRequestData = {
	ipv4_address: string;
	timestamp: string;
	stack: string;
};

export type Output_GetByUsername = {
	id: number;
	is_admin_flag: boolean;
	username: string;
	name: string;
	password: string;
	configs_json: string;
};
export interface Mysql_Output_GetByUsername extends RowDataPacket {
	id: number;
	is_admin_flag: number;
	username: string;
	name: string;
	password: string;
	configs_json: string;
}

export type Out_GetPermissions = {
	id_permission: number;
};
export interface Mysql_Out_GetPermissions extends RowDataPacket {
	id_permission: number;
}

export type Input_UpdateUserLogged = {
	id_user: number;
	ipv4_address: string;
};
