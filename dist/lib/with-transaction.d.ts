import 'reflect-metadata';
import { EntityManager } from 'typeorm';
import { ModuleRef } from '@nestjs/core';
type ClassType<T = any> = new (...args: any[]) => T;
export declare class TransactionDependencyError extends Error {
    readonly param: unknown;
    constructor(message: string, param: unknown);
}
export declare class TransactionRepositoryError extends Error {
    readonly repositoryName: string;
    constructor(message: string, repositoryName: string);
}
export interface WithTransactionOptions {
    excluded?: ClassType[];
}
export declare class TransactionFor<T = any> {
    private moduleRef;
    private readonly logger;
    private cache;
    private static readonly metadataCache;
    constructor(moduleRef: ModuleRef);
    withTransaction(manager: EntityManager, transactionOptions?: WithTransactionOptions): this;
    private getArgument;
    private isForwardRef;
    private resolveForwardRef;
    private extractDependencyId;
    private isDependencyExcluded;
    private resolveDependency;
    private resolveRepositoryOrService;
    private createTransactionalRepository;
    private findArgumentsForProvider;
    private resolveConstructorArguments;
    private getParameterTypes;
    private getSelfDeclaredTypes;
    private getSelfDeclaredTypesInternal;
    private processParameterTypes;
    private handleMissingParameterTypes;
    private extractParameterNames;
    private extractSelfDeclaredNames;
    static clearMetadataCache(): void;
    static getCacheStats(): {
        size: number;
        keys: string[];
    };
    static isTransactional(instance: any): instance is TransactionFor;
}
export {};
