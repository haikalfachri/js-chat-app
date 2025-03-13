<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Chat Service

This service handles real-time messaging using WebSockets and Kafka.

## 🚀 Features
- **Real-time Messaging** with WebSockets
- **Message Persistence** using Kafka
- **JWT Authentication** for WebSocket connections
- **Offline Message Storage** (Kafka ensures message delivery when users are offline)

## 📜 API Endpoints

### 💬 Message
| Method | Endpoint      | Description                     |
|--------|-------------|---------------------------------|
| POST   | `/messages` | Create message, type new message |
| GET  | `/messages/:user1/:user2` | Retreive chat history between 2 users|


## 📜 WebSocket Events
| Event Name | Description                     |
|--------|---------------------------------|
| newMessage   | listening to created message by sender |

### ✅ Authentication
- **Clients must send JWT tokens** in the WebSocket handshake.
- **Example:**
  ```javascript
  const socket = io('http://localhost:3001', {
    extraHeaders: { authorization: `Bearer YOUR_JWT_TOKEN_HERE` }
  });

### ➡️ Additional Information
- Connect to websocket (socket.io) and add websocket event to listen to new messages,
- Create message is like a typing message and hit send button,

## 🛠 Setup & Installation
```sh
# Install dependencies
npm install

# Set up environment variables (.env)
cp .env.example .env

# Run migrations
npx prisma migrate dev

# Start the service 
npm run start

# Or watching
npm run start:dev
