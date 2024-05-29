import 'dotenv/config';
import fs from 'fs';
import { Consts } from './core/services/Consts';
import { ExpressAdapter } from './infra/adapters/Express';
import { JwtAdapter } from './infra/adapters/Jwt';
import { LoggerAdapter } from './infra/adapters/LoggerFileSystem';
import { MysqlAdapter } from './infra/adapters/Mysql';
import { UserController } from './infra/http/controllers/User';

const serverInit = async () => {
	/***********************
	 * TRY TO READ ENV VARS
	 ***********************/
	let nodeEnv = process.env?.NODE_ENV ?? '';
	if (nodeEnv === '') throw `Catastrophic Failure: Discover the running environment\n[${new Date().toLocaleString('pt-BR')}]\nNODE_ENV is undefined or empty\n`;
	let nodeListenPortHttp = process.env?.NODE_LISTEN_PORT_HTTP ?? '';
	if (nodeListenPortHttp === '')
		throw `Catastrophic Failure: Discover the running environment\n[${new Date().toLocaleString('pt-BR')}]\nNODE_LISTEN_PORT_HTTP is undefined or empty\n`;
	let nodeListenPortHttps = process.env?.NODE_LISTEN_PORT_HTTPS ?? '';
	if (nodeListenPortHttps === '')
		throw `Catastrophic Failure: Discover the running environment\n[${new Date().toLocaleString('pt-BR')}]\nNODE_LISTEN_PORT_HTTPS is undefined or empty\n`;
	let apiUrl = process.env.API_URL ?? '';
	if (apiUrl === '') throw `Catastrophic Failure: Discover the running environment\n[${new Date().toLocaleString('pt-BR')}]\nAPI_URL is undefined or empty\n`;
	let jwtSecret = process.env.JWT_SECRET ?? '';
	if (jwtSecret === '') throw `Catastrophic Failure: Discover the running environment\n[${new Date().toLocaleString('pt-BR')}]\nJWT_SECRET is undefined or empty\n`;
	let jwtSecure = process.env.JWT_SECURE ?? '';
	if (jwtSecure === '') throw `Catastrophic Failure: Discover the running environment\n[${new Date().toLocaleString('pt-BR')}]\nJWT_SECURE is undefined or empty\n`;
	let dbHostname = process.env.DB_HOSTNAME ?? '';
	if (dbHostname === '') throw `Catastrophic Failure: Discover the running environment\n[${new Date().toLocaleString('pt-BR')}]\nDB_HOSTNAME is undefined or empty\n`;
	let dbPort = process.env.DB_PORT ?? '';
	if (dbPort === '') throw `Catastrophic Failure: Discover the running environment\n[${new Date().toLocaleString('pt-BR')}]\nDB_PORT is undefined or empty\n`;
	let dbUser = process.env.DB_USER ?? '';
	if (dbUser === '') throw `Catastrophic Failure: Discover the running environment\n[${new Date().toLocaleString('pt-BR')}]\nDB_USER is undefined or empty\n`;
	let dbPassword = process.env.DB_PASS ?? '';
	if (dbPassword === '') throw `Catastrophic Failure: Discover the running environment\n[${new Date().toLocaleString('pt-BR')}]\nDB_PASS is undefined or empty\n`;
	let dbName = process.env.DB_NAME ?? '';
	if (dbName === '') throw `Catastrophic Failure: Discover the running environment\n[${new Date().toLocaleString('pt-BR')}]\nDB_NAME is undefined or empty\n`;

	/******************************************
	 * INITIALIZE THE DATABASE CONNECTION POOL
	 ******************************************/
	let mysqlAdapter = new MysqlAdapter(dbHostname, parseInt(dbPort), dbUser, dbPassword, dbName);
	try {
		mysqlAdapter.test();
	} catch (err: any) {
		throw `Catastrophic Failure: Connect to Database\n[${new Date().toLocaleString('pt-BR')}]\n${JSON.stringify(err, null, 4)}\n`;
	}

	/************************
	 * INITIALIZE THE LOGGER
	 ************************/
	let loggerAdapter = new LoggerAdapter();
	try {
		await loggerAdapter.init(new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
	} catch (err: any) {
		throw `Catastrophic Failure: Fail to open log streams\n[${new Date().toLocaleString('pt-BR')}]\n${JSON.stringify(err, null, 4)}\n`;
	}

	/*******************************
	 * INITIALIZE THE TOKEN MANAGER
	 *******************************/
	let jwtAdapter = new JwtAdapter(jwtSecret, jwtSecure === 'true');

	/*****************************
	 * INITIALIZE THE HTTP SERVER
	 *****************************/
	let privateKey: any = undefined;
	let certificate: any = undefined;
	if (nodeEnv === Consts.ENV_PRODUCTION) {
		privateKey = fs.readFileSync('.letsencrypt/privKey.pem');
		certificate = fs.readFileSync('.letsencrypt/cert.pem');
	}
	const expressAdapter = new ExpressAdapter({ nodeEnv, apiUrl }, loggerAdapter, jwtAdapter);

	/*********
	 * ROUTES
	 *********/
	new UserController(expressAdapter, mysqlAdapter);

	expressAdapter.registerErrorCatchRoute();

	expressAdapter.listenHttp(nodeListenPortHttp);
	expressAdapter.listenHttps(nodeListenPortHttps, { key: privateKey, cert: certificate });
};

serverInit().catch((err) => {
	console.error(err);
	process.exit(1);
});
