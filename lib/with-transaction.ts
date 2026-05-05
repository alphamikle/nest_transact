import 'reflect-metadata';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { ModuleRef } from '@nestjs/core';
import { PARAMTYPES_METADATA, SELF_DECLARED_DEPS_METADATA } from '@nestjs/common/constants';
const _xor = require('lodash.xor');

type ClassType<T = any> = new (...args: any[]) => T;
type ForwardRef = {
  forwardRef: () => any;
};

// Улучшенные типы для безопасности
type DependencyParam = string | ClassType | ForwardRef;
type MetadataParam = { name: string } | ClassType | string;
type SelfDeclaredParam = { param: string } | { param: { name: string } };

// Тип для результата getArgument
type ResolvedDependency = Repository<any> | any;

// Кастомные ошибки для лучшей диагностики
export class TransactionDependencyError extends Error {
  constructor(message: string, public readonly param: unknown) {
    super(`Transaction dependency resolution failed: ${message}`);
    this.name = 'TransactionDependencyError';
  }
}

export class TransactionRepositoryError extends Error {
  constructor(message: string, public readonly repositoryName: string) {
    super(`Transaction repository error: ${message}`);
    this.name = 'TransactionRepositoryError';
  }
}

export interface WithTransactionOptions {
  /**
   * Class types, that will not rebuild in transaction,
   * for example - it can be a service without any repositories
   * or some cache service, and that service must not rebuild in
   * app in any time
   */
  excluded?: ClassType[];
}

@Injectable()
export class TransactionFor<T = any> {
  private readonly logger = new Logger(TransactionFor.name);
  private cache: Map<string, any> = new Map();

  // Кэш для метаданных конструкторов для улучшения производительности
  private static readonly metadataCache = new Map<ClassType, {
    paramTypes: MetadataParam[];
    selfDeclaredTypes: SelfDeclaredParam[];
  }>();

  constructor(private moduleRef: ModuleRef) {
  }

  public withTransaction(manager: EntityManager, transactionOptions: WithTransactionOptions = {}): this {
    if (!manager) {
      throw new TransactionDependencyError('EntityManager is required', manager);
    }

    const startTime = Date.now();
    this.logger.debug(`Creating transactional instance of ${this.constructor.name}`);

    try {
      const excludedClasses = transactionOptions.excluded ?? [];
      const newInstance = this.findArgumentsForProvider(
        this.constructor as ClassType<this>,
        manager,
        excludedClasses
      );

      this.cache.clear();

      const duration = Date.now() - startTime;
      this.logger.debug(`Transactional instance created in ${duration}ms`);

      return newInstance;
    } catch (error) {
      this.logger.error(`Failed to create transactional instance: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private getArgument(param: DependencyParam, manager: EntityManager, excluded: ClassType[]): ResolvedDependency {
    // Обработка forwardRef
    if (this.isForwardRef(param)) {
      return this.resolveForwardRef(param);
    }

    const id = this.extractDependencyId(param);

    // Проверка кэша
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }

    // Проверка исключений
    if (this.isDependencyExcluded(id, excluded)) {
      return this.moduleRef.get(id, { strict: false });
    }

    // Специальная обработка ModuleRef
    if (id === ModuleRef.name) {
      return this.moduleRef;
    }

    const resolvedDependency = this.resolveDependency(param, id, manager, excluded);
    this.cache.set(id, resolvedDependency);
    return resolvedDependency;
  }

  private isForwardRef(param: DependencyParam): param is ForwardRef {
    return typeof param === 'object' && 'forwardRef' in param;
  }

  private resolveForwardRef(param: ForwardRef): any {
    try {
      return this.moduleRef.get(param.forwardRef(), { strict: false });
    } catch (error) {
      throw new TransactionDependencyError(
        `Failed to resolve forwardRef: ${error instanceof Error ? error.message : 'Unknown error'}`,
        param
      );
    }
  }

  private extractDependencyId(param: DependencyParam): string {
    if (typeof param === 'string') {
      return param;
    }
    if (typeof param === 'function') {
      return param.name;
    }
    throw new TransactionDependencyError('Cannot extract dependency ID from parameter', param);
  }

  private isDependencyExcluded(id: string, excluded: ClassType[]): boolean {
    return excluded.length > 0 && excluded.some((ex) => ex.name === id);
  }

  private resolveDependency(param: DependencyParam, id: string, manager: EntityManager, excluded: ClassType[]): ResolvedDependency {
    const canBeRepository = id.includes('Repository');

    if (typeof param === 'string' || canBeRepository) {
      return this.resolveRepositoryOrService(param, id, manager, canBeRepository);
    } else {
      return this.findArgumentsForProvider(param as ClassType, manager, excluded);
    }
  }

  private resolveRepositoryOrService(param: DependencyParam, id: string, manager: EntityManager, canBeRepository: boolean): ResolvedDependency {
    let dependency: Repository<any> | null = null;

    try {
      // Приводим param к правильному типу для moduleRef.get
      const token = typeof param === 'string' ? param : param as any;
      dependency = this.moduleRef.get(token, { strict: false });
    } catch (error) {
      throw new TransactionDependencyError(
        `Failed to resolve dependency "${id}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        param
      );
    }

    if (!dependency) {
      throw new TransactionDependencyError(`Dependency "${id}" not found in module`, param);
    }

    if (dependency instanceof Repository || canBeRepository) {
      return this.createTransactionalRepository(dependency, manager, id);
    }

    return dependency;
  }

  private createTransactionalRepository(dependency: Repository<any>, manager: EntityManager, id: string): Repository<any> {
    try {
      if (!dependency.metadata?.target) {
        throw new TransactionRepositoryError(`Repository metadata not found`, id);
      }

      const entity = dependency.metadata.target;
      return manager.getRepository(entity);
    } catch (error) {
      throw new TransactionRepositoryError(
        `Failed to create transactional repository: ${error instanceof Error ? error.message : 'Unknown error'}`,
        id
      );
    }
  }

  private findArgumentsForProvider(constructor: ClassType, manager: EntityManager, excluded: ClassType[]): any {
    try {
      const constructorArgs = this.resolveConstructorArguments(constructor, manager, excluded);
      return new constructor(...constructorArgs);
    } catch (error) {
      throw new TransactionDependencyError(
        `Failed to create instance of ${constructor.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        constructor
      );
    }
  }

  private resolveConstructorArguments(constructor: ClassType, manager: EntityManager, excluded: ClassType[]): any[] {
    const metadataKeys = Reflect.getMetadataKeys(constructor);
    const args: any[] = [];
    const missingParams: string[] = [];

    for (const key of metadataKeys) {
      if (key === PARAMTYPES_METADATA) {
        const paramTypes = this.getParameterTypes(constructor);
        const selfDeclaredTypes = this.getSelfDeclaredTypes(constructor);

        this.processParameterTypes(paramTypes, selfDeclaredTypes, args, missingParams, manager, excluded);
      }
    }

    // Resolve missing parameters
    for (const paramName of missingParams) {
      const argument = this.getArgument(paramName, manager, excluded);
      args.push(argument);
    }

    return args;
  }

  private getParameterTypes(constructor: ClassType): MetadataParam[] {
    // Проверяем кэш метаданных
    const cached = TransactionFor.metadataCache.get(constructor);
    if (cached) {
      return cached.paramTypes;
    }

    const paramTypes = Reflect.getMetadata(PARAMTYPES_METADATA, constructor);
    if (!Array.isArray(paramTypes)) {
      throw new TransactionDependencyError('Invalid parameter types metadata', constructor);
    }

    // Кэшируем результат
    const selfDeclaredTypes = this.getSelfDeclaredTypesInternal(constructor);
    TransactionFor.metadataCache.set(constructor, { paramTypes, selfDeclaredTypes });

    return paramTypes;
  }

  private getSelfDeclaredTypes(constructor: ClassType): SelfDeclaredParam[] {
    // Проверяем кэш метаданных
    const cached = TransactionFor.metadataCache.get(constructor);
    if (cached) {
      return cached.selfDeclaredTypes;
    }

    return this.getSelfDeclaredTypesInternal(constructor);
  }

  private getSelfDeclaredTypesInternal(constructor: ClassType): SelfDeclaredParam[] {
    const selfDeclaredTypes = Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, constructor);
    return Array.isArray(selfDeclaredTypes) ? selfDeclaredTypes : [];
  }

  private processParameterTypes(
    paramTypes: MetadataParam[],
    selfDeclaredTypes: SelfDeclaredParam[],
    args: any[],
    missingParams: string[],
    manager: EntityManager,
    excluded: ClassType[]
  ): void {
    for (const param of paramTypes) {
      if (!param) {
        // Handle missing parameter types by comparing with self-declared types
        this.handleMissingParameterTypes(paramTypes, selfDeclaredTypes, missingParams);
        return;
      }

      const argument = this.getArgument(param as DependencyParam, manager, excluded);
      args.push(argument);
    }
  }

  private handleMissingParameterTypes(
    paramTypes: MetadataParam[],
    selfDeclaredTypes: SelfDeclaredParam[],
    missingParams: string[]
  ): void {
    const paramTypeNames = this.extractParameterNames(paramTypes);
    const selfDeclaredNames = this.extractSelfDeclaredNames(selfDeclaredTypes);

    const missingTypeNames = _xor(paramTypeNames, selfDeclaredNames);

    for (const typeName of missingTypeNames) {
      if (typeof typeName === 'string') {
        missingParams.push(typeName);
      }
    }
  }

  private extractParameterNames(paramTypes: MetadataParam[]): string[] {
    return paramTypes
      .filter(Boolean)
      .map(param => {
        if (typeof param === 'string') return param;
        if (typeof param === 'function') return param.name;
        if (typeof param === 'object' && 'name' in param) return param.name;
        return '';
      })
      .filter(Boolean);
  }

  private extractSelfDeclaredNames(selfDeclaredTypes: SelfDeclaredParam[]): string[] {
    return selfDeclaredTypes
      .filter(Boolean)
      .map(item => {
        if (typeof item.param === 'string') return item.param;
        if (typeof item.param === 'object' && 'name' in item.param) return item.param.name;
        return '';
      })
      .filter(Boolean);
  }

  /**
   * Очищает кэш метаданных. Полезно для тестирования или при изменении структуры классов.
   */
  public static clearMetadataCache(): void {
    TransactionFor.metadataCache.clear();
  }

  /**
   * Возвращает статистику использования кэша
   */
  public static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: TransactionFor.metadataCache.size,
      keys: Array.from(TransactionFor.metadataCache.keys()).map(cls => cls.name)
    };
  }

  /**
   * Проверяет, поддерживает ли класс транзакции (наследуется от TransactionFor)
   */
  public static isTransactional(instance: any): instance is TransactionFor {
    return instance instanceof TransactionFor;
  }
}
