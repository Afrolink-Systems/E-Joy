# Order Service

NestJS GraphQL backend for E-Joy. This service owns the Prisma schema, PostgreSQL access, order lifecycle, shop/admin APIs, staff workflows, payments, uploads, and local seed data.

## Local Setup From Repo Root

Run these commands from the repository root:

```bash
corepack enable
corepack prepare pnpm@10.33.0 --activate
pnpm install
docker compose up -d postgres redis kafka meilisearch
docker compose run --rm prisma-init
pnpm --filter order-service run prisma:generate
pnpm --filter order-service run dev
```

GraphQL runs at:

```text
http://localhost:9602/graphql
```

## Prisma And Seed Data

The Docker setup command:

```bash
docker compose run --rm prisma-init
```

runs:

```bash
pnpm --filter order-service exec prisma migrate dev
pnpm --filter order-service exec prisma generate
pnpm --filter order-service run db:seed
```

Use migrations as the source of truth. Do not use `prisma db push` for normal
development because it changes the database without creating migration files.
When `prisma/schema.prisma` changes locally, create/apply a migration with:

```bash
pnpm --filter order-service exec prisma migrate dev --name <migration-name>
```

Production should only apply committed migrations:

```bash
pnpm --filter order-service exec prisma migrate deploy
```

Seeded local data includes:

- Shop ID: `test-shop-001`
- Manager phone: `0911000000`
- Manager password: `Admin@123456`
- Compact image-backed menu and dining tables

Platform owner / super admin creation is handled separately by:

```bash
pnpm --filter order-service run db:bootstrap-owner
```

To rerun seed data only:

```bash
pnpm --filter order-service run db:seed
```

To reset all local database data:

```bash
docker compose down -v
docker compose up -d postgres redis kafka meilisearch
docker compose run --rm prisma-init
pnpm --filter order-service run prisma:generate
```

Run `prisma:generate` on the host after Docker init, especially on Windows/macOS. The Docker container can prepare the database, but the local TypeScript dev server needs the generated Prisma Client in the host pnpm layout.

## Environment

For host/local dev, `apps/order-service/.env` should point at the Compose-exposed PostgreSQL port:

```bash
DATABASE_URL=postgresql://ejoy:ejoy123@127.0.0.1:5433/ejoy
```

Inside Docker Compose, use the service hostname:

```bash
DATABASE_URL=postgresql://ejoy:ejoy123@postgres:5432/ejoy
```

Do not use `localhost:5432` from inside a Compose container; that points to the container itself, not the PostgreSQL service.

Minimum local auth/customer account values:

```bash
JWT_ACCESS_SECRET=<replace-with-strong-random-secret-32-plus-chars>
JWT_REFRESH_SECRET=<replace-with-different-strong-random-secret-32-plus-chars>
JWT_ISSUER=ejoy
JWT_AUDIENCE=ejoy-apps
CUSTOMER_WEB_ORIGIN=http://localhost:9601
CUSTOMER_PASSKEY_RP_NAME=E-Joy
CUSTOMER_PASSKEY_RP_ID=localhost
```

Customer phone OTP is provider-based. Choose one primary provider:

```bash
SMS_PROVIDER=sms_ethiopia
```

Supported values are `sms_ethiopia`, `afromessage`, and `noop`.

SMS Ethiopia:

```bash
SMS_PROVIDER=sms_ethiopia
SMS_ETHIOPIA_API_BASE_URL=https://smsethiopia.et
SMS_ETHIOPIA_API_KEY=<your-api-key>
```

AfroMessage:

```bash
SMS_PROVIDER=afromessage
AFROMESSAGE_TOKEN=<your-token>
AFROMESSAGE_IDENTIFIER_ID=<optional-identifier>
AFROMESSAGE_SENDER_NAME=<optional-sender-name>
AFROMESSAGE_CALLBACK_URL=<optional-public-callback-url>
```

Local/dev without sending real SMS:

```bash
SMS_PROVIDER=noop
CUSTOMER_OTP_EXPOSE_CODE=true
```

`CUSTOMER_OTP_EXPOSE_CODE=true` should not be used in production. The customer
web UI does not display dev OTP codes, but backend responses may include them
for local API testing.

To inspect raw provider responses while debugging SMS sends:

```bash
SMS_PROVIDER_DEBUG=true
```

## Common Commands

```bash
pnpm --filter order-service run dev
pnpm --filter order-service run test
pnpm --filter order-service run type-check
pnpm --filter order-service run prisma:generate
pnpm --filter order-service exec prisma generate
pnpm --filter order-service exec prisma migrate dev --name <migration-name>
pnpm --filter order-service exec prisma migrate deploy
pnpm --filter order-service run db:seed
pnpm --filter order-service run db:bootstrap-owner
```

Production-like startup on Render runs:

```bash
pnpm --filter order-service run start:render
```

That applies Prisma migrations, bootstraps the platform owner from environment
variables, and starts `dist/src/main.js`.

## Troubleshooting

If `docker compose run --rm prisma-init` fails with:

```text
Cannot find module '/workspace/apps/order-service/node_modules/prisma/build/index.js'
```

then dependencies are missing on the host. Run this from the repo root:

```bash
corepack enable
corepack prepare pnpm@10.33.0 --activate
pnpm install
docker compose run --rm prisma-init
pnpm --filter order-service run prisma:generate
```

If Corepack asks to download pnpm, accept it or run `corepack prepare pnpm@10.33.0 --activate` first. The repo intentionally uses the pnpm version pinned in the root `package.json`.

If `pnpm dev` or `pnpm --filter order-service run dev` reports that `@prisma/client` has no exported `PrismaClient`, `OrderState`, or `Prisma`, the Prisma Client was not generated for the host dev environment. Run:

```bash
pnpm --filter order-service run prisma:generate
```
