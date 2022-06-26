import { config, parse } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';

config();

const envPath = resolve(__dirname, '..', `.env`);
const envConfig = parse(readFileSync(envPath));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const { DB_TYPE, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

export class Config {
  static dbType = DB_TYPE;
  static dbPort = Number(DB_PORT);
  static dbUsername = DB_USERNAME;
  static dbPassword = DB_PASSWORD;
  static dbName = DB_NAME;

  static typeOrmConfig: TypeOrmModuleOptions = {
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
  } as TypeOrmModuleOptions;
}

export const aShowConfig = () => {
  Logger.log('Config initialized', 'Config');
};