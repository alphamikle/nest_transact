import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, Transaction, TransactionManager } from 'typeorm';
import { Purse } from './model/purse.model';
import { Injectable } from '@nestjs/common';
import { TransactionFor } from 'nest-transact';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class AppServiceV2 extends TransactionFor<AppServiceV2> {
  constructor(
    @InjectRepository(Purse)
    private readonly purseRepository: Repository<Purse>,
    // this was added only for use in [AppController.makeRemittanceWithTransaction] as example
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async savePurse(purse: Purse) {
    await this.purseRepository.save(purse);
  }

  @Transaction()
  async savePurseInTransaction(purse: Purse, @TransactionManager() transactionManager: EntityManager = null) {
    await transactionManager.save(Purse, purse);
  }

  async savePurseInTransactionV2(purse: Purse, transactionManager: EntityManager) {
    await transactionManager.save(Purse, purse);
  }
}