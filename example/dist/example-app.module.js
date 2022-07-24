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
const example_app_controller_1 = require("./example-app.controller");
const example_app_service_1 = require("./example-app.service");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("./config");
const user_model_1 = require("./model/user.model");
const purse_model_1 = require("./model/purse.model");
const purse_saving_service_1 = require("./purse-saving.service");
let ExampleAppModule = class ExampleAppModule {
};
ExampleAppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot(config_1.Config.typeOrmConfig),
            typeorm_1.TypeOrmModule.forFeature([
                user_model_1.User,
                purse_model_1.Purse,
            ]),
        ],
        controllers: [
            example_app_controller_1.ExampleAppController,
        ],
        providers: [
            example_app_service_1.ExampleAppService,
            purse_saving_service_1.PurseSavingService,
        ],
    })
], ExampleAppModule);
exports.ExampleAppModule = ExampleAppModule;
//# sourceMappingURL=example-app.module.js.map