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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionFor = void 0;
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const core_1 = require("@nestjs/core");
const constants_1 = require("@nestjs/common/constants");
const lodash_xor_1 = __importDefault(require("lodash.xor"));
let TransactionFor = class TransactionFor {
    constructor(moduleRef) {
        this.moduleRef = moduleRef;
        this.cache = new Map();
    }
    withTransaction(manager, transactionOptions = {}) {
        var _a;
        const newInstance = this.findArgumentsForProvider(this.constructor, manager, (_a = transactionOptions.excluded) !== null && _a !== void 0 ? _a : []);
        this.cache.clear();
        return newInstance;
    }
    getArgument(param, manager, excluded) {
        if (typeof param === 'object' && 'forwardRef' in param) {
            return this.moduleRef.get(param.forwardRef(), { strict: false });
        }
        const id = typeof param === 'string' ? param : typeof param === 'function' ? param.name : undefined;
        if (id === undefined) {
            throw new Error(`Can't get injection token from ${param}`);
        }
        const isExcluded = excluded.length > 0 && excluded.some((ex) => ex.name === id);
        if (id === `${core_1.ModuleRef.name}`) {
            return this.moduleRef;
        }
        if (isExcluded) {
            return this.moduleRef.get(id, { strict: false });
        }
        let argument;
        if (this.cache.has(id)) {
            return this.cache.get(id);
        }
        const canBeRepository = id.includes('Repository');
        if (typeof param === 'string' || canBeRepository) {
            let dependency = null;
            try {
                if (canBeRepository) {
                    return manager.getCustomRepository(param);
                }
            }
            catch (error) {
                dependency = this.moduleRef.get(param, { strict: false });
            }
            if (dependency instanceof typeorm_1.Repository || canBeRepository) {
                const entity = dependency.metadata.target;
                argument = manager.getRepository(entity);
            }
            else {
                if (!dependency) {
                    dependency = this.moduleRef.get(param, { strict: false });
                }
                argument = dependency;
            }
        }
        else {
            argument = this.findArgumentsForProvider(param, manager, excluded);
        }
        this.cache.set(id, argument);
        return argument;
    }
    findArgumentsForProvider(constructor, manager, excluded) {
        const args = [];
        const keys = Reflect.getMetadataKeys(constructor);
        const missingParams = [];
        keys.forEach((key) => {
            if (key === constants_1.PARAMTYPES_METADATA) {
                const paramTypes = Reflect.getMetadata(key, constructor);
                const selfParamTypes = Reflect.getMetadata(constants_1.SELF_DECLARED_DEPS_METADATA, constructor);
                for (const param of paramTypes) {
                    if (!param) {
                        const paramTypeNameMap = paramTypes
                            .filter((item) => !!item)
                            .reduce((acc, currVal, currIdx) => {
                            acc.set(currVal.name, currIdx);
                            return acc;
                        }, new Map());
                        const selfParamTypeMap = selfParamTypes
                            .filter((item) => !!item)
                            .reduce((acc, currVal, currIdx) => {
                            if (typeof currVal.param === 'string') {
                                acc.set(currVal.param, currIdx);
                            }
                            else {
                                acc.set(currVal.param.name, currIdx);
                            }
                            return acc;
                        }, new Map());
                        const exclusion = (0, lodash_xor_1.default)(Array.from(paramTypeNameMap.keys()), Array.from(selfParamTypeMap.keys()));
                        exclusion.forEach((item) => {
                            var _a;
                            if (paramTypeNameMap.has(item)) {
                                const val = paramTypes[paramTypeNameMap.get(item)];
                                missingParams.push(val.name);
                            }
                            if (selfParamTypeMap.has(item)) {
                                const val = selfParamTypes[selfParamTypeMap.get(item)];
                                missingParams.push(typeof (val === null || val === void 0 ? void 0 : val.param) === 'object' ? (_a = val === null || val === void 0 ? void 0 : val.param) === null || _a === void 0 ? void 0 : _a.name : val.param);
                            }
                        });
                        return;
                    }
                    const argument = this.getArgument(param, manager, excluded);
                    args.push(argument);
                }
            }
        });
        missingParams.forEach((item) => {
            const argument = this.getArgument(item, manager, excluded);
            args.push(argument);
        });
        return new constructor(...args);
    }
};
TransactionFor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModuleRef])
], TransactionFor);
exports.TransactionFor = TransactionFor;
