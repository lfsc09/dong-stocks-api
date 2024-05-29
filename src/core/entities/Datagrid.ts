export class Datagrid {}

/**
 * Ex.: { col_name: ['Val1', 'Val2', ...] }
 */
export type Filter = {
	[key: string]: (string | number)[];
};

/**
 * Ex.: { col_name: ASC }
 */
export type Sorter = {
	[key: string]: 'ASC' | 'DESC';
};
