"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferModule = void 0;
const common_1 = require("@nestjs/common");
const transfer_service_1 = require("./transfer.service");
const transfer_controller_1 = require("./transfer.controller");
const user_module_1 = require("../user/user.module");
const push_notification_module_1 = require("../push-notification/push-notification.module");
const typeorm_1 = require("@nestjs/typeorm");
const purse_model_1 = require("./model/purse.model");
const purse_service_1 = require("./purse.service");
const purse_repository_1 = require("./purse.repository");
let TransferModule = class TransferModule {
};
TransferModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                purse_model_1.Purse,
                purse_repository_1.PurseRepository,
            ]),
            user_module_1.UserModule,
            push_notification_module_1.PushNotificationModule,
        ],
        providers: [
            transfer_service_1.TransferService,
            purse_service_1.PurseService,
        ],
        controllers: [
            transfer_controller_1.TransferController,
        ],
    })
], TransferModule);
exports.TransferModule = TransferModule;
//# sourceMappingURL=transfer.module.js.map