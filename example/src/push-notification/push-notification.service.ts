import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PushNotificationService {
  private count = 0;

  async sendPushToUser(userId: number): Promise<void> {
    this.count += 1;
    Logger.log(`Push notification to user "${userId}" was sended. Total amount of push notifications: ${this.count}`);
  }
}
