"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationService = void 0;
const common_1 = require("@nestjs/common");
let PushNotificationService = class PushNotificationService {
    constructor() {
        this.count = 0;
    }
    async sendPushToUser(userId) {
        this.count += 1;
        common_1.Logger.log(`Push notification to user "${userId}" was sended. Total amount of push notifications: ${this.count}`);
    }
};
PushNotificationService = __decorate([
    (0, common_1.Injectable)()
], PushNotificationService);
exports.PushNotificationService = PushNotificationService;
//# sourceMappingURL=push-notification.service.js.map