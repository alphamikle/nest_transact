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
exports.TransferParamsDTO = void 0;
const api_model_property_decorator_1 = require("@nestjs/swagger/dist/decorators/api-model-property.decorator");
class TransferParamsDTO {
    static new({ sum, userIdTo, userIdFrom, withError }) {
        const it = new TransferParamsDTO();
        it.sum = sum;
        it.userIdTo = userIdTo;
        it.userIdFrom = userIdFrom;
        it.withError = withError;
        return it;
    }
}
__decorate([
    (0, api_model_property_decorator_1.ApiModelProperty)({
        default: 200,
    }),
    __metadata("design:type", Number)
], TransferParamsDTO.prototype, "sum", void 0);
__decorate([
    (0, api_model_property_decorator_1.ApiModelProperty)({
        default: 1,
    }),
    __metadata("design:type", Number)
], TransferParamsDTO.prototype, "userIdFrom", void 0);
__decorate([
    (0, api_model_property_decorator_1.ApiModelProperty)({
        default: 2,
    }),
    __metadata("design:type", Number)
], TransferParamsDTO.prototype, "userIdTo", void 0);
__decorate([
    (0, api_model_property_decorator_1.ApiModelProperty)({
        default: false,
    }),
    __metadata("design:type", Boolean)
], TransferParamsDTO.prototype, "withError", void 0);
exports.TransferParamsDTO = TransferParamsDTO;
//# sourceMappingURL=transfer-params.dto.js.map