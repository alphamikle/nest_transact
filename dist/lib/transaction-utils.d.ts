import { DataSource } from 'typeorm';
import { TransactionCallback, TransactionConfig, TransactionResult, TransactionStats } from './types';
export declare class TransactionUtils {
    private readonly dataSource;
    private readonly logger;
    private stats;
    constructor(dataSource: DataSource);
    executeWithTransaction<T>(callback: TransactionCallback<T>, config?: TransactionConfig): Promise<TransactionResult<T>>;
    executeBatch<T>(operations: TransactionCallback<T>[], config?: TransactionConfig): Promise<T[]>;
    getStats(): TransactionStats;
    resetStats(): void;
    private configureTransaction;
    private executeWithTimeout;
    private isRetryableError;
    private calculateRetryDelay;
    private delay;
    private updateSuccessStats;
    private updateErrorStats;
    private updateAverageDuration;
}
