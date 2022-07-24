import { TypeOrmModuleOptions } from '@nestjs/typeorm';
export declare class Config {
    static dbType: string | undefined;
    static dbPort: number;
    static dbUsername: string | undefined;
    static dbPassword: string | undefined;
    static dbName: string | undefined;
    static typeOrmConfig: TypeOrmModuleOptions;
}
export declare const aShowConfig: () => void;
