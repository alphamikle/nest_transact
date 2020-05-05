import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { ModuleRef } from '@nestjs/core';
import { PARAMTYPES_METADATA } from '@nestjs/common/constants';

type ClassType<T = any> = new (...args: any[]) => T;

@Injectable()
export class TransactionFor<T = any> {
  private cache: Map<string, any> = new Map();

  constructor(
    private moduleRef: ModuleRef,
  ) {
  }

  public withTransaction(manager: EntityManager): this {
    const newInstance = this.findArgumentsForProvider(this.constructor as ClassType<this>, manager);
    this.cache.clear();
    return newInstance;
  }

  private getArgument(param: string | ClassType, manager: EntityManager): any {
    let argument: Repository<any>;
    const id = typeof param === 'string' ? param : param.name;
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }
    if (typeof param === 'string') {
      const repository: Repository<any> = this.moduleRef.get(param, { strict: false });
      const entity: any = repository.metadata.target;
      argument = manager.getRepository(entity);
    } else {
      argument = this.findArgumentsForProvider(param as ClassType, manager);
    }
    this.cache.set(id, argument);
    return argument;
  }

  private findArgumentsForProvider(constructor: ClassType, manager: EntityManager) {
    const args: any[] = [];
    const keys = Reflect.getMetadataKeys(constructor);
    keys.forEach(key => {
      if (key === PARAMTYPES_METADATA) {
        const paramTypes: Array<string | ClassType> = Reflect.getMetadata(key, constructor);
        for (const param of paramTypes) {
          const argument = this.getArgument(param, manager);
          args.push(argument);
        }
      }
    });
    return new constructor(...args);
  }
}