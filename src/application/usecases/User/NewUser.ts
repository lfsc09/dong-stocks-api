import { User } from '../../../core/entities/User';
import { ApiError } from '../../../core/exceptions/ApiError';
import { ApiLog } from '../../../core/exceptions/ApiLog';
import { Input_CreateUser, NewUserInterface } from '../../../infra/interfaces/abstrations/User/NewUser';

export class NewUserUsecase {
	private className: string = 'NewUserUsecase';

	constructor(readonly newUserInterface: NewUserInterface) {}

	private checkInvalidFields(input: Input): void {
		let invalidFields: string[] = [];

		if (!User.isValidIdBranch(input.user.id_branch.toString())) invalidFields.push('id_branch');
		if (!User.isValidIsAdminFlag(input.user.is_admin_flag.toString())) invalidFields.push('is_admin_flag');
		if (!User.isValidName(input.user.name)) invalidFields.push('name');
		if (!User.isValidUsername(input.user.username)) invalidFields.push('username');
		if (!User.isValidEmail(input.user.email)) invalidFields.push('email');
		if (!User.isValidPassword(input.user.password)) invalidFields.push('password');

		if (!input.access_branches.join('').match(/[\d]+/)) invalidFields.push('access_branches');
		if (!input.permissions.join('').match(/[\d]+/)) invalidFields.push('permissions');

		if (invalidFields.length > 0)
			throw new ApiError(
				400,
				'Falha ao cadastrar usuário',
				new ApiLog(
					1,
					`Invalid fields: ${invalidFields.join(', ')}`,
					`${this.newUserInterface.additionalRequestData.stack}/${this.className}->checkInvalidFields`,
					this.newUserInterface.additionalRequestData.timestamp,
					this.newUserInterface.additionalRequestData.userRequesting
				)
			);
	}

	private sanitizeFields(input: Input): void {
		input.user.configs_json = JSON.stringify(User.createConfigJson());
		input.user.password = User.sanitizePassword(input.user.password);
	}

	async execute(input: Input): Promise<void> {
		this.checkInvalidFields(input);
		this.sanitizeFields(input);
		await this.newUserInterface.createUser(input);
	}
}

type Input = Input_CreateUser;
