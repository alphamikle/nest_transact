"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTransactional = isTransactional;
exports.TransactionalMethod = TransactionalMethod;
function isTransactional(obj) {
    return obj && typeof obj.withTransaction === 'function';
}
function TransactionalMethod(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args) {
        if (this.constructor.name.includes('Transactional')) {
            return originalMethod.apply(this, args);
        }
        throw new Error(`Method ${propertyKey} requires transaction context. Use withTransaction() first.`);
    };
    return descriptor;
}
