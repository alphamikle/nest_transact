import { Repository } from 'typeorm';
import { TransactionFor } from 'nest-transact';
import { User } from './model/user.model';
import { Purse } from './model/purse.model';
import { TransferOperationResultDto } from './dto/transfer-operation-result.dto';
import { ModuleRef } from '@nestjs/core';
import { PurseSavingService } from './purse-saving.service';
export declare const NOT_FOUND_USER_WITH_ID: (userId: number) => string;
export declare const USER_DOES_NOT_HAVE_PURSE: (userId: number) => string;
export declare const NOT_ENOUGH_MONEY: (userId: number) => string;
export declare class ExampleAppService extends TransactionFor<ExampleAppService> {
    private readonly userRepository;
    private readonly purseRepository;
    private readonly purseSavingService;
    constructor(userRepository: Repository<User>, purseRepository: Repository<Purse>, purseSavingService: PurseSavingService, moduleRef: ModuleRef);
    makeTransfer(fromId: number, toId: number, sum: number, withError?: boolean): Promise<TransferOperationResultDto>;
}
