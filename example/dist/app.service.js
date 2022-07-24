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
exports.AppService = exports.NOT_ENOUGH_MONEY = exports.USER_DOES_NOT_HAVE_PURSE = exports.NOT_FOUND_USER_WITH_ID = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const nest_transact_1 = require("nest-transact");
const user_model_1 = require("./model/user.model");
const purse_model_1 = require("./model/purse.model");
const typeorm_2 = require("@nestjs/typeorm");
const transfer_operation_result_dto_1 = require("./dto/transfer-operation-result.dto");
const core_1 = require("@nestjs/core");
const purse_saving_service_1 = require("./purse-saving.service");
const NOT_FOUND_USER_WITH_ID = (userId) => `NOT FOUND USER WITH ID = ${userId}`;
exports.NOT_FOUND_USER_WITH_ID = NOT_FOUND_USER_WITH_ID;
const USER_DOES_NOT_HAVE_PURSE = (userId) => `USER WITH ID = ${userId} DOESN'T HAVE A DEFAULT PURSE`;
exports.USER_DOES_NOT_HAVE_PURSE = USER_DOES_NOT_HAVE_PURSE;
const NOT_ENOUGH_MONEY = (userId) => `USER WITH ID = ${userId} DOESN'T HAVE ENOUGH MONEY`;
exports.NOT_ENOUGH_MONEY = NOT_ENOUGH_MONEY;
let AppService = class AppService extends nest_transact_1.TransactionFor {
    constructor(userRepository, purseRepository, purseSavingService, moduleRef) {
        super(moduleRef);
        this.userRepository = userRepository;
        this.purseRepository = purseRepository;
        this.purseSavingService = purseSavingService;
    }
    async makeTransfer(fromId, toId, sum, withError = false) {
        const fromUser = await this.userRepository.findOne({ where: { id: fromId } });
        const toUser = await this.userRepository.findOne({ where: { id: toId } });
        if (fromId === toId) {
            throw new common_1.HttpException('USERS MUST HAVE DIFFERENT IDS', 400);
        }
        if (fromUser === null) {
            throw new common_1.HttpException((0, exports.NOT_FOUND_USER_WITH_ID)(fromId), 404);
        }
        if (toUser === null) {
            throw new common_1.HttpException((0, exports.NOT_FOUND_USER_WITH_ID)(toId), 404);
        }
        if (fromUser.defaultPurseId === null) {
            throw new common_1.HttpException((0, exports.USER_DOES_NOT_HAVE_PURSE)(fromId), 500);
        }
        if (toUser.defaultPurseId === null) {
            throw new common_1.HttpException((0, exports.USER_DOES_NOT_HAVE_PURSE)(toId), 500);
        }
        const fromPurse = await this.purseRepository.findOne({ where: { id: fromUser.defaultPurseId } });
        const toPurse = await this.purseRepository.findOne({ where: { id: toUser.defaultPurseId } });
        const modalSum = Math.abs(sum);
        if (fromPurse.balance < modalSum) {
            throw new common_1.HttpException((0, exports.NOT_ENOUGH_MONEY)(fromId), 400);
        }
        fromPurse.balance -= sum;
        toPurse.balance += sum;
        await this.purseSavingService.savePurse(fromPurse);
        if (withError) {
            throw new common_1.HttpException('UNEXPECTED ERROR WAS THROWN WHILE TRANSFER WAS IN PROGRESS', 500);
        }
        await this.purseRepository.save(toPurse);
        return new transfer_operation_result_dto_1.TransferOperationResultDto({
            sum,
            fromId,
            toId,
            fromBalance: fromPurse.balance,
            toBalance: toPurse.balance,
        });
    }
};
AppService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(user_model_1.User)),
    __param(1, (0, typeorm_2.InjectRepository)(purse_model_1.Purse)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        purse_saving_service_1.PurseSavingService,
        core_1.ModuleRef])
], AppService);
exports.AppService = AppService;
//# sourceMappingURL=app.service.js.map