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
exports.PurseService = void 0;
const common_1 = require("@nestjs/common");
const tools_1 = require("../tools");
const purse_repository_1 = require("./purse.repository");
let PurseService = class PurseService {
    constructor(purseRepository) {
        this.purseRepository = purseRepository;
    }
    async findPurseById(purseId) {
        const purse = await this.purseRepository.findPurseById(purseId);
        if ((0, tools_1.isNotDefined)(purse)) {
            throw new common_1.HttpException(`NOT FOUND PURSE WITH ID "${purseId}"`, 404);
        }
        return purse;
    }
    async savePurse(purse) {
        return this.purseRepository.save(purse);
    }
};
PurseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [purse_repository_1.PurseRepository])
], PurseService);
exports.PurseService = PurseService;
//# sourceMappingURL=purse.service.js.map