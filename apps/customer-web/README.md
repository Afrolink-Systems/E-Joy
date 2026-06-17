# Customer Web

React + Vite customer ordering app for E-Joy. Customers can scan a table QR,
browse the menu, manage cart/checkout, track device-local orders as guests, and
optionally sign in with phone OTP for saved receipts, history, and spending
summaries.

## Local Setup From Repo Root

Run infrastructure and the backend first:

```bash
corepack enable
corepack prepare pnpm@10.33.0 --activate
pnpm install
docker compose up -d postgres redis kafka meilisearch
docker compose run --rm prisma-init
pnpm --filter order-service run prisma:generate
pnpm --filter order-service run dev
```

Then start the customer app in another terminal:

```bash
pnpm --filter customer-web run dev
```

The app runs at:

```text
http://localhost:9601
```

The backend GraphQL endpoint is:

```text
http://localhost:9602/graphql
```

## Environment

Customer web reads Vite environment values from the repo/app environment.
Use the local order-service URL for development:

```bash
VITE_GRAPHQL_URL=http://localhost:9602/graphql
VITE_GRAPHQL_WS_URL=ws://localhost:9602/graphql
```

The order-service should also know the customer web origin for CORS, cookies,
and passkeys:

```bash
CUSTOMER_WEB_ORIGIN=http://localhost:9601
CUSTOMER_PASSKEY_RP_ID=localhost
```

## Customer Account Flow

- QR ordering stays guest-first.
- Phone OTP sign-in is optional and does not block ordering.
- Passkey setup is optional after phone verification.
- Ending a table session clears visit/cart/table data, but does not log out the
  customer account.
- The Orders tab shows remembered device orders for guests and account history
  for signed-in customers.

When a customer taps `Get code`, the SMS is sent immediately. After a successful
send, the button changes to `Retry in 2:00` to avoid repeated OTP requests while
the SMS is arriving.

## Common Commands

```bash
pnpm --filter customer-web run dev
pnpm --filter customer-web run build
pnpm --filter customer-web run lint
pnpm --filter customer-web run type-check
pnpm --filter customer-web run test
pnpm --filter customer-web run preview
```

## Troubleshooting

If the app reports GraphQL schema errors, restart `order-service` so the
code-first GraphQL schema reflects the latest backend types.

If OTP SMS does not arrive, check `apps/order-service/.env` and confirm
`SMS_PROVIDER` and the selected provider credentials are set. For local testing
without real SMS, use:

```bash
SMS_PROVIDER=noop
CUSTOMER_OTP_EXPOSE_CODE=true
```

If passkey registration fails locally, make sure the app is running on
`localhost` and `CUSTOMER_PASSKEY_RP_ID=localhost` in the backend environment.
