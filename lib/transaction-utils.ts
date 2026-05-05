/**
 * Утилиты для работы с транзакциями
 */

import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { TransactionCallback, TransactionConfig, TransactionResult, TransactionStats } from './types';

/**
 * Утилитарный класс для работы с транзакциями
 */
@Injectable()
export class TransactionUtils {
  private readonly logger = new Logger(TransactionUtils.name);
  private stats: TransactionStats = {
    totalTransactions: 0,
    successfulTransactions: 0,
    rolledBackTransactions: 0,
    averageDuration: 0,
    errorCount: 0,
  };

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Выполняет функцию в транзакции с дополнительными возможностями
   * 
   * @param callback - Функция для выполнения в транзакции
   * @param config - Конфигурация транзакции
   * @returns Результат выполнения с метаданными
   */
  async executeWithTransaction<T>(
    callback: TransactionCallback<T>,
    config: TransactionConfig = {}
  ): Promise<TransactionResult<T>> {
    const startTime = Date.now();
    let attempts = 0;
    const maxRetries = config.maxRetries ?? 1;
    let lastError: Error | null = null;
    let wasRolledBack = false;

    this.stats.totalTransactions++;

    while (attempts < maxRetries) {
      attempts++;
      const queryRunner = this.dataSource.createQueryRunner();
      
      try {
        await queryRunner.connect();
        await this.configureTransaction(queryRunner, config);
        await queryRunner.startTransaction();

        if (config.enableLogging) {
          this.logger.debug(`Transaction started (attempt ${attempts}/${maxRetries})`);
        }

        const result = await this.executeWithTimeout(
          () => callback(queryRunner.manager),
          config.timeout
        );

        await queryRunner.commitTransaction();
        
        const duration = Date.now() - startTime;
        this.updateSuccessStats(duration);

        if (config.enableLogging) {
          this.logger.debug(`Transaction committed successfully in ${duration}ms`);
        }

        return {
          data: result,
          duration,
          attempts,
          wasRolledBack,
        };

      } catch (error) {
        lastError = error as Error;
        wasRolledBack = true;
        
        try {
          await queryRunner.rollbackTransaction();
          if (config.enableLogging) {
            this.logger.warn(`Transaction rolled back (attempt ${attempts}/${maxRetries}): ${lastError.message}`);
          }
        } catch (rollbackError) {
          this.logger.error('Failed to rollback transaction', rollbackError);
        }

        // Если это последняя попытка или ошибка не подлежит повтору
        if (attempts >= maxRetries || !this.isRetryableError(lastError)) {
          break;
        }

        // Ждем перед повторной попыткой
        await this.delay(this.calculateRetryDelay(attempts));

      } finally {
        await queryRunner.release();
      }
    }

    const duration = Date.now() - startTime;
    this.updateErrorStats();

    throw new Error(
      `Transaction failed after ${attempts} attempts: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Выполняет несколько операций в одной транзакции
   * 
   * @param operations - Массив операций для выполнения
   * @param config - Конфигурация транзакции
   * @returns Массив результатов
   */
  async executeBatch<T>(
    operations: TransactionCallback<T>[],
    config: TransactionConfig = {}
  ): Promise<T[]> {
    return this.executeWithTransaction(async (manager) => {
      const results: T[] = [];
      
      for (const operation of operations) {
        const result = await operation(manager);
        results.push(result);
      }
      
      return results;
    }, config).then(result => result.data);
  }

  /**
   * Возвращает статистику использования транзакций
   */
  getStats(): TransactionStats {
    return { ...this.stats };
  }

  /**
   * Сбрасывает статистику
   */
  resetStats(): void {
    this.stats = {
      totalTransactions: 0,
      successfulTransactions: 0,
      rolledBackTransactions: 0,
      averageDuration: 0,
      errorCount: 0,
    };
  }

  private async configureTransaction(queryRunner: QueryRunner, config: TransactionConfig): Promise<void> {
    if (config.isolationLevel) {
      await queryRunner.query(`SET TRANSACTION ISOLATION LEVEL ${config.isolationLevel}`);
    }
  }

  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeout?: number
  ): Promise<T> {
    if (!timeout) {
      return operation();
    }

    return Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Transaction timeout after ${timeout}ms`)), timeout);
      }),
    ]);
  }

  private isRetryableError(error: Error): boolean {
    const retryableErrors = [
      'deadlock',
      'lock timeout',
      'connection lost',
      'connection reset',
    ];

    return retryableErrors.some(pattern => 
      error.message.toLowerCase().includes(pattern)
    );
  }

  private calculateRetryDelay(attempt: number): number {
    // Экспоненциальная задержка: 100ms, 200ms, 400ms, ...
    return Math.min(100 * Math.pow(2, attempt - 1), 5000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private updateSuccessStats(duration: number): void {
    this.stats.successfulTransactions++;
    this.updateAverageDuration(duration);
  }

  private updateErrorStats(): void {
    this.stats.errorCount++;
    this.stats.rolledBackTransactions++;
  }

  private updateAverageDuration(duration: number): void {
    const total = this.stats.successfulTransactions;
    this.stats.averageDuration = 
      (this.stats.averageDuration * (total - 1) + duration) / total;
  }
}
