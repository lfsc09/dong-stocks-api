import { LoadDetailsInterface } from '../../../infra/interfaces/abstrations/User/LoadDetails';

export class LoadDetailsUsecase {
	constructor(readonly loadDetailsInterface: LoadDetailsInterface) {}

	async execute(input: Input): Promise<Output> {
		let userRow = await this.loadDetailsInterface.getDetails(input);
		let userBranches = await this.loadDetailsInterface.getBranchesWithAccess(input);

		return { user: { ...userRow, access_branches: userBranches } };
	}
}

type Input = {
	id_user: number;
};

type Output = {
	user: {
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
		access_branches: string;
	};
};
