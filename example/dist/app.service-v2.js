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
exports.AppServiceV2 = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const purse_model_1 = require("./model/purse.model");
const common_1 = require("@nestjs/common");
const nest_transact_1 = require("nest-transact");
const core_1 = require("@nestjs/core");
let AppServiceV2 = class AppServiceV2 extends nest_transact_1.TransactionFor {
    constructor(purseRepository, moduleRef) {
        super(moduleRef);
        this.purseRepository = purseRepository;
    }
    async savePurse(purse) {
        await this.purseRepository.save(purse);
    }
    async savePurseInTransaction(purse, transactionManager = null) {
        await transactionManager.save(purse_model_1.Purse, purse);
    }
    async savePurseInTransactionV2(purse, transactionManager) {
        await transactionManager.save(purse_model_1.Purse, purse);
    }
};
__decorate([
    (0, typeorm_2.Transaction)(),
    __param(1, (0, typeorm_2.TransactionManager)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purse_model_1.Purse, typeorm_2.EntityManager]),
    __metadata("design:returntype", Promise)
], AppServiceV2.prototype, "savePurseInTransaction", null);
AppServiceV2 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(purse_model_1.Purse)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        core_1.ModuleRef])
], AppServiceV2);
exports.AppServiceV2 = AppServiceV2;
//# sourceMappingURL=app.service-v2.js.map