import { AdditionalRequestData } from '../../../../main';

export interface NewUserInterface {
	additionalRequestData: AdditionalRequestData;

	createUser(data: Input_CreateUser): Promise<void>;
}

export type Input_CreateUser = {
	user: {
		id_branch: number;
		is_admin_flag: number;
		username: string;
		name: string;
		email: string;
		password: string;
		configs_json?: string;
	};
	access_branches: number[];
	permissions: number[];
};
