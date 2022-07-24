"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleExceptionFilter = void 0;
class ExampleExceptionFilter {
    catch(exception, host) {
        var _a;
        const context = host.switchToHttp();
        const response = context.getResponse();
        const isError = exception instanceof Error;
        const status = (_a = exception.status) !== null && _a !== void 0 ? _a : 500;
        const message = isError ? exception.message : exception.toString();
        response.status(status).json({
            code: status,
            message,
        });
    }
}
exports.ExampleExceptionFilter = ExampleExceptionFilter;
//# sourceMappingURL=example.exception-filter.js.map