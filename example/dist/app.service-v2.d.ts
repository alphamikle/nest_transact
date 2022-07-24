import { EntityManager, Repository } from 'typeorm';
import { Purse } from './model/purse.model';
import { TransactionFor } from 'nest-transact';
import { ModuleRef } from '@nestjs/core';
export declare class AppServiceV2 extends TransactionFor<AppServiceV2> {
    private readonly purseRepository;
    constructor(purseRepository: Repository<Purse>, moduleRef: ModuleRef);
    savePurse(purse: Purse): Promise<void>;
    savePurseInTransaction(purse: Purse, transactionManager?: EntityManager): Promise<void>;
    savePurseInTransactionV2(purse: Purse, transactionManager: EntityManager): Promise<void>;
}
