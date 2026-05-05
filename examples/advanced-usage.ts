/**
 * Примеры расширенного использования nest-transact v11
 */

import { Injectable, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository, Entity, PrimaryGeneratedColumn, Column, DataSource } from 'typeorm';
import { 
  TransactionFor, 
  TransactionUtils, 
  Transactional, 
  LogTransaction, 
  RequireTransaction,
  TransactionConfig 
} from '../index';

// Пример сущности
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ default: 0 })
  balance: number;
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  amount: number;

  @Column()
  status: string;
}

// Пример базового сервиса с транзакциями
@Injectable()
export class UserService extends TransactionFor<UserService> {
  constructor(
    moduleRef: any,
    private userRepository: Repository<User>
  ) {
    super(moduleRef);
  }

  // Простой метод с декоратором для логирования
  @LogTransaction('debug')
  async createUser(userData: Partial<User>): Promise<User> {
    return this.userRepository.save(userData);
  }

  // Метод, требующий транзакционного контекста
  @RequireTransaction()
  async updateUserBalance(userId: number, amount: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    
    user.balance += amount;
    return this.userRepository.save(user);
  }

  // Метод с полной конфигурацией транзакции
  @Transactional({ 
    timeout: 5000, 
    enableLogging: true,
    maxRetries: 3 
  })
  async complexUserOperation(userId: number): Promise<User> {
    // Сложная операция, которая может потребовать повторных попыток
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    
    // Имитация сложной операции
    await new Promise(resolve => setTimeout(resolve, 100));
    
    user.balance *= 1.1; // Увеличиваем баланс на 10%
    return this.userRepository.save(user);
  }
}

@Injectable()
export class OrderService extends TransactionFor<OrderService> {
  constructor(
    moduleRef: any,
    private orderRepository: Repository<Order>
  ) {
    super(moduleRef);
  }

  @RequireTransaction()
  async createOrder(userId: number, amount: number): Promise<Order> {
    const order = this.orderRepository.create({
      userId,
      amount,
      status: 'pending'
    });
    
    return this.orderRepository.save(order);
  }

  @RequireTransaction()
  async completeOrder(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new Error('Order not found');
    }
    
    order.status = 'completed';
    return this.orderRepository.save(order);
  }
}

// Пример бизнес-сервиса, использующего транзакции
@Injectable()
export class PaymentService extends TransactionFor<PaymentService> {
  constructor(
    moduleRef: any,
    private userService: UserService,
    private orderService: OrderService,
    private transactionUtils: TransactionUtils
  ) {
    super(moduleRef);
  }

  // Пример использования TransactionUtils для сложных операций
  async processPayment(userId: number, amount: number): Promise<{ user: User; order: Order }> {
    const config: TransactionConfig = {
      timeout: 10000,
      enableLogging: true,
      maxRetries: 3,
      isolationLevel: 'READ_COMMITTED'
    };

    const result = await this.transactionUtils.executeWithTransaction(
      async (manager) => {
        // Создаем транзакционные экземпляры сервисов
        const transactionalUserService = this.userService.withTransaction(manager);
        const transactionalOrderService = this.orderService.withTransaction(manager);

        // Выполняем операции в транзакции
        const updatedUser = await transactionalUserService.updateUserBalance(userId, -amount);
        const newOrder = await transactionalOrderService.createOrder(userId, amount);
        const completedOrder = await transactionalOrderService.completeOrder(newOrder.id);

        return { user: updatedUser, order: completedOrder };
      },
      config
    );

    return result.data;
  }

  // Пример пакетной обработки
  async processBatchPayments(payments: Array<{ userId: number; amount: number }>): Promise<Array<{ user: User; order: Order }>> {
    const operations = payments.map(payment => 
      async (manager: any) => {
        const transactionalUserService = this.userService.withTransaction(manager);
        const transactionalOrderService = this.orderService.withTransaction(manager);

        const updatedUser = await transactionalUserService.updateUserBalance(payment.userId, -payment.amount);
        const newOrder = await transactionalOrderService.createOrder(payment.userId, payment.amount);
        const completedOrder = await transactionalOrderService.completeOrder(newOrder.id);

        return { user: updatedUser, order: completedOrder };
      }
    );

    return this.transactionUtils.executeBatch(operations, {
      timeout: 30000,
      enableLogging: true,
      maxRetries: 2
    });
  }

  // Пример получения статистики
  async getTransactionStats() {
    return this.transactionUtils.getStats();
  }
}

// Пример модуля
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Order])
  ],
  providers: [
    UserService,
    OrderService,
    PaymentService,
    TransactionUtils
  ],
  exports: [
    UserService,
    OrderService,
    PaymentService,
    TransactionUtils
  ]
})
export class PaymentModule {}

// Пример использования в контроллере
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  async processPayment(userId: number, amount: number) {
    try {
      const result = await this.paymentService.processPayment(userId, amount);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getStats() {
    return this.paymentService.getTransactionStats();
  }
}
