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
var TransactionUtils_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionUtils = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let TransactionUtils = TransactionUtils_1 = class TransactionUtils {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(TransactionUtils_1.name);
        this.stats = {
            totalTransactions: 0,
            successfulTransactions: 0,
            rolledBackTransactions: 0,
            averageDuration: 0,
            errorCount: 0,
        };
    }
    async executeWithTransaction(callback, config = {}) {
        var _a;
        const startTime = Date.now();
        let attempts = 0;
        const maxRetries = (_a = config.maxRetries) !== null && _a !== void 0 ? _a : 1;
        let lastError = null;
        let wasRolledBack = false;
        this.stats.totalTransactions++;
        while (attempts < maxRetries) {
            attempts++;
            const queryRunner = this.dataSource.createQueryRunner();
            try {
                await queryRunner.connect();
                await this.configureTransaction(queryRunner, config);
                await queryRunner.startTransaction();
                if (config.enableLogging) {
                    this.logger.debug(`Transaction started (attempt ${attempts}/${maxRetries})`);
                }
                const result = await this.executeWithTimeout(() => callback(queryRunner.manager), config.timeout);
                await queryRunner.commitTransaction();
                const duration = Date.now() - startTime;
                this.updateSuccessStats(duration);
                if (config.enableLogging) {
                    this.logger.debug(`Transaction committed successfully in ${duration}ms`);
                }
                return {
                    data: result,
                    duration,
                    attempts,
                    wasRolledBack,
                };
            }
            catch (error) {
                lastError = error;
                wasRolledBack = true;
                try {
                    await queryRunner.rollbackTransaction();
                    if (config.enableLogging) {
                        this.logger.warn(`Transaction rolled back (attempt ${attempts}/${maxRetries}): ${lastError.message}`);
                    }
                }
                catch (rollbackError) {
                    this.logger.error('Failed to rollback transaction', rollbackError);
                }
                if (attempts >= maxRetries || !this.isRetryableError(lastError)) {
                    break;
                }
                await this.delay(this.calculateRetryDelay(attempts));
            }
            finally {
                await queryRunner.release();
            }
        }
        const duration = Date.now() - startTime;
        this.updateErrorStats();
        throw new Error(`Transaction failed after ${attempts} attempts: ${(lastError === null || lastError === void 0 ? void 0 : lastError.message) || 'Unknown error'}`);
    }
    async executeBatch(operations, config = {}) {
        return this.executeWithTransaction(async (manager) => {
            const results = [];
            for (const operation of operations) {
                const result = await operation(manager);
                results.push(result);
            }
            return results;
        }, config).then(result => result.data);
    }
    getStats() {
        return { ...this.stats };
    }
    resetStats() {
        this.stats = {
            totalTransactions: 0,
            successfulTransactions: 0,
            rolledBackTransactions: 0,
            averageDuration: 0,
            errorCount: 0,
        };
    }
    async configureTransaction(queryRunner, config) {
        if (config.isolationLevel) {
            await queryRunner.query(`SET TRANSACTION ISOLATION LEVEL ${config.isolationLevel}`);
        }
    }
    async executeWithTimeout(operation, timeout) {
        if (!timeout) {
            return operation();
        }
        return Promise.race([
            operation(),
            new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`Transaction timeout after ${timeout}ms`)), timeout);
            }),
        ]);
    }
    isRetryableError(error) {
        const retryableErrors = [
            'deadlock',
            'lock timeout',
            'connection lost',
            'connection reset',
        ];
        return retryableErrors.some(pattern => error.message.toLowerCase().includes(pattern));
    }
    calculateRetryDelay(attempt) {
        return Math.min(100 * Math.pow(2, attempt - 1), 5000);
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    updateSuccessStats(duration) {
        this.stats.successfulTransactions++;
        this.updateAverageDuration(duration);
    }
    updateErrorStats() {
        this.stats.errorCount++;
        this.stats.rolledBackTransactions++;
    }
    updateAverageDuration(duration) {
        const total = this.stats.successfulTransactions;
        this.stats.averageDuration =
            (this.stats.averageDuration * (total - 1) + duration) / total;
    }
};
exports.TransactionUtils = TransactionUtils;
exports.TransactionUtils = TransactionUtils = TransactionUtils_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], TransactionUtils);
