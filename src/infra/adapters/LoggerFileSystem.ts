import { WriteStream, createWriteStream, existsSync } from 'fs';
import { mkdirp } from 'mkdirp';
import { ApiLog } from '../../core/exceptions/ApiLog';
import { Logger } from './abstractions/Logger';

export class LoggerAdapter implements Logger {
	private logInfoWriteStream: WriteStream | undefined = undefined;
	private logErrorWriteStream: WriteStream | undefined = undefined;
	private currDate: string = '';

	constructor() {}

	async init(currDate: string): Promise<void> {
		this.currDate = currDate;

		if (this.logInfoWriteStream) this.logInfoWriteStream.end();
		if (this.logErrorWriteStream) this.logErrorWriteStream.end();

		const filename = `${currDate}.log`;

		try {
			await mkdirp('logs/info');
			if (!existsSync('logs/info')) throw { message: 'Error creating log folder `logs/info`' };

			await mkdirp('logs/error');
			if (!existsSync('logs/error')) throw { message: 'Error creating log folder `logs/error`' };

			this.logInfoWriteStream = createWriteStream(`logs/info/${filename}`, { flags: 'a' });
			this.logErrorWriteStream = createWriteStream(`logs/error/${filename}`, { flags: 'a' });
		} catch (err: any) {
			throw err;
		}
	}

	async write(apiLog: ApiLog): Promise<void> {
		const currDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

		if (this.currDate === undefined || this.logErrorWriteStream === undefined || this.logInfoWriteStream === undefined || this.currDate !== currDate) await this.init(currDate);

		const severity = apiLog.getSeverity();
		if (severity === 1) this.logInfoWriteStream!.write(apiLog.toString());
		else if (severity === 2 || severity === 3) this.logErrorWriteStream!.write(apiLog.toString());
	}
}
