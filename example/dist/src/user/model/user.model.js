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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const api_model_property_decorator_1 = require("@nestjs/swagger/dist/decorators/api-model-property.decorator");
const purse_model_1 = require("../../transfer/model/purse.model");
let User = class User {
};
__decorate([
    (0, api_model_property_decorator_1.ApiModelProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, api_model_property_decorator_1.ApiModelProperty)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, api_model_property_decorator_1.ApiModelPropertyOptional)(),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "defaultPurseId", void 0);
__decorate([
    (0, api_model_property_decorator_1.ApiModelPropertyOptional)({
        type: () => purse_model_1.Purse,
    }),
    (0, typeorm_1.OneToOne)(() => purse_model_1.Purse, purse => purse.user),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", purse_model_1.Purse)
], User.prototype, "defaultPurse", void 0);
__decorate([
    (0, api_model_property_decorator_1.ApiModelPropertyOptional)({
        type: () => purse_model_1.Purse,
        isArray: true,
    }),
    (0, typeorm_1.OneToMany)(() => purse_model_1.Purse, purse => purse.user),
    __metadata("design:type", Array)
], User.prototype, "purses", void 0);
User = __decorate([
    (0, typeorm_1.Entity)({ name: 'user' })
], User);
exports.User = User;
//# sourceMappingURL=user.model.js.map