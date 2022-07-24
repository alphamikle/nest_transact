import { ModuleRef } from '@nestjs/core';
import { TransactionFor } from 'nest-transact';
import { TransferOperationResultDto } from './dto/transfer-operation-result.dto';
import { UserService } from '../user/user.service';
import { PurseService } from './purse.service';
export declare class TransferService extends TransactionFor<TransferService> {
    private readonly purseService;
    private readonly userService;
    constructor(purseService: PurseService, userService: UserService, moduleRef: ModuleRef);
    makeTransfer(fromId: number, toId: number, sum: number, withError?: boolean): Promise<TransferOperationResultDto>;
}
