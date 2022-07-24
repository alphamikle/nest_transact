"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aShowConfig = exports.Config = void 0;
const dotenv_1 = require("dotenv");
const fs_1 = require("fs");
const path_1 = require("path");
const common_1 = require("@nestjs/common");
(0, dotenv_1.config)();
const envPath = (0, path_1.resolve)(__dirname, '..', `.env`);
const envConfig = (0, dotenv_1.parse)((0, fs_1.readFileSync)(envPath));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}
const { DB_TYPE, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;
class Config {
}
exports.Config = Config;
Config.dbType = DB_TYPE;
Config.dbPort = Number(DB_PORT);
Config.dbUsername = DB_USERNAME;
Config.dbPassword = DB_PASSWORD;
Config.dbName = DB_NAME;
Config.typeOrmConfig = {
    type: Config.dbType,
    host: 'localhost',
    port: Config.dbPort,
    username: Config.dbUsername,
    password: Config.dbPassword,
    database: Config.dbName,
    entities: [`${__dirname}/**/*.model{.ts,.js}`],
    logging: [
        'error',
        'warn',
    ],
    synchronize: true,
};
const aShowConfig = () => {
    common_1.Logger.log('Config initialized', 'Config');
};
exports.aShowConfig = aShowConfig;
//# sourceMappingURL=config.js.map