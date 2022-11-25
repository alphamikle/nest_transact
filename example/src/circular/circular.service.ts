import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TransactionFor } from '../../../lib/with-transaction';
import { CommonService } from '../common/common.service';

@Injectable()
export class CircularService extends TransactionFor<CircularService> {
  constructor(
    @Inject(forwardRef(() => CommonService))
    private commonService: CommonService,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }
}