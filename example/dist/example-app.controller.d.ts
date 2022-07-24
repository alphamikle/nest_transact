import { ExampleAppService } from './example-app.service';
import { TransferOperationResultDto } from './dto/transfer-operation-result.dto';
import { TransferParamsDTO } from './dto/transfer-params.dto';
import { Connection } from 'typeorm';
export declare class ExampleAppController {
    private readonly appService;
    private readonly connection;
    constructor(appService: ExampleAppService, connection: Connection);
    makeRemittanceWithTransaction(dto: TransferParamsDTO): Promise<TransferOperationResultDto>;
    makeRemittanceWithoutTransaction(dto: TransferParamsDTO): Promise<TransferOperationResultDto>;
}
