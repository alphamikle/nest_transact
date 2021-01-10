import { config, parse } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

config();

const { NODE_ENV } = process.env;

const envPath = resolve(__dirname, '..', `.env.${NODE_ENV}`);
const envConfig = parse(readFileSync(envPath));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const { DB_TYPE, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_LOG_LEVEL } = process.env;

export class Config {
  static nodeEnv = NODE_ENV;
  static dbType = DB_TYPE;
  static dbPort = Number(DB_PORT);
  static dbUsername = DB_USERNAME;
  static dbPassword = DB_PASSWORD;
  static dbName = DB_NAME;
  static dbLogLevel = DB_LOG_LEVEL ?? 'all';

  static typeOrmConfig: TypeOrmModuleOptions = {
    type: Config.dbType,
    host: 'localhost',
    port: Config.dbPort,
    username: Config.dbUsername,
    password: Config.dbPassword,
    database: Config.dbName,
    entities: [`${__dirname}/**/*.model{.ts,.js}`],
    logging: Config.dbLogLevel,
    synchronize: true,
  } as TypeOrmModuleOptions;
}

export const aShowConfig = () => {
  console.log(Config);
};