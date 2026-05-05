"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRANSACTION_METADATA_KEY = void 0;
exports.Transactional = Transactional;
exports.TransactionalService = TransactionalService;
exports.RequireTransaction = RequireTransaction;
exports.LogTransaction = LogTransaction;
const common_1 = require("@nestjs/common");
exports.TRANSACTION_METADATA_KEY = 'transaction:config';
function Transactional(config = {}) {
    return function (target, propertyKey, descriptor) {
        (0, common_1.SetMetadata)(exports.TRANSACTION_METADATA_KEY, config)(target, propertyKey, descriptor);
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            if (this._isTransactional) {
                return originalMethod.apply(this, args);
            }
            throw new Error(`Method ${target.constructor.name}.${propertyKey} is marked as @Transactional but was called outside transaction context. ` +
                `Use withTransaction() to create transactional instance first.`);
        };
        return descriptor;
    };
}
function TransactionalService() {
    return function (constructor) {
        (0, common_1.SetMetadata)('transactional:service', true)(constructor);
        return class extends constructor {
            constructor() {
                super(...arguments);
                this._isTransactionalService = true;
            }
        };
    };
}
function RequireTransaction() {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            if (!this._isTransactional && !this.constructor.name.includes('Transactional')) {
                throw new Error(`Method ${target.constructor.name}.${propertyKey} requires transaction context. ` +
                    `Use withTransaction() to create transactional instance first.`);
            }
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
function LogTransaction(logLevel = 'debug') {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const startTime = Date.now();
            const className = target.constructor.name;
            if (this.logger && typeof this.logger[logLevel] === 'function') {
                this.logger[logLevel](`Starting transaction method: ${className}.${propertyKey}`);
            }
            try {
                const result = await originalMethod.apply(this, args);
                const duration = Date.now() - startTime;
                if (this.logger && typeof this.logger[logLevel] === 'function') {
                    this.logger[logLevel](`Completed transaction method: ${className}.${propertyKey} in ${duration}ms`);
                }
                return result;
            }
            catch (error) {
                const duration = Date.now() - startTime;
                if (this.logger && typeof this.logger.error === 'function') {
                    this.logger.error(`Failed transaction method: ${className}.${propertyKey} after ${duration}ms`, error);
                }
                throw error;
            }
        };
        return descriptor;
    };
}
