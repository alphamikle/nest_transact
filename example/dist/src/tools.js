"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNotDefined = exports.isDefined = void 0;
function isDefined(value) {
    if (value === null || value === undefined) {
        return false;
    }
    return true;
}
exports.isDefined = isDefined;
function isNotDefined(value) {
    return !isDefined(value);
}
exports.isNotDefined = isNotDefined;
//# sourceMappingURL=tools.js.map