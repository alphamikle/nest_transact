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
exports.Purse = void 0;
const typeorm_1 = require("typeorm");
const api_model_property_decorator_1 = require("@nestjs/swagger/dist/decorators/api-model-property.decorator");
const class_validator_1 = require("class-validator");
const user_model_1 = require("../../user/model/user.model");
let Purse = class Purse {
    constructor(params) {
        var _a, _b, _c;
        this.id = (_a = params === null || params === void 0 ? void 0 : params.id) !== null && _a !== void 0 ? _a : 0;
        this.balance = (_b = params === null || params === void 0 ? void 0 : params.balance) !== null && _b !== void 0 ? _b : 0;
        this.userId = (_c = params === null || params === void 0 ? void 0 : params.userId) !== null && _c !== void 0 ? _c : 0;
    }
};
__decorate([
    (0, api_model_property_decorator_1.ApiModelProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Purse.prototype, "id", void 0);
__decorate([
    (0, api_model_property_decorator_1.ApiModelProperty)(),
    (0, class_validator_1.Min)(0),
    (0, typeorm_1.Column)({ nullable: false, default: 0, type: 'integer' }),
    __metadata("design:type", Number)
], Purse.prototype, "balance", void 0);
__decorate([
    (0, api_model_property_decorator_1.ApiModelProperty)(),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Purse.prototype, "userId", void 0);
__decorate([
    (0, api_model_property_decorator_1.ApiModelPropertyOptional)({
        type: () => user_model_1.User,
    }),
    (0, typeorm_1.ManyToOne)(() => user_model_1.User, user => user.purses),
    __metadata("design:type", user_model_1.User)
], Purse.prototype, "user", void 0);
Purse = __decorate([
    (0, typeorm_1.Entity)({ name: 'purse' }),
    __metadata("design:paramtypes", [Object])
], Purse);
exports.Purse = Purse;
//# sourceMappingURL=purse.model.js.map