import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purse } from './model/purse.model';
import { Injectable } from '@nestjs/common';
import { TransactionFor } from 'nest-transact';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class PurseSavingService extends TransactionFor<PurseSavingService> {
  constructor(
    @InjectRepository(Purse)
    private readonly purseRepository: Repository<Purse>,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async savePurse(purse: Purse) {
    await this.purseRepository.save(purse);
  }
}