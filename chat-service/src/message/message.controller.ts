import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class MessageController {
  private readonly logger = new Logger(MessageController.name);

  @EventPattern('user.registered')
  async handleUserRegistered(@Payload() data: { userId: string; username: string }) {
    this.logger.log(`New user registered: ${data.username} (ID: ${data.userId})`);
  }
}
