import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication) {
    const config = new DocumentBuilder()
        .setTitle('Chat Service API')
        .setDescription(`API documentation for the chat service.

  **WebSocket Connection:**
  - Since swagger does not support WebSocket, you can connect to the WebSocket server using a tool like **Postman**.
  - Connect via Socket.IO: **ws://your-api-url?userId=**
  - **Available Events:**
    - **newMessage**: Receive new messages
  `
        )
        .setVersion('1.0')
        .addTag('Messages')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            customSiteTitle: 'Messaging API',
        },
    });
}
