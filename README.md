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

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).



# Garden Planner API

Authenticated NestJS backend for managing gardens, beds, and scheduled tasks.
Supports date-only scheduling and a “Today’s Walk” workflow.
Built as part of a portfolio-ready backend project.

# Garden Planner API

Authenticated NestJS backend for managing Gardens → Beds → Tasks with date-only scheduling and a “Today’s Walk” endpoint.

---

## Tech Stack

* NestJS
* Auth0 (JWT, RS256, JWKS)
* In-memory data store (for now)
* Owner scoping via `req.user.sub`

---

## Prerequisites

* Node 18+
* Auth0 tenant
* Access token (Machine-to-Machine or User login)

---

## Environment Variables

Create a `.env` file in the project root:

```
AUTH0_DOMAIN=dev-rb3y4atmtjolbkdu.us.auth0.com
AUTH0_AUDIENCE=https://garden-planner-api
AUTH0_ISSUER=https://dev-rb3y4atmtjolbkdu.us.auth0.com/
```

---

## Install & Run

```bash
npm install
npm run start:dev
```

API runs at:

```
http://localhost:3000
```

---

## Authentication

All endpoints require:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Example:

```bash
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

# Gardens

## Create Garden

```bash
curl -X POST http://localhost:3000/gardens \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Veg Patch\",\"region\":\"PEEL\"}"
```

Regions:

* PERTH
* PEEL
* SOUTHWEST_WA

---

## List Gardens

```bash
curl http://localhost:3000/gardens \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Get One Garden

```bash
curl http://localhost:3000/gardens/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Update Garden

```bash
curl -X PATCH http://localhost:3000/gardens/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Front Veg Patch\"}"
```

---

## Delete Garden

```bash
curl -X DELETE http://localhost:3000/gardens/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

# Beds

## Create Bed

```bash
curl -X POST http://localhost:3000/gardens/1/beds \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Tomatoes\",\"positionIndex\":0}"
```

`positionIndex` must be unique within a garden.

---

## List Beds (Sorted)

```bash
curl http://localhost:3000/gardens/1/beds \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Update Bed

```bash
curl -X PATCH http://localhost:3000/beds/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"positionIndex\":1}"
```

---

## Delete Bed

```bash
curl -X DELETE http://localhost:3000/beds/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

# Tasks

Date format must be:

```
YYYY-MM-DD
```

---

## Create Task

```bash
curl -X POST http://localhost:3000/beds/1/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Water\",\"dueOn\":\"2026-03-03\"}"
```

---

## List Tasks

```bash
curl http://localhost:3000/beds/1/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Optional filters:

```
?dueOn=2026-03-03
?status=OPEN
```

Example:

```bash
curl "http://localhost:3000/beds/1/tasks?dueOn=2026-03-03&status=OPEN" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Mark Task Done

```bash
curl -X PATCH http://localhost:3000/tasks/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"DONE\"}"
```

---

## Delete Task

```bash
curl -X DELETE http://localhost:3000/tasks/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

# Today’s Walk

Returns beds in walking order with OPEN tasks due today (Australia/Perth time).

---

## Default (Due Today Only)

```bash
curl http://localhost:3000/gardens/1/today-walk \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Include Undated Tasks

```bash
curl "http://localhost:3000/gardens/1/today-walk?includeUndated=true" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

# Notes

* All resources are scoped by Auth0 `sub`.
* In-memory storage resets when the server restarts.
* Designed for easy migration to PostgreSQL + Prisma.

---

## Next Steps

* Add persistence layer
* Add Swagger documentation
* Deploy to AWS
