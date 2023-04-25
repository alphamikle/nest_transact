import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransferOperationResultDto } from './dto/transfer-operation-result.dto';
import { TransferParamsDTO } from './dto/transfer-params.dto';
import { TransferService } from './transfer.service';
import { DataSource } from 'typeorm';

@Controller('transfer')
@ApiTags('transfer')
export class TransferController {
  constructor(
    private readonly transferService: TransferService,
    /**
     * DataSource instance needed to us to start a transaction
     */
    private readonly dataSource: DataSource,
  ) {
  }

  @Post()
  @ApiResponse({
    type: TransferOperationResultDto,
  })
  async makeRemittanceWithTransaction(@Body() dto: TransferParamsDTO) {
    return this.dataSource.transaction(manager => {
      /**
       * [withTransaction] - is the new method, which provided by [TransactionFor<T>] class
       * and its allow us to start transaction with [transferService] and all its dependencies
       */
      return this.transferService.withTransaction(manager).makeTransfer(
        dto.userIdFrom,
        dto.userIdTo,
        dto.sum,
        dto.withError,
      );
    });
  }

  @Post('without-transaction')
  @ApiResponse({
    type: TransferOperationResultDto,
  })
  async makeRemittanceWithoutTransaction(@Body() dto: TransferParamsDTO) {
    return this.transferService.makeTransfer(
      dto.userIdFrom,
      dto.userIdTo,
      dto.sum,
      dto.withError,
    );
  }
}
