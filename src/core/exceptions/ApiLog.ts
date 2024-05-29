import { UserRequesting } from '../../main';

/**
 * @var {number}         severity       - [The severity of the error; 1: Minor error, 2: A function might have had thrown an error, 3: DB errors or other critical failures]
 * @var {string}         message        - [Error message]
 * @var {string}         stack          - [Stack sequence of the functions called from app]
 * @var {string}         timestamp      - [Timestamp of error in pt-BR datetime format]
 * @var {UserRequesting} userRequesting - [The ID and USERNAME of the user that made the request; It can be UNDEFINED]
 */
export class ApiLog {
	private timestamp: string | undefined;
	private static severityLabels = ['_INFO_', '_WARN_', '__CRITICAL__'];

	constructor(
		private readonly severity: 1 | 2 | 3,
		private readonly message: string,
		private readonly stack: string,
		timestamp: string | undefined = undefined,
		private readonly userRequesting: UserRequesting | undefined = undefined
	) {
		this.timestamp = timestamp === undefined ? new Date().toLocaleString('pt-BR') : timestamp;
	}

	/**
	 * @var ts  - [Timestamp]
	 * @var sv  - [Severity]
	 * @var stk - [Origin stack]
	 * @var uID - [User Requesting ID]
	 * @var uUN - [User Requesting USERNAME]
	 * @var msg - [Message]
	 */
	toString() {
		return `ts[[${this.timestamp}]] sv[[${ApiLog.severityLabels[this.severity - 1]}]] stk[[${this.stack}]] uID[[${this.userRequesting?.id ?? -1}]] uUN[[${
			this.userRequesting?.username ?? 'Unknown'
		}]] msg[[${this.message}]]\n`;
	}

	toObject() {
		return {
			timestamp: this.timestamp,
			severity: ApiLog.severityLabels[this.severity - 1],
			message: this.message,
			stack: this.stack,
			userRequesting: {
				id: this.userRequesting?.id ?? -1,
				username: this.userRequesting?.username ?? 'Unknown',
			},
		};
	}

    getSeverity() {
        return this.severity;
    }
}
