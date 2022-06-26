import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransferOperationResultDto } from './dto/transfer-operation-result.dto';
import { TransferParamsDTO } from './dto/transfer-params.dto';
import { TransferService } from './transfer.service';
import { Connection } from 'typeorm';

@Controller('transfer')
@ApiTags('transfer')
export class TransferController {
  constructor(
    private readonly transferService: TransferService,
    /**
     * Connection instance needed to us anyway, to start a transaction
     */
    private readonly connection: Connection,
  ) {
  }

  @Post()
  @ApiResponse({
    type: TransferOperationResultDto,
  })
  async makeRemittanceWithTransaction(@Body() dto: TransferParamsDTO) {
    return this.connection.transaction(manager => {
      return this.transferService.withTransaction(manager)/* <-- this is interesting new thing */.makeTransfer(
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
