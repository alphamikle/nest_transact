import { TypeOrmModuleOptions } from '@nestjs/typeorm';
export declare class Config {
    static dbType: string;
    static dbPort: number;
    static dbUsername: string;
    static dbPassword: string;
    static dbName: string;
    static typeOrmConfig: TypeOrmModuleOptions;
}
export declare const aShowConfig: () => void;
