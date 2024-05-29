import { ApiLog } from '../../../core/exceptions/ApiLog';

export interface Logger {
	init(currDate: string): void;
	write(apiLog: ApiLog): void;
}
