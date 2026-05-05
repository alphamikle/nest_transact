/**
 * Декораторы для упрощения работы с транзакциями
 */

import { SetMetadata } from '@nestjs/common';
import { TransactionConfig } from './types';

/**
 * Ключ метаданных для транзакционных методов
 */
export const TRANSACTION_METADATA_KEY = 'transaction:config';

/**
 * Декоратор для пометки метода как транзакционного
 * 
 * @param config - Конфигурация транзакции
 * 
 * @example
 * ```typescript
 * @Injectable()
 * export class UserService extends TransactionFor<UserService> {
 *   @Transactional({ timeout: 5000 })
 *   async createUser(userData: CreateUserDto): Promise<User> {
 *     // Этот метод будет выполнен в транзакции
 *     return this.userRepository.save(userData);
 *   }
 * }
 * ```
 */
export function Transactional(config: TransactionConfig = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Сохраняем конфигурацию в метаданных
    SetMetadata(TRANSACTION_METADATA_KEY, config)(target, propertyKey, descriptor);
    
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: any, ...args: any[]) {
      // Проверяем, находимся ли мы уже в транзакционном контексте
      if (this._isTransactional) {
        return originalMethod.apply(this, args);
      }

      throw new Error(
        `Method ${target.constructor.name}.${propertyKey} is marked as @Transactional but was called outside transaction context. ` +
        `Use withTransaction() to create transactional instance first.`
      );
    };

    return descriptor;
  };
}

/**
 * Декоратор для пометки класса как требующего транзакции
 * 
 * @example
 * ```typescript
 * @TransactionalService()
 * @Injectable()
 * export class PaymentService extends TransactionFor<PaymentService> {
 *   // Все методы этого сервиса требуют транзакционного контекста
 * }
 * ```
 */
export function TransactionalService() {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    // Добавляем метаданные к классу
    SetMetadata('transactional:service', true)(constructor);
    
    return class extends constructor {
      _isTransactionalService = true;
    };
  };
}

/**
 * Декоратор для автоматической проверки транзакционного контекста
 * 
 * @example
 * ```typescript
 * @Injectable()
 * export class OrderService extends TransactionFor<OrderService> {
 *   @RequireTransaction()
 *   async processOrder(orderId: string): Promise<void> {
 *     // Этот метод автоматически проверит наличие транзакционного контекста
 *   }
 * }
 * ```
 */
export function RequireTransaction() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: any, ...args: any[]) {
      if (!this._isTransactional && !this.constructor.name.includes('Transactional')) {
        throw new Error(
          `Method ${target.constructor.name}.${propertyKey} requires transaction context. ` +
          `Use withTransaction() to create transactional instance first.`
        );
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Декоратор для логирования транзакционных операций
 * 
 * @param logLevel - Уровень логирования ('debug' | 'log' | 'warn' | 'error')
 * 
 * @example
 * ```typescript
 * @Injectable()
 * export class UserService extends TransactionFor<UserService> {
 *   @LogTransaction('debug')
 *   async updateUser(id: string, data: UpdateUserDto): Promise<User> {
 *     // Операция будет залогирована
 *     return this.userRepository.save({ id, ...data });
 *   }
 * }
 * ```
 */
export function LogTransaction(logLevel: 'debug' | 'log' | 'warn' | 'error' = 'debug') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: any, ...args: any[]) {
      const startTime = Date.now();
      const className = target.constructor.name;
      
      if (this.logger && typeof this.logger[logLevel] === 'function') {
        this.logger[logLevel](`Starting transaction method: ${className}.${propertyKey}`);
      }

      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;
        
        if (this.logger && typeof this.logger[logLevel] === 'function') {
          this.logger[logLevel](`Completed transaction method: ${className}.${propertyKey} in ${duration}ms`);
        }
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        if (this.logger && typeof this.logger.error === 'function') {
          this.logger.error(`Failed transaction method: ${className}.${propertyKey} after ${duration}ms`, error);
        }
        
        throw error;
      }
    };

    return descriptor;
  };
}
