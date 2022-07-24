import { Repository } from 'typeorm';
import { Purse } from './model/purse.model';
import { TransactionFor } from 'nest-transact';
import { ModuleRef } from '@nestjs/core';
export declare class PurseSavingService extends TransactionFor<PurseSavingService> {
    private readonly purseRepository;
    constructor(purseRepository: Repository<Purse>, moduleRef: ModuleRef);
    savePurse(purse: Purse): Promise<void>;
}
