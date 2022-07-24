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
exports.ExampleAppController = void 0;
const common_1 = require("@nestjs/common");
const example_app_service_1 = require("./example-app.service");
const swagger_1 = require("@nestjs/swagger");
const transfer_operation_result_dto_1 = require("./dto/transfer-operation-result.dto");
const transfer_params_dto_1 = require("./dto/transfer-params.dto");
const typeorm_1 = require("typeorm");
let ExampleAppController = class ExampleAppController {
    constructor(appService, connection) {
        this.appService = appService;
        this.connection = connection;
    }
    async makeRemittanceWithTransaction(dto) {
        return this.connection.transaction(manager => {
            return this.appService.withTransaction(manager).makeTransfer(dto.userIdFrom, dto.userIdTo, dto.sum, dto.withError);
        });
    }
    async makeRemittanceWithoutTransaction(dto) {
        return this.appService.makeTransfer(dto.userIdFrom, dto.userIdTo, dto.sum, dto.withError);
    }
};
__decorate([
    (0, common_1.Post)('transfer'),
    (0, swagger_1.ApiResponse)({
        type: transfer_operation_result_dto_1.TransferOperationResultDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transfer_params_dto_1.TransferParamsDTO]),
    __metadata("design:returntype", Promise)
], ExampleAppController.prototype, "makeRemittanceWithTransaction", null);
__decorate([
    (0, common_1.Post)('transfer-without-transaction'),
    (0, swagger_1.ApiResponse)({
        type: transfer_operation_result_dto_1.TransferOperationResultDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transfer_params_dto_1.TransferParamsDTO]),
    __metadata("design:returntype", Promise)
], ExampleAppController.prototype, "makeRemittanceWithoutTransaction", null);
ExampleAppController = __decorate([
    (0, common_1.Injectable)(),
    (0, common_1.Controller)(),
    (0, swagger_1.ApiTags)('example-app'),
    __metadata("design:paramtypes", [example_app_service_1.ExampleAppService,
        typeorm_1.Connection])
], ExampleAppController);
exports.ExampleAppController = ExampleAppController;
//# sourceMappingURL=example-app.controller.js.map