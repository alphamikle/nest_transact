"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const transfer_operation_result_dto_1 = require("./dto/transfer-operation-result.dto");
const transfer_params_dto_1 = require("./dto/transfer-params.dto");
const transfer_service_1 = require("./transfer.service");
const typeorm_1 = require("typeorm");
let TransferController = class TransferController {
    constructor(transferService, connection) {
        this.transferService = transferService;
        this.connection = connection;
    }
    async makeRemittanceWithTransaction(dto) {
        return this.connection.transaction(manager => {
            return this.transferService.withTransaction(manager).makeTransfer(dto.userIdFrom, dto.userIdTo, dto.sum, dto.withError);
        });
    }
    async makeRemittanceWithoutTransaction(dto) {
        return this.transferService.makeTransfer(dto.userIdFrom, dto.userIdTo, dto.sum, dto.withError);
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiResponse)({
        type: transfer_operation_result_dto_1.TransferOperationResultDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transfer_params_dto_1.TransferParamsDTO]),
    __metadata("design:returntype", Promise)
], TransferController.prototype, "makeRemittanceWithTransaction", null);
__decorate([
    (0, common_1.Post)('without-transaction'),
    (0, swagger_1.ApiResponse)({
        type: transfer_operation_result_dto_1.TransferOperationResultDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transfer_params_dto_1.TransferParamsDTO]),
    __metadata("design:returntype", Promise)
], TransferController.prototype, "makeRemittanceWithoutTransaction", null);
TransferController = __decorate([
    (0, common_1.Controller)('transfer'),
    (0, swagger_1.ApiTags)('transfer'),
    __metadata("design:paramtypes", [transfer_service_1.TransferService,
        typeorm_1.Connection])
], TransferController);
exports.TransferController = TransferController;
//# sourceMappingURL=transfer.controller.js.map