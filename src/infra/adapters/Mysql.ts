import { createPool } from 'mysql2';
import { Database } from './abstractions/Database';

export class MysqlAdapter implements Database {
	private connectionPool: any;

	constructor(host: string, port: number, user: string, password: string, database: string) {
		this.connectionPool = createPool({ host, port, user, password, database }).promise();
	}

	async test(): Promise<void> {
		let conn = await this.connectionPool.getConnection();
		conn.release();
	}

	async execute(query: string, values: any): Promise<any> {
		return this.connectionPool.execute(query, values);
	}

	getPool() {
		return this.connectionPool;
	}
}

/**
 * Class to create a batching controller, to break giant `prepared statements` that will result in hundreds of wildcards, and even more values in arrays
 *
 * @var {number} batchIdx                   - [Current batch index]
 * @var {[number, number]} batchInnerLimits - [The begin and end indexes to walk in the current batch]
 * @var {number} dataLeftLength             - [The amount of left data to be transformed to wildcards after each batch iteration]
 */
export class InsertBatchConfig {
	private batchIdx: number = 0;
	private batchInnerLimits: [number, number];
	private dataLeftLength: number;

	/**
	 * @param {number} maxLengthPerBatch - [Max batch size]
	 * @param {number} dataLength        - [The total number of data to transfered to wildcards]
	 */
	constructor(private maxLengthPerBatch: number, readonly dataLength: number) {
		this.dataLeftLength = maxLengthPerBatch <= 0 ? 0 : dataLength;
		this.batchInnerLimits = this.recalcInnerLimits();
	}

	private recalcInnerLimits(): [number, number] {
		let initial = this.batchIdx * this.maxLengthPerBatch;
		return [initial, this.dataLeftLength < this.maxLengthPerBatch ? initial + this.dataLeftLength - 1 : initial + this.maxLengthPerBatch - 1];
	}

	currentBatch(): [number, number] {
		return this.batchInnerLimits;
	}

	nextBatch(): void {
		this.batchIdx++;
		this.dataLeftLength = this.dataLeftLength < this.maxLengthPerBatch ? 0 : this.dataLeftLength - this.maxLengthPerBatch;
		this.batchInnerLimits = this.recalcInnerLimits();
	}

	hasNext(): boolean {
		return this.dataLeftLength > 0;
	}
}
