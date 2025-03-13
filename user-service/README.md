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

## User Service

This service handles user authentication, registration, and profile management.

## 🚀 Features
- User Registration
- User Login (JWT-based)
- Refresh Token with HTTP-only cookies
- Logout
- User Management (CRUD)

## 📜 API Endpoints

### 🛠 Authentication
| Method | Endpoint      | Description                     |
|--------|-------------|---------------------------------|
| POST   | `/auth/register` | Register a new user, send it to chat-service via kafka |
| POST   | `/auth/login` | Authenticate user & get tokens |
| POST   | `/auth/refresh` | Refresh access token |
| POST   | `/auth/logout` | Logout user & clear cookies |

### 👤 User Management
| Method | Endpoint      | Description                     |
|--------|-------------|---------------------------------|
| POST   | `/users` | Create new user with additional field |
| GET    | `/users` | Fetch all users |
| GET    | `/users/:id` | Get user by ID |
| PATCH  | `/users/:id` | Update user, sync with chat-service via kafka |
| DELETE | `/users/:id` | Delete user, sync with chat-service via kafka |

## 🔐 Authentication & Authorization
- Uses **JWT Bearer Tokens** for API requests.
- **Refresh Tokens** are stored in **HTTP-only cookies** for security.

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
