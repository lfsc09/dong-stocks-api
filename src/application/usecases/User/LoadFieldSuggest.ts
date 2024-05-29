import { ApiError } from '../../../core/exceptions/ApiError';
import { ApiLog } from '../../../core/exceptions/ApiLog';
import { LoadFieldSuggestInterface, Output_GetFieldByField__DoubleWild } from '../../../infra/interfaces/abstrations/User/LoadFieldSuggest';

export class LoadFieldSuggestUsecase {
	private className: string = 'LoadFieldSuggestUsecase';

	constructor(readonly loadFieldSuggestInterface: LoadFieldSuggestInterface) {}

	async execute(input: Input): Promise<Output> {
		let rows = undefined;

		switch (input.place) {
			case 'user__filter__name':
			case 'user__filter__username':
				rows = await this.loadFieldSuggestInterface.getFieldByField__DoubleWild({ field: input.field, value: input.value });
				break;
			default:
				throw new ApiError(
					400,
					'Falha ao trazer os dados',
					new ApiLog(
						1,
						'The `place` not specified or incorrect in the post params',
						`${this.loadFieldSuggestInterface.additionalRequestData.stack}/${this.className}->execute`,
						this.loadFieldSuggestInterface.additionalRequestData.timestamp,
						this.loadFieldSuggestInterface.additionalRequestData.userRequesting
					)
				);
		}

		return { suggestion: rows };
	}
}

type Input = {
	place: string;
	field: string;
	value: string;
};

type Output = {
	suggestion: Output_GetFieldByField__DoubleWild[];
};
