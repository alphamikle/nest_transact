import { HttpException, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TransactionFor } from 'nest-transact';
import { isNotDefined } from '../tools';
import { constants } from 'http2';
import { TransferOperationResultDto } from './dto/transfer-operation-result.dto';
import { UserService } from '../user/user.service';
import { PurseService } from './purse.service';

@Injectable()
export class TransferService extends TransactionFor<TransferService> {
  constructor(
    /**
     * All these services will be recreated and be a participants of the same transaction
     */
    private readonly purseService: PurseService,
    private readonly userService: UserService,
    /**
     * This is the needed thing for [TransactionFor<T>] logic working
     */
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async makeTransfer(fromId: number, toId: number, sum: number, withError = false): Promise<TransferOperationResultDto> {
    if (fromId === toId) {
      throw new HttpException('USERS MUST HAVE DIFFERENT IDS', 400);
    }
    const fromUser = await this.userService.findUserById(fromId);
    const toUser = await this.userService.findUserById(toId);
    if (isNotDefined(fromUser.defaultPurseId)) {
      throw new HttpException(`USER "${fromId}" DON NOT HAVE A DEFAULT PURSE`, 500);
    }
    if (isNotDefined(toUser.defaultPurseId)) {
      throw new HttpException(`USER "${toId}" DON NOT HAVE A DEFAULT PURSE`, 500);
    }
    const fromPurse = await this.purseService.findPurseById(fromUser.defaultPurseId);
    const toPurse = await this.purseService.findPurseById(toUser.defaultPurseId);
    const modalSum = Math.abs(sum);
    if (fromPurse.balance < modalSum) {
      throw new HttpException(`USER "${fromId}" NOT ENOUGH MONEY: "${fromPurse.balance} < ${modalSum}"`, 400);
    }
    fromPurse.balance -= sum;
    toPurse.balance += sum;
    await this.purseService.savePurse(fromPurse);
    if (withError) {
      throw new HttpException('UNEXPECTED ERROR WAS THROWN WHILE TRANSFER WAS IN PROGRESS', constants.HTTP_STATUS_TEAPOT);
    }
    await this.purseService.savePurse(toPurse);
    return new TransferOperationResultDto({
      sum,
      fromId,
      toId,
      fromBalance: fromPurse.balance,
      toBalance: toPurse.balance,
    });
  }
}
