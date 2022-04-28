import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransferOperationResultDto } from './dto/transfer-operation-result.dto';
import { TransferParamsDTO } from './dto/transfer-params.dto';
import { Connection } from 'typeorm';
import { PurseSavingService } from './purse-saving.service';

@Controller()
@ApiTags('app')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly appServiceV2: PurseSavingService,
    /**
     * This is deprecated in typeorm for now,
     * but the DataSource object still not injectable in Nest.js,
     * because of that we should use deprecated [Connection] until [DataSource]
     * will be injectable
     */
    private readonly connection: Connection,
  ) {
  }

  @Post('transfer')
  @ApiResponse({
    type: TransferOperationResultDto,
  })
  async makeRemittanceWithTransaction(@Body() remittanceDto: TransferParamsDTO) {
    return this.connection.transaction(manager => {
      return this.appService.withTransaction(manager)/* <-- this is interesting new thing */.makeTransfer(remittanceDto.userIdFrom, remittanceDto.userIdTo, remittanceDto.sum, remittanceDto.withError);
    });
  }
}
