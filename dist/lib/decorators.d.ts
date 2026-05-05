import { TransactionConfig } from './types';
export declare const TRANSACTION_METADATA_KEY = "transaction:config";
export declare function Transactional(config?: TransactionConfig): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function TransactionalService(): <T extends new (...args: any[]) => any>(constructor: T) => {
    new (...args: any[]): {
        [x: string]: any;
        _isTransactionalService: boolean;
    };
} & T;
export declare function RequireTransaction(): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function LogTransaction(logLevel?: 'debug' | 'log' | 'warn' | 'error'): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
