# nest-transact v11

🚀 The easiest and most powerful way to provide transactions in Nest.js applications.

[![npm](https://img.shields.io/npm/v/nest-transact)](https://www.npmjs.com/package/nest-transact)
![npm](https://img.shields.io/npm/dw/nest-transact?label=Downloads%20per%20week)

## ✨ What's New in v11

- **🔄 Updated Dependencies**: Full compatibility with Nest.js 11.x and TypeScript 5.x
- **🎯 Enhanced Type Safety**: Improved TypeScript support with better error handling
- **🎨 Rich Decorators**: New decorators for transaction management (`@Transactional`, `@RequireTransaction`, `@LogTransaction`)
- **⚡ Performance Optimizations**: Metadata caching and efficient dependency resolution
- **🛠️ Advanced Utilities**: Built-in retry logic, timeout handling, and transaction statistics
- **📊 Monitoring**: Comprehensive transaction statistics and logging
- **🔧 Better Error Handling**: Custom error types with detailed diagnostics

## 🔧 Compatibility

- **Nest.js**: `^11.x.x`
- **TypeORM**: `^0.3.x`
- **TypeScript**: `^5.x.x`
- **Node.js**: `^18.x.x`

## 📦 Installation

```bash
npm install nest-transact
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Repository } from 'typeorm';
import { TransactionFor } from 'nest-transact';

@Injectable()
export class UserService extends TransactionFor<UserService> {
  constructor(
    moduleRef: ModuleRef,
    private userRepository: Repository<User>,
    private postRepository: Repository<Post>,
  ) {
    super(moduleRef);
  }

  async createUserWithPost(userData: CreateUserDto, postData: CreatePostDto): Promise<User> {
    const user = await this.userRepository.save(userData);
    await this.postRepository.save({ ...postData, userId: user.id });
    return user;
  }
}
```

### Using Transactions

```typescript
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SomeService {
  constructor(
    private dataSource: DataSource,
    private userService: UserService,
  ) {}

  async someMethod(): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const transactionalUserService = this.userService.withTransaction(manager);
      await transactionalUserService.createUserWithPost(userData, postData);
    });
  }
}
```

## 🎯 Advanced Features

### Decorators

```typescript
import { Injectable } from '@nestjs/common';
import { 
  TransactionFor, 
  Transactional, 
  RequireTransaction, 
  LogTransaction 
} from 'nest-transact';

@Injectable()
export class PaymentService extends TransactionFor<PaymentService> {
  constructor(moduleRef: ModuleRef, private paymentRepository: Repository<Payment>) {
    super(moduleRef);
  }

  // Automatically logs transaction operations
  @LogTransaction('debug')
  async createPayment(data: CreatePaymentDto): Promise<Payment> {
    return this.paymentRepository.save(data);
  }

  // Ensures method is called within transaction context
  @RequireTransaction()
  async processPayment(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
    payment.status = 'processed';
    return this.paymentRepository.save(payment);
  }

  // Advanced transaction configuration
  @Transactional({ 
    timeout: 5000, 
    enableLogging: true,
    maxRetries: 3 
  })
  async complexOperation(data: any): Promise<any> {
    // Complex business logic here
  }
}
```

### Transaction Utils

```typescript
import { Injectable } from '@nestjs/common';
import { TransactionUtils, TransactionConfig } from 'nest-transact';

@Injectable()
export class OrderService {
  constructor(private transactionUtils: TransactionUtils) {}

  async processOrder(orderData: any) {
    const config: TransactionConfig = {
      timeout: 10000,
      enableLogging: true,
      maxRetries: 3,
      isolationLevel: 'READ_COMMITTED'
    };

    const result = await this.transactionUtils.executeWithTransaction(
      async (manager) => {
        // Your transactional operations here
        return await this.performComplexOperation(manager, orderData);
      },
      config
    );

    return result.data;
  }
}
```

## ⚙️ Configuration Options

### WithTransaction Options

```typescript
const transactionalService = this.userService.withTransaction(manager, {
  excluded: [SomeService, AnotherService], // Exclude services from recreation
});
```

### Transaction Configuration

```typescript
interface TransactionConfig {
  timeout?: number;           // Timeout in milliseconds
  isolationLevel?: string;    // Transaction isolation level
  enableLogging?: boolean;    // Enable detailed logging
  maxRetries?: number;        // Maximum retry attempts
}
```

## 📊 Monitoring and Statistics

```typescript
// Get transaction statistics
const stats = this.transactionUtils.getStats();
console.log(stats);
// {
//   totalTransactions: 150,
//   successfulTransactions: 145,
//   rolledBackTransactions: 5,
//   averageDuration: 234,
//   errorCount: 5
// }

// Reset statistics
this.transactionUtils.resetStats();

// Clear metadata cache (useful for testing)
TransactionFor.clearMetadataCache();
```

## 🔍 How it Works

When you call `withTransaction(manager)`, the library:

1. **Analyzes Dependencies**: Uses reflection to examine constructor parameters
2. **Creates Transactional Instances**: Recursively recreates the entire dependency tree
3. **Replaces Repositories**: Swaps regular repositories with transactional versions
4. **Maintains Type Safety**: Preserves all TypeScript types and interfaces
5. **Caches Metadata**: Optimizes performance through intelligent caching

## 🚨 Error Handling

The library provides detailed error information:

```typescript
try {
  await transactionalService.someMethod();
} catch (error) {
  if (error instanceof TransactionDependencyError) {
    console.log('Dependency resolution failed:', error.param);
  } else if (error instanceof TransactionRepositoryError) {
    console.log('Repository error:', error.repositoryName);
  }
}
```

## 📚 Examples

Check out the [examples](./examples/) directory for comprehensive usage examples.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## 📄 License

MIT

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/nest-transact)
- [GitHub Repository](https://github.com/alphamikle/nest_transact)
- [Issues](https://github.com/alphamikle/nest_transact/issues)
