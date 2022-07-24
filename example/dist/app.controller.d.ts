import { AppService } from './app.service';
import { TransferOperationResultDto } from './dto/transfer-operation-result.dto';
import { TransferParamsDTO } from './dto/transfer-params.dto';
import { Connection } from 'typeorm';
export declare class AppController {
    private readonly appService;
    private readonly connection;
    constructor(appService: AppService, connection: Connection);
    makeRemittanceWithTransaction(dto: TransferParamsDTO): Promise<TransferOperationResultDto>;
    makeRemittanceWithoutTransaction(dto: TransferParamsDTO): Promise<TransferOperationResultDto>;
}
