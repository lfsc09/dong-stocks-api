import { LoadEditUserInterface, Output_GetUser } from '../../../infra/interfaces/abstrations/User/LoadEditUser';
import { Output_GetActiveUsers, Output_GetAvailableBranches, Output_GetAvailableUserPermissions } from '../../../infra/interfaces/abstrations/User/LoadNewUser';

export class LoadEditUserUsecase {
	constructor(readonly loadEditUserInterface: LoadEditUserInterface) {}

	async execute(input: Input): Promise<Output> {
		let user = await this.loadEditUserInterface.getUser(input);
		let selectBranches = await this.loadEditUserInterface.getAvailableBranches();
		let selectUsers = await this.loadEditUserInterface.getActiveUsers();
		let selectPermissions = this.loadEditUserInterface.getAvailableUserPermissions();

		return { user, branches: selectBranches, permissions: selectPermissions, users: selectUsers };
	}
}

type Input = {
	id_user: number;
};

type Output = {
	user: Output_GetUser;
	branches: Output_GetAvailableBranches[];
	permissions: Output_GetAvailableUserPermissions[];
	users: Output_GetActiveUsers[];
};
