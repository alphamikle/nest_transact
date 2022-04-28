import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TransactionFor } from 'nest-transact';
import { User } from './model/user.model';
import { Purse } from './model/purse.model';
import { InjectRepository } from '@nestjs/typeorm';
import { TransferOperationResultDto } from './dto/transfer-operation-result.dto';
import { ModuleRef } from '@nestjs/core';
import { PurseSavingService } from './purse-saving.service';

export const NOT_FOUND_USER_WITH_ID = (userId: number) => `NOT FOUND USER WITH ID = ${userId}`;
export const USER_DOES_NOT_HAVE_PURSE = (userId: number) => `USER WITH ID = ${userId} DOESN'T HAVE A DEFAULT PURSE`;
export const NOT_ENOUGH_MONEY = (userId: number) => `USER WITH ID = ${userId} DOESN'T HAVE ENOUGH MONEY`;

@Injectable()
export class AppService extends TransactionFor<AppService> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Purse)
    private readonly purseRepository: Repository<Purse>,
    /**
     * [PurseSavingService] injected to current service
     * and all its methods will be transactional in the transaction
     * which will be initiated from the [AppController]
     */
    private readonly purseSavingService: PurseSavingService,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async makeTransfer(fromId: number, toId: number, sum: number, withError = false): Promise<TransferOperationResultDto> {
    const fromUser = await this.userRepository.findOne({ where: { id: fromId } });
    const toUser = await this.userRepository.findOne({ where: { id: toId } });
    if (fromUser === null) {
      throw new Error(NOT_FOUND_USER_WITH_ID(fromId));
    }
    if (toUser === null) {
      throw new Error(NOT_FOUND_USER_WITH_ID(toId));
    }
    if (fromUser.defaultPurseId === null) {
      throw new Error(USER_DOES_NOT_HAVE_PURSE(fromId));
    }
    if (toUser.defaultPurseId === null) {
      throw new Error(USER_DOES_NOT_HAVE_PURSE(toId));
    }
    const fromPurse = await this.purseRepository.findOne({ where: { id: fromUser.defaultPurseId } });
    const toPurse = await this.purseRepository.findOne({ where: { id: toUser.defaultPurseId } });
    const modalSum = Math.abs(sum);
    if (fromPurse.balance < modalSum) {
      throw new Error(NOT_ENOUGH_MONEY(fromId));
    }
    fromPurse.balance -= sum;
    toPurse.balance += sum;
    await this.purseSavingService.savePurse(fromPurse);
    if (withError) {
      throw new Error('UNEXPECTED ERROR WAS THROWN WHILE TRANSFER WAS IN PROGRESS');
    }
    await this.purseRepository.save(toPurse);
    return new TransferOperationResultDto({
      sum,
      fromId,
      toId,
      fromBalance: fromPurse.balance,
      toBalance: toPurse.balance,
    });
  }
}
