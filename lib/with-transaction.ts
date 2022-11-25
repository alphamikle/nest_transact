import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { ModuleRef } from '@nestjs/core';
import { PARAMTYPES_METADATA } from '@nestjs/common/constants';

type ClassType<T = any> = new (...args: any[]) => T;
type ForwardRef = {
  forwardRef: () => any;
};

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
  private cache: Map<string, any> = new Map();

  constructor(private moduleRef: ModuleRef) {
  }

  public withTransaction(manager: EntityManager, transactionOptions: WithTransactionOptions = {}): this {
    const newInstance = this.findArgumentsForProvider(this.constructor as ClassType<this>, manager, transactionOptions.excluded ?? []);
    this.cache.clear();
    return newInstance;
  }

  private getArgument(param: string | ClassType | ForwardRef, manager: EntityManager, excluded: ClassType[]): any {
    if (typeof param === 'object' && 'forwardRef' in param) {
      return this.moduleRef.get(param.forwardRef(), { strict: false });
    }
    const id = typeof param === 'string' ? param : typeof param === 'function' ? param.name : undefined;
    if (id === undefined) {
      throw new Error(`Can't get injection token from ${param}`);
    }
    const isExcluded = excluded.length > 0 && excluded.some((ex) => ex.name === id);
    if (id === `${ModuleRef.name}`) {
      return this.moduleRef;
    }
    if (isExcluded) {
      /// Returns current instance of service, if it is excluded
      return this.moduleRef.get(id, { strict: false });
    }
    let argument: Repository<any>;
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }
    const canBeRepository = id.includes('Repository');
    if (typeof param === 'string' || canBeRepository) {
      // Fetch the dependency
      let dependency: Repository<any> | null = null;
      try {
        if (canBeRepository) {
          // Return directly if param is custom repository
          return manager.getCustomRepository(param as any);
        }
      } catch (error) {
        dependency = this.moduleRef.get(param, { strict: false });
      }
      if (dependency! instanceof Repository || canBeRepository) {
        // If the dependency is a repository, make a new repository with the desired transaction manager.
        const entity: any = dependency!.metadata.target;
        argument = manager.getRepository(entity);
      } else {
        if (!dependency) {
          dependency = this.moduleRef.get(param, { strict: false });
        }
        // The dependency is not a repository, use it directly.
        argument = dependency!;
      }
    } else {
      argument = this.findArgumentsForProvider(param as ClassType, manager, excluded);
    }
    this.cache.set(id, argument);
    return argument;
  }

  private findArgumentsForProvider(constructor: ClassType, manager: EntityManager, excluded: ClassType[]): any {
    const args: any[] = [];
    const keys = Reflect.getMetadataKeys(constructor);
    keys.forEach((key) => {
      if (key === PARAMTYPES_METADATA) {
        const paramTypes: Array<string | ClassType> = Reflect.getMetadata(key, constructor);
        for (const param of paramTypes) {
          const argument = this.getArgument(param, manager, excluded);
          args.push(argument);
        }
      }
    });
    return new constructor(...args);
  }
}
