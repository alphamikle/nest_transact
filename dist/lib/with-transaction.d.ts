import { EntityManager } from 'typeorm';
import { ModuleRef } from '@nestjs/core';
declare type ClassType<T = any> = new (...args: any[]) => T;
export interface WithTransactionOptions {
    excluded?: ClassType[];
}
export declare class TransactionFor<T = any> {
    private moduleRef;
    private cache;
    constructor(moduleRef: ModuleRef);
    withTransaction(manager: EntityManager, transactionOptions?: WithTransactionOptions): this;
    private getArgument;
    private findArgumentsForProvider;
}
export {};
