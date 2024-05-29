import { User } from '../../../core/entities/User';
import { ApiError } from '../../../core/exceptions/ApiError';
import { ApiLog } from '../../../core/exceptions/ApiLog';
import { Input_CreateUser, EditUserInterface } from '../../../infra/interfaces/abstrations/User/EditUser';

export class EditUserUsecase {
	private className: string = 'EditUserUsecase';

	constructor(readonly newUserInterface: EditUserInterface) {}

	private checkInvalidFields(input: Input): void {
		let invalidFields: string[] = [];

		if (!User.isValidId(input.id_user.toString())) invalidFields.push('id_user');
		if (!!input.user.id_branch && !User.isValidIdBranch(input.user.id_branch.toString())) invalidFields.push('id_branch');
		if (!!input.user.is_admin_flag && !User.isValidIsAdminFlag(input.user.is_admin_flag.toString())) invalidFields.push('is_admin_flag');
		if (!!input.user.name && !User.isValidName(input.user.name)) invalidFields.push('name');
		if (!!input.user.username && !User.isValidUsername(input.user.username)) invalidFields.push('username');
		if (!!input.user.email && !User.isValidEmail(input.user.email)) invalidFields.push('email');
		if (!!input.user.password && !User.isValidPassword(input.user.password)) invalidFields.push('password');

		if (!!input.access_branches && !input.access_branches.join('').match(/[\d]+/)) invalidFields.push('access_branches');
		if (!!input.permissions && !input.permissions.join('').match(/[\d]+/)) invalidFields.push('permissions');

		if (invalidFields.length > 0)
			throw new ApiError(
				400,
				'Falha ao editar usuário',
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
		if (input.user.password !== undefined) input.user.password = User.sanitizePassword(input.user.password);
	}

	async execute(input: Input): Promise<void> {
		this.checkInvalidFields(input);
		this.sanitizeFields(input);
		await this.newUserInterface.createUser(input);
	}
}

type Input = Input_CreateUser;
