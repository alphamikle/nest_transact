import { Injectable } from '@nestjs/common';
import { TransactionFor } from '../../../lib/with-transaction';
import { CacheService } from './cache.service';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class InfoService extends TransactionFor<InfoService> {
  constructor(
    private readonly cacheService: CacheService,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async getInfo() {
    return [];
  }
}
