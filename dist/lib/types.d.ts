import { EntityManager } from 'typeorm';
export type TransactionCallback<T> = (manager: EntityManager) => Promise<T>;
export interface ITransactional<T = any> {
    withTransaction(manager: EntityManager, options?: any): T;
}
export declare function isTransactional<T>(obj: any): obj is ITransactional<T>;
export declare function TransactionalMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor;
export interface TransactionConfig {
    timeout?: number;
    isolationLevel?: 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE';
    enableLogging?: boolean;
    maxRetries?: number;
}
export interface TransactionResult<T> {
    data: T;
    duration: number;
    attempts: number;
    wasRolledBack: boolean;
}
export interface TransactionStats {
    totalTransactions: number;
    successfulTransactions: number;
    rolledBackTransactions: number;
    averageDuration: number;
    errorCount: number;
}
