import { Filter, Sorter } from '../../../core/entities/Datagrid';
import { LoadDatagridInterface, Output_GetRows } from '../../../infra/interfaces/abstrations/User/LoadDatagrid';

export class LoadDatagridUsecase {
	constructor(readonly loadDatagridInterface: LoadDatagridInterface) {}

	async execute(input: Input): Promise<Output> {
		let row_total = await this.loadDatagridInterface.getTotalAmountOfRows();
		let row_count = await this.loadDatagridInterface.getFilteredAmountOfRows();
		let rows = await this.loadDatagridInterface.getRows({ page: input.page, page_size: input.page_size });

		return { row_total: <number>row_total, row_count: <number>row_count, rows: rows };
	}
}

type Input = {
	page: number;
	page_size: number;
	filters: Filter;
	sorters: Sorter;
};

type Output = {
	row_total: number;
	row_count: number;
	rows: Output_GetRows[];
};
