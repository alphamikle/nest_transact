import "reflect-metadata";
import { Injectable } from "@nestjs/common";
import { EntityManager, Repository } from "typeorm";
import { ModuleRef } from "@nestjs/core";
import { PARAMTYPES_METADATA, SELF_DECLARED_DEPS_METADATA } from "@nestjs/common/constants";
import _xor from "lodash.xor";

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

  constructor(private moduleRef: ModuleRef) {}

  public withTransaction(manager: EntityManager, transactionOptions: WithTransactionOptions = {}): this {
    const newInstance = this.findArgumentsForProvider(this.constructor as ClassType<this>, manager, transactionOptions.excluded ?? []);
    this.cache.clear();
    return newInstance;
  }

  private getArgument(param: string | ClassType | ForwardRef, manager: EntityManager, excluded: ClassType[]): any {
    if (typeof param === "object" && "forwardRef" in param) {
      return this.moduleRef.get(param.forwardRef(), { strict: false });
    }
    const id = typeof param === "string" ? param : typeof param === "function" ? param.name : undefined;
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
    const canBeRepository = id.includes("Repository");
    if (typeof param === "string" || canBeRepository) {
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

    const missingParams: string[] = [];

    keys.forEach((key) => {
      if (key === PARAMTYPES_METADATA) {
        const paramTypes: Array<{ name: string } | ClassType | string> = Reflect.getMetadata(key, constructor);

        const selfParamTypes: Array<{ param: string } | { param: { name: string } }> = Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, constructor);

        for (const param of paramTypes) {
          // In case we could not get parameter types from 'design:paramtypes'
          // metadata key
          if (!param) {
            const paramTypeNameMap = paramTypes
              .filter((item) => !!item)
              .reduce((acc, currVal, currIdx) => {
                acc.set((currVal as { name: string }).name, currIdx);

                return acc;
              }, new Map());

            const selfParamTypeMap = selfParamTypes
              .filter((item) => !!item)
              .reduce((acc, currVal, currIdx) => {
                if (typeof currVal.param === "string") {
                  acc.set(currVal.param, currIdx);
                } else {
                  acc.set(currVal.param.name, currIdx);
                }

                return acc;
              }, new Map());

            const exclusion = _xor(Array.from(paramTypeNameMap.keys()), Array.from(selfParamTypeMap.keys()));

            exclusion.forEach((item) => {
              if (paramTypeNameMap.has(item)) {
                const val = paramTypes[paramTypeNameMap.get(item)] as { name: string };

                missingParams.push(val.name);
              }

              if (selfParamTypeMap.has(item)) {
                const val = selfParamTypes[selfParamTypeMap.get(item)];

                missingParams.push(typeof val?.param === "object" ? val?.param?.name : val.param);
              }
            });

            return;
          }

          const argument = this.getArgument(param as string, manager, excluded);

          args.push(argument);
        }
      }
    });

    missingParams.forEach((item) => {
      const argument = this.getArgument(item, manager, excluded);

      args.push(argument);
    });

    return new constructor(...args);
  }
}
