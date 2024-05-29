export interface Database {
	test(): Promise<void>;
	execute(query: string, values: any): Promise<any>;
}
