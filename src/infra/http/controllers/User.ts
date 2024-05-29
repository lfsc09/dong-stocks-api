import { Database } from "../../adapters/abstractions/Database";
import { Input_RouteData, WebServer } from "../../adapters/abstractions/WebServer";

export class UserController {
	private className: string = 'UserController';

	constructor(webServer: WebServer, database: Database) {
		const className = this.className;

		/**
		 * Authenticate a user and returns a new token for him
		 */
		webServer.registerRoute('post', '/auth', { callerStack: `${className}->authenticate` }, [], async function (routeData: Input_RouteData) {
			const additionalRequestData = {
				ipv4_address: routeData.fingerprint.ipv4Address,
				timestamp: routeData.requestTimestamp,
				stack: `${className}->authenticate`,
			};
			const input = {
				username: routeData.body?.username ?? '',
				password: routeData.body?.password ?? '',
			};
			const loginInterface = new LoginInterfaceMysql(database, additionalRequestData);
			let output = await new LoginUsecase(loginInterface, webServer.logger, webServer.tokenManager).execute(input);
			return output;
		});
	}
}
