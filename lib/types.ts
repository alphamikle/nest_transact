/**
 * Дополнительные типы и утилиты для nest-transact
 */

import { EntityManager } from 'typeorm';
import { TransactionFor } from './with-transaction';

/**
 * Тип для функции, которая выполняется в транзакции
 */
export type TransactionCallback<T> = (manager: EntityManager) => Promise<T>;

/**
 * Интерфейс для сервиса, который поддерживает транзакции
 */
export interface ITransactional<T = any> {
  withTransaction(manager: EntityManager, options?: any): T;
}

/**
 * Тип-гард для проверки, является ли объект транзакционным
 */
export function isTransactional<T>(obj: any): obj is ITransactional<T> {
  return obj && typeof obj.withTransaction === 'function';
}

/**
 * Простой декоратор для проверки транзакционного контекста (устарел, используйте декораторы из ./decorators)
 * @deprecated Используйте декораторы из ./decorators
 */
export function TransactionalMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (this: TransactionFor<any>, ...args: any[]) {
    // Если уже в транзакции, просто выполняем метод
    if (this.constructor.name.includes('Transactional')) {
      return originalMethod.apply(this, args);
    }

    // Иначе нужно обернуть в транзакцию
    throw new Error(`Method ${propertyKey} requires transaction context. Use withTransaction() first.`);
  };

  return descriptor;
}

/**
 * Опции для конфигурации транзакций
 */
export interface TransactionConfig {
  /** Таймаут транзакции в миллисекундах */
  timeout?: number;
  /** Уровень изоляции транзакции */
  isolationLevel?: 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE';
  /** Включить логирование */
  enableLogging?: boolean;
  /** Максимальное количество попыток при ошибке */
  maxRetries?: number;
}

/**
 * Результат выполнения транзакции
 */
export interface TransactionResult<T> {
  /** Результат выполнения */
  data: T;
  /** Время выполнения в миллисекундах */
  duration: number;
  /** Количество попыток */
  attempts: number;
  /** Была ли транзакция откачена */
  wasRolledBack: boolean;
}

/**
 * Статистика использования транзакций
 */
export interface TransactionStats {
  /** Общее количество транзакций */
  totalTransactions: number;
  /** Количество успешных транзакций */
  successfulTransactions: number;
  /** Количество откаченных транзакций */
  rolledBackTransactions: number;
  /** Среднее время выполнения */
  averageDuration: number;
  /** Количество ошибок */
  errorCount: number;
}
