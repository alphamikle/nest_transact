import { TransferOperationResultDto } from './dto/transfer-operation-result.dto';
import { TransferParamsDTO } from './dto/transfer-params.dto';
import { TransferService } from './transfer.service';
import { Connection } from 'typeorm';
export declare class TransferController {
    private readonly transferService;
    private readonly connection;
    constructor(transferService: TransferService, connection: Connection);
    makeRemittanceWithTransaction(dto: TransferParamsDTO): Promise<TransferOperationResultDto>;
    makeRemittanceWithoutTransaction(dto: TransferParamsDTO): Promise<TransferOperationResultDto>;
}
