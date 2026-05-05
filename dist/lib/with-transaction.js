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
var TransactionFor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionFor = exports.TransactionRepositoryError = exports.TransactionDependencyError = void 0;
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const core_1 = require("@nestjs/core");
const constants_1 = require("@nestjs/common/constants");
const _xor = require('lodash.xor');
class TransactionDependencyError extends Error {
    constructor(message, param) {
        super(`Transaction dependency resolution failed: ${message}`);
        this.param = param;
        this.name = 'TransactionDependencyError';
    }
}
exports.TransactionDependencyError = TransactionDependencyError;
class TransactionRepositoryError extends Error {
    constructor(message, repositoryName) {
        super(`Transaction repository error: ${message}`);
        this.repositoryName = repositoryName;
        this.name = 'TransactionRepositoryError';
    }
}
exports.TransactionRepositoryError = TransactionRepositoryError;
let TransactionFor = TransactionFor_1 = class TransactionFor {
    constructor(moduleRef) {
        this.moduleRef = moduleRef;
        this.logger = new common_1.Logger(TransactionFor_1.name);
        this.cache = new Map();
    }
    withTransaction(manager, transactionOptions = {}) {
        var _a;
        if (!manager) {
            throw new TransactionDependencyError('EntityManager is required', manager);
        }
        const startTime = Date.now();
        this.logger.debug(`Creating transactional instance of ${this.constructor.name}`);
        try {
            const excludedClasses = (_a = transactionOptions.excluded) !== null && _a !== void 0 ? _a : [];
            const newInstance = this.findArgumentsForProvider(this.constructor, manager, excludedClasses);
            this.cache.clear();
            const duration = Date.now() - startTime;
            this.logger.debug(`Transactional instance created in ${duration}ms`);
            return newInstance;
        }
        catch (error) {
            this.logger.error(`Failed to create transactional instance: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    getArgument(param, manager, excluded) {
        if (this.isForwardRef(param)) {
            return this.resolveForwardRef(param);
        }
        const id = this.extractDependencyId(param);
        if (this.cache.has(id)) {
            return this.cache.get(id);
        }
        if (this.isDependencyExcluded(id, excluded)) {
            return this.moduleRef.get(id, { strict: false });
        }
        if (id === core_1.ModuleRef.name) {
            return this.moduleRef;
        }
        const resolvedDependency = this.resolveDependency(param, id, manager, excluded);
        this.cache.set(id, resolvedDependency);
        return resolvedDependency;
    }
    isForwardRef(param) {
        return typeof param === 'object' && 'forwardRef' in param;
    }
    resolveForwardRef(param) {
        try {
            return this.moduleRef.get(param.forwardRef(), { strict: false });
        }
        catch (error) {
            throw new TransactionDependencyError(`Failed to resolve forwardRef: ${error instanceof Error ? error.message : 'Unknown error'}`, param);
        }
    }
    extractDependencyId(param) {
        if (typeof param === 'string') {
            return param;
        }
        if (typeof param === 'function') {
            return param.name;
        }
        throw new TransactionDependencyError('Cannot extract dependency ID from parameter', param);
    }
    isDependencyExcluded(id, excluded) {
        return excluded.length > 0 && excluded.some((ex) => ex.name === id);
    }
    resolveDependency(param, id, manager, excluded) {
        const canBeRepository = id.includes('Repository');
        if (typeof param === 'string' || canBeRepository) {
            return this.resolveRepositoryOrService(param, id, manager, canBeRepository);
        }
        else {
            return this.findArgumentsForProvider(param, manager, excluded);
        }
    }
    resolveRepositoryOrService(param, id, manager, canBeRepository) {
        let dependency = null;
        try {
            const token = typeof param === 'string' ? param : param;
            dependency = this.moduleRef.get(token, { strict: false });
        }
        catch (error) {
            throw new TransactionDependencyError(`Failed to resolve dependency "${id}": ${error instanceof Error ? error.message : 'Unknown error'}`, param);
        }
        if (!dependency) {
            throw new TransactionDependencyError(`Dependency "${id}" not found in module`, param);
        }
        if (dependency instanceof typeorm_1.Repository || canBeRepository) {
            return this.createTransactionalRepository(dependency, manager, id);
        }
        return dependency;
    }
    createTransactionalRepository(dependency, manager, id) {
        var _a;
        try {
            if (!((_a = dependency.metadata) === null || _a === void 0 ? void 0 : _a.target)) {
                throw new TransactionRepositoryError(`Repository metadata not found`, id);
            }
            const entity = dependency.metadata.target;
            return manager.getRepository(entity);
        }
        catch (error) {
            throw new TransactionRepositoryError(`Failed to create transactional repository: ${error instanceof Error ? error.message : 'Unknown error'}`, id);
        }
    }
    findArgumentsForProvider(constructor, manager, excluded) {
        try {
            const constructorArgs = this.resolveConstructorArguments(constructor, manager, excluded);
            return new constructor(...constructorArgs);
        }
        catch (error) {
            throw new TransactionDependencyError(`Failed to create instance of ${constructor.name}: ${error instanceof Error ? error.message : 'Unknown error'}`, constructor);
        }
    }
    resolveConstructorArguments(constructor, manager, excluded) {
        const metadataKeys = Reflect.getMetadataKeys(constructor);
        const args = [];
        const missingParams = [];
        for (const key of metadataKeys) {
            if (key === constants_1.PARAMTYPES_METADATA) {
                const paramTypes = this.getParameterTypes(constructor);
                const selfDeclaredTypes = this.getSelfDeclaredTypes(constructor);
                this.processParameterTypes(paramTypes, selfDeclaredTypes, args, missingParams, manager, excluded);
            }
        }
        for (const paramName of missingParams) {
            const argument = this.getArgument(paramName, manager, excluded);
            args.push(argument);
        }
        return args;
    }
    getParameterTypes(constructor) {
        const cached = TransactionFor_1.metadataCache.get(constructor);
        if (cached) {
            return cached.paramTypes;
        }
        const paramTypes = Reflect.getMetadata(constants_1.PARAMTYPES_METADATA, constructor);
        if (!Array.isArray(paramTypes)) {
            throw new TransactionDependencyError('Invalid parameter types metadata', constructor);
        }
        const selfDeclaredTypes = this.getSelfDeclaredTypesInternal(constructor);
        TransactionFor_1.metadataCache.set(constructor, { paramTypes, selfDeclaredTypes });
        return paramTypes;
    }
    getSelfDeclaredTypes(constructor) {
        const cached = TransactionFor_1.metadataCache.get(constructor);
        if (cached) {
            return cached.selfDeclaredTypes;
        }
        return this.getSelfDeclaredTypesInternal(constructor);
    }
    getSelfDeclaredTypesInternal(constructor) {
        const selfDeclaredTypes = Reflect.getMetadata(constants_1.SELF_DECLARED_DEPS_METADATA, constructor);
        return Array.isArray(selfDeclaredTypes) ? selfDeclaredTypes : [];
    }
    processParameterTypes(paramTypes, selfDeclaredTypes, args, missingParams, manager, excluded) {
        for (const param of paramTypes) {
            if (!param) {
                this.handleMissingParameterTypes(paramTypes, selfDeclaredTypes, missingParams);
                return;
            }
            const argument = this.getArgument(param, manager, excluded);
            args.push(argument);
        }
    }
    handleMissingParameterTypes(paramTypes, selfDeclaredTypes, missingParams) {
        const paramTypeNames = this.extractParameterNames(paramTypes);
        const selfDeclaredNames = this.extractSelfDeclaredNames(selfDeclaredTypes);
        const missingTypeNames = _xor(paramTypeNames, selfDeclaredNames);
        for (const typeName of missingTypeNames) {
            if (typeof typeName === 'string') {
                missingParams.push(typeName);
            }
        }
    }
    extractParameterNames(paramTypes) {
        return paramTypes
            .filter(Boolean)
            .map(param => {
            if (typeof param === 'string')
                return param;
            if (typeof param === 'function')
                return param.name;
            if (typeof param === 'object' && 'name' in param)
                return param.name;
            return '';
        })
            .filter(Boolean);
    }
    extractSelfDeclaredNames(selfDeclaredTypes) {
        return selfDeclaredTypes
            .filter(Boolean)
            .map(item => {
            if (typeof item.param === 'string')
                return item.param;
            if (typeof item.param === 'object' && 'name' in item.param)
                return item.param.name;
            return '';
        })
            .filter(Boolean);
    }
    static clearMetadataCache() {
        TransactionFor_1.metadataCache.clear();
    }
    static getCacheStats() {
        return {
            size: TransactionFor_1.metadataCache.size,
            keys: Array.from(TransactionFor_1.metadataCache.keys()).map(cls => cls.name)
        };
    }
    static isTransactional(instance) {
        return instance instanceof TransactionFor_1;
    }
};
exports.TransactionFor = TransactionFor;
TransactionFor.metadataCache = new Map();
exports.TransactionFor = TransactionFor = TransactionFor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModuleRef])
], TransactionFor);
