import {
	LoadNewUserInterface,
	Output_GetActiveUsers,
	Output_GetAvailableBranches,
	Output_GetAvailableUserPermissions,
} from '../../../infra/interfaces/abstrations/User/LoadNewUser';

export class LoadNewUserUsecase {
	constructor(readonly loadNewUserInterface: LoadNewUserInterface) {}

	async execute(): Promise<Output> {
		let selectBranches = await this.loadNewUserInterface.getAvailableBranches();
		let selectUsers = await this.loadNewUserInterface.getActiveUsers();
		let selectPermissions = this.loadNewUserInterface.getAvailableUserPermissions();

		return { branches: selectBranches, permissions: selectPermissions, users: selectUsers };
	}
}

type Output = {
	branches: Output_GetAvailableBranches[];
	permissions: Output_GetAvailableUserPermissions[];
	users: Output_GetActiveUsers[];
};
