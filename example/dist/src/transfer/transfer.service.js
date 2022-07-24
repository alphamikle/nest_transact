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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const nest_transact_1 = require("nest-transact");
const tools_1 = require("../tools");
const http2_1 = require("http2");
const transfer_operation_result_dto_1 = require("./dto/transfer-operation-result.dto");
const user_service_1 = require("../user/user.service");
const purse_service_1 = require("./purse.service");
let TransferService = class TransferService extends nest_transact_1.TransactionFor {
    constructor(purseService, userService, moduleRef) {
        super(moduleRef);
        this.purseService = purseService;
        this.userService = userService;
    }
    async makeTransfer(fromId, toId, sum, withError = false) {
        if (fromId === toId) {
            throw new common_1.HttpException('USERS MUST HAVE DIFFERENT IDS', 400);
        }
        const fromUser = await this.userService.findUserById(fromId);
        const toUser = await this.userService.findUserById(toId);
        if ((0, tools_1.isNotDefined)(fromUser.defaultPurseId)) {
            throw new common_1.HttpException(`USER "${fromId}" DON NOT HAVE A DEFAULT PURSE`, 500);
        }
        if ((0, tools_1.isNotDefined)(toUser.defaultPurseId)) {
            throw new common_1.HttpException(`USER "${toId}" DON NOT HAVE A DEFAULT PURSE`, 500);
        }
        const fromPurse = await this.purseService.findPurseById(fromUser.defaultPurseId);
        const toPurse = await this.purseService.findPurseById(toUser.defaultPurseId);
        const modalSum = Math.abs(sum);
        if (fromPurse.balance < modalSum) {
            throw new common_1.HttpException(`USER "${fromId}" NOT ENOUGH MONEY: "${fromPurse.balance} < ${modalSum}"`, 400);
        }
        fromPurse.balance -= sum;
        toPurse.balance += sum;
        await this.purseService.savePurse(fromPurse);
        if (withError) {
            throw new common_1.HttpException('UNEXPECTED ERROR WAS THROWN WHILE TRANSFER WAS IN PROGRESS', http2_1.constants.HTTP_STATUS_TEAPOT);
        }
        await this.purseService.savePurse(toPurse);
        return new transfer_operation_result_dto_1.TransferOperationResultDto({
            sum,
            fromId,
            toId,
            fromBalance: fromPurse.balance,
            toBalance: toPurse.balance,
        });
    }
};
TransferService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [purse_service_1.PurseService,
        user_service_1.UserService,
        core_1.ModuleRef])
], TransferService);
exports.TransferService = TransferService;
//# sourceMappingURL=transfer.service.js.map