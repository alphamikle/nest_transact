"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleAppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("./config");
const user_module_1 = require("./user/user.module");
const transfer_module_1 = require("./transfer/transfer.module");
const push_notification_module_1 = require("./push-notification/push-notification.module");
let ExampleAppModule = class ExampleAppModule {
};
ExampleAppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot(config_1.Config.typeOrmConfig),
            user_module_1.UserModule,
            transfer_module_1.TransferModule,
            push_notification_module_1.PushNotificationModule,
        ],
    })
], ExampleAppModule);
exports.ExampleAppModule = ExampleAppModule;
//# sourceMappingURL=example-app.module.js.map