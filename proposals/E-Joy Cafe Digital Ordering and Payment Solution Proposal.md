# E-Joy Cafe Digital Ordering and Payment Solution Proposal

**Proposal to:** Restaurant and cafe owners  
**Submitted by:** Inspur-Afrolink E-Joy Joint Venture  
**JV parties:** Inspur Software Technology Co., Ltd. and Afrolink Systems PLC  
**Date:** [Insert Date]  
**Document status:** Business proposal draft for stakeholder review  
**Confidentiality:** This proposal is submitted for authorized stakeholder review. Commercial, technical, and operational details should not be distributed outside the evaluation process without written consent.

---

## Table of Contents
1. Executive Summary
2. Proposed Solution
3. Background and Current Situation
4. Project Rationale
5. Proposed E-Joy Platform
6. Integrated Solution Modules
7. Business Workflows
8. Technical Architecture
9. Implementation Plan
10. Governance, Roles, and Responsibilities
11. Commercial and Service Model
12. Assumptions
13. Risk Management and Mitigation
14. Monitoring, Reporting, and Performance Indicators
15. Benefits
16. Future Modules Roadmap
17. Conclusion and Partnership Request
18. Appendix A: Proposed Pilot Deliverables
19. Appendix B: Open Items for Further Discussion

## Executive Summary

Inspur-Afrolink E-Joy Joint Venture respectfully proposes E-Joy, a cafe and restaurant digital ordering solution designed to help owners give each venue its own customer web app for easy table ordering and payment, supported by an admin app for menu, order, receipt, and reporting operations.

The solution focuses on the dine-in customer journey. A customer sits at a table, scans the cafe's QR code or opens that cafe's web app, browses the digital menu, places an order, pays through the enabled payment flow, and the food or drink is prepared and brought to the table. The owner and staff manage the same flow through the admin app, where they control products, tables, orders, receipts, reports, shop settings, and operational visibility.

**Recommended approach:** Begin with a controlled pilot in one cafe or restaurant branch, validate QR ordering, payment, kitchen handoff, table service, admin operations, and reporting, then roll out to additional branches after the owner approves the operating model.

## Proposed Solution

E-Joy is proposed as one solution: a customer web app for the cafe and an admin app for the owner and staff. The scope can be implemented in phases, but the proposal is for a single connected service that improves how customers order and how cafe teams manage orders.

|Proposed solution|Included capabilities|Recommended use|
|---|---|---|
|E-Joy Customer App + Admin App|Cafe-specific customer web app, QR table ordering, digital menu, cart and checkout, Telebirr-ready payment flow, guest or OTP customer account flow, order history, admin dashboard, product and menu management, dining table management, order monitoring, receipt records, reports, kitchen handoff, staff access, and shop settings.|Restaurant and cafe owners who want customers to order and pay easily from the table while staff prepare and serve the order.|

The pilot should confirm the complete dine-in flow in a practical cafe environment: menu setup, QR code placement, customer ordering, payment confirmation, kitchen or counter handoff, food and drinks served to the table, admin order management, receipts, and daily reporting.

## Background and Current Situation

Many cafes and restaurants still depend on printed menus, manual order taking, cash-heavy settlement, and verbal handoff between floor staff, cashier, and kitchen. During busy hours, customers wait to order, staff re-enter information, and owners have limited visibility into what was ordered, paid, prepared, or served.

Third-party ordering or promotion platforms do not solve the dine-in experience inside the cafe. They may bring online exposure, but the cafe still needs its own customer-facing ordering channel and its own operating dashboard for table orders, menu changes, receipts, and daily reporting.

E-Joy responds to this gap by giving each cafe a branded customer web app and giving the owner an admin app that makes dine-in ordering, payment, kitchen handoff, and reporting visible in one connected workflow.

## Project Rationale

The solution should be treated as a service improvement and operations improvement program for restaurant and cafe owners. It must solve five practical issues at the same time:

- Customer convenience: customers scan, browse, order, and pay from their table without waiting for a waiter to take the order.
- Table service accuracy: menu, cart, table number, order, payment, kitchen handoff, and serving status stay connected.
- Owner visibility: owners and managers can see orders, products, receipts, reports, tables, and shop settings from the admin app.
- Operational speed: staff spend less time taking orders manually and more time preparing, serving, and helping customers.
- Customer retention: customer accounts, order history, customer records, and reporting support repeat visits and targeted offers.

## Proposed E-Joy Platform

E-Joy is a customer-app and admin-app solution built around a production-oriented technology stack: NestJS, GraphQL, Prisma, PostgreSQL, Redis, Kafka, Meilisearch, React, Vite, Tailwind CSS, Apollo Client, GraphQL subscriptions, and Docker-based local infrastructure.

|Layer|Main components|Business purpose|
|---|---|---|
|Customer app|Cafe-specific customer web app, QR menu, categories, products, cart, checkout, table context, order history, OTP account flow.|Make ordering and payment easier for customers sitting in the cafe.|
|Admin app|Admin web, product and menu management, dining tables, staff access, orders, receipts, reports, shop settings.|Give restaurant and cafe owners practical daily control.|
|Kitchen and service workflow|Order status, kitchen or counter handoff, receipt records, reprint support, table fulfillment visibility.|Help staff prepare the order and bring food or drinks to the right table.|
|Core backend|Order service, GraphQL APIs, Prisma schema, payment workflows, uploads, observability checks, seed scripts.|Coordinate the business logic and data model.|
|Infrastructure|PostgreSQL, Redis, Kafka, Meilisearch, Docker Compose, monitoring hooks.|Support scale, reliability, async workflows, and search.|

## Integrated Solution Modules

|Module|Purpose|Expected result|
|---|---|---|
|Cafe customer app|Branded web app for the specific cafe, opened by QR code or link, with menu browsing, item selection, cart, table context, and checkout.|Customers order easily from the table.|
|Payment and receipt flow|Telebirr-ready payment path, receipt records, guest ordering, customer account flow where enabled, and order history.|Cleaner settlement and better payment traceability.|
|Admin app|Products, categories, tables, staff access, orders, receipts, reports, and shop settings.|Owners control daily operations without relying on manual notebooks.|
|Kitchen and service handoff|Order status, kitchen ticket or counter workflow, reprint support, and table fulfillment visibility.|Staff know what to prepare and where to serve it.|
|Customer records and reporting|Customer list, masked phone, order history, daily sales, product performance, and basic customer insights.|Owners understand demand and support repeat visits.|

## Business Workflows

### Customer app table-ordering workflow

1. Customer sits at a table and scans that cafe's QR code or opens the cafe's customer web app.
2. Customer browses menu categories, selects items, and reviews the cart.
3. The order keeps the table context so staff know where the food or drinks should be served.
4. Customer confirms the order and pays through the enabled payment flow.
5. The admin app receives the order for preparation and service handoff.
6. Staff prepare the order and bring it to the customer's table.
7. Receipt and order history are stored for the cafe and for the customer where account flow is enabled.

### Admin app workflow for owners and staff

1. Owner or manager configures the cafe profile, menu categories, products, prices, table QR codes, staff access, and payment settings.
2. Incoming orders appear in the admin app with table, item, payment, and status details.
3. Kitchen or counter staff prepare the order using the order view or printed ticket where printers are enabled.
4. Staff update the order status as it moves from received to preparing to served or completed.
5. Owners review receipts, daily sales, product performance, customer activity, and operating reports.

## Technical Architecture

The architecture is modular and designed for incremental deployment. The current repository is a pnpm monorepo with dedicated customer, merchant, public, platform, and backend applications.

|System area|Implementation approach|
|---|---|
|Frontend applications|React, TypeScript, Vite, Tailwind CSS, Apollo Client, and GraphQL subscriptions for responsive customer and admin experiences.|
|Backend application|NestJS order service with GraphQL APIs, Prisma ORM, payment, uploads, order lifecycle, observability checks, and seed data.|
|Data layer|PostgreSQL as the core relational database, with Redis for fast state and Kafka for asynchronous event workflows.|
|Search and discovery|Meilisearch for fast menu, product, or operational search where enabled.|
|Reliability controls|Idempotency for write operations, pagination on list APIs, audit fields, structured logs, performance targets, and monitoring baseline.|
|Security controls|JWT authentication, role-based access, shop ownership checks, masked customer phone display, bcrypt password hashing, SQL injection protection through Prisma, and rate limits.|

**Production readiness direction:** The V2.2 design targets API P95 response time under 500ms, order creation success of at least 99.5%, print success of at least 99.5% when printers are online, and system availability target of at least 99.95% after the required infrastructure and operations model are approved.

## Implementation Plan

The recommended implementation plan uses a pilot-first approach for one cafe or restaurant branch. Exact timing should be confirmed after menu readiness, payment-provider readiness, QR/table setup, printer needs, and production hosting decisions.

|Phase|Indicative duration|Main activities|Outputs|
|---|---|---|---|
|1. Discovery and stakeholder alignment|1-2 weeks|Confirm target cafe, table-ordering flow, payment approach, pilot users, reporting needs, and success criteria.|Approved pilot scope and requirements notes.|
|2. Environment and data readiness|1-2 weeks|Confirm hosting, domains, environment variables, database, SMS provider, payment credentials, and seed/master data.|Ready pilot environment and configured demo data.|
|3. Configuration and integration|2-4 weeks|Configure cafe profile, menus, tables, QR codes, staff, customer OTP, payment, print routing, and admin dashboards.|Pilot-ready customer app and admin app.|
|4. Training and SOP preparation|1 week|Train owners, managers, cashiers, waiters, and kitchen or counter users.|Training pack and operating procedure guide.|
|5. Pilot launch|4-8 weeks|Run live orders, monitor adoption, resolve issues, collect feedback, and track KPIs.|Pilot operations report.|
|6. Evaluation and scale-up|1-2 weeks|Review QR ordering success, payment reliability, kitchen handoff, table service, customer feedback, reporting value, and commercial model.|Scale-up recommendation and commercial scope.|

## Governance, Roles, and Responsibilities

|Stakeholder|Main responsibilities|
|---|---|
|Client executive sponsor|Approves pilot scope, budget, success criteria, rollout decision, and business ownership.|
|Restaurant or cafe owner|Provides menu, pricing, staff roles, table setup, service rules, payment decisions, and SOP approval.|
|Inspur-Afrolink E-Joy Joint Venture|Provides solution design, technology implementation, configuration, implementation support, training, rollout support, reporting, and technical issue resolution.|
|Inspur Software Technology Co., Ltd.|Provides technology capability, software implementation experience, architecture support, and enterprise implementation support as agreed in the JV structure.|
|Afrolink Systems PLC|Provides local implementation, stakeholder coordination, field support, training, operations support, and local service continuity.|
|Payment provider stakeholders|Support merchant onboarding, payment credentials, transaction status, settlement, and compliance requirements.|
|Cafe operations team|Uses the customer-app and admin-app workflow daily, reports process gaps, and helps customers adopt QR ordering.|
|IT and infrastructure team|Supports network, devices, printers, hosting, access control, backups, monitoring, and production readiness.|

## Commercial and Service Model

Commercial pricing should be finalized after discovery because cost depends on number of cafes or branches, table count, menu size, users, payment integration, printer hardware, hosting model, support level, and custom features.

|Category|Proposed approach|
|---|---|
|Software solution|Cafe customer web app, admin app, backend services, menu/order/payment/receipt/reporting modules, configuration, and support tools.|
|Professional services|Discovery, configuration, integration, testing, training, launch support, documentation, and project management.|
|Hardware and devices|Table QR materials, kitchen printers where required, tablets or POS devices where required, and network accessories if needed.|
|Hosting and infrastructure|Cloud or approved private hosting, database, storage, monitoring, backups, and security controls.|
|Support and maintenance|Helpdesk, issue resolution, minor updates, monitoring, payment/print support, and periodic reporting.|
|Commercial pricing|To be confirmed after pilot scope, branch count, table count, device count, implementation depth, and service-level expectations are agreed.|

## Assumptions

- The client will provide current menu data, item photos where available, prices, cafe or branch details, staff list, table layout, tax/service charge rules, and operating hours.
- Payment integration will depend on approved provider credentials, settlement account setup, and provider-side readiness.
- Kitchen handoff and printer behavior will depend on selected hardware, network stability, kitchen or counter layout, and supported print protocol.
- Pilot scope, production hosting, commercial terms, and support SLAs will be finalized before go-live.
- Any regulatory, tax, fiscal receipt, or e-invoicing requirements must be confirmed with the relevant authority before production rollout.

## Risk Management and Mitigation

|Risk|Potential impact|Mitigation approach|
|---|---|---|
|Incomplete menu or product data|Incorrect orders, wrong prices, and launch delays.|Run menu data cleanup and manager sign-off before launch.|
|Payment integration delay|Digital payment may not be ready for pilot.|Use approved interim payment flow and keep reconciliation visible.|
|Printer or network instability|Kitchen tickets may fail or arrive late.|Test printers before launch, support reprint, monitor print logs, and define manual fallback.|
|Staff adoption resistance|Manual workarounds and inconsistent order handling.|Train by role, appoint floor champions, simplify SOPs, and monitor usage.|
|Customer confusion|Lower adoption during early rollout.|Use clear table QR signage, staff onboarding, simple customer instructions, and visible support.|
|Cross-shop data access risk|Unauthorized visibility into another cafe's data.|Enforce shop ownership checks, role-based access, audit logs, and testing.|
|Unclear commercial scope|Disagreement on included features or support.|Separate pilot, production rollout, hardware, integrations, and support line items.|

## Monitoring, Reporting, and Performance Indicators

|Indicator category|Sample indicators|
|---|---|
|Customer adoption|QR scans, cart starts, order completion, guest vs account orders, repeat customers.|
|Order operations|Order count, order success rate, cancellation rate, preparation time, completion time, exception rate.|
|Payment|Payment success rate, failed payments, settlement references, refund/manual adjustment count.|
|Kitchen and printing|Print success rate, failed print jobs, reprints, average print delay, printer uptime.|
|Table service|Orders by table, preparation readiness, served/completed status, average service time, and unresolved table orders.|
|Customer and membership|New customers, repeat customers, tagged customers, member tier distribution, coupon usage.|
|Manager reporting|Daily sales, product performance, staff activity, receipts, branch comparison where enabled.|
|Reliability|API latency, uptime, error rate, background job lag, database and queue health.|

## Benefits

### Benefits to restaurant and cafe owners

- A cafe-specific customer app that makes the venue look more modern and easier to order from.
- Better visibility across table orders, payment, receipts, products, staff, customers, and reports.
- Lower manual order taking and fewer communication gaps between customer, service team, and kitchen.
- A stronger customer database for retention, repeat visits, and targeted offers.
- Operational reporting that supports menu decisions, staffing, and branch expansion.

### Benefits to customers

- Faster menu browsing, clearer prices, and easier ordering from the table.
- Payment without waiting for the bill where the cafe enables digital payment.
- Food and drinks served to the correct table because the order carries table context.
- Receipt access and order history where customer accounts are enabled.

### Benefits to staff and kitchen teams

- Clearer order queue and kitchen or counter handoff.
- Fewer repeated manual steps and fewer missed order details.
- Staff performance visibility and clearer handling of table calls and reprints.

## Future Modules Roadmap

|Roadmap module|Purpose|Recommended timing|
|---|---|---|
|Customer reviews and feedback|Capture satisfaction, item feedback, and service quality signals.|After core order flow stabilizes.|
|Chain-store analytics|Compare branches, products, promotions, staffing, and customer cohorts.|During multi-branch rollout.|
|Advanced loyalty automation|Automated customer segments, campaigns, birthday coupons, churn prevention.|After customer data reaches usable volume.|
|Fiscal receipt / e-invoicing|Integrate with approved fiscal or tax reporting systems if required.|Subject to regulation and provider readiness.|
|Multi-branch rollout|Centralized branch setup, branch-level reporting, and owner-level comparison across cafes.|After first cafe pilot is stable.|

## Conclusion and Partnership Request

Inspur-Afrolink E-Joy Joint Venture respectfully submits this proposal for stakeholder review. E-Joy is designed to help restaurant and cafe owners move from manual table ordering toward a connected customer-app and admin-app model that improves customer convenience, kitchen coordination, owner visibility, payment traceability, and long-term customer retention.

We request the opportunity to conduct a focused discovery workshop with the owner, manager, operations, finance, IT, and payment stakeholders to confirm the pilot cafe, table-ordering flow, menu setup, payment path, printer needs, implementation schedule, and commercial framework.

**Proposed next step:** Hold a 1-2 day discovery and pilot scoping workshop, then finalize the customer app, admin app, QR/table setup, configuration requirements, commercial pricing, responsibilities, and launch date.

## Appendix A: Proposed Pilot Deliverables

|Deliverable|Description|
|---|---|
|Pilot implementation plan|Final pilot scope, schedule, users, cafe tables, menus, payment path, devices, risks, and readiness checklist.|
|Configured solution|Cafe customer web app, admin app, backend, shop settings, menus, staff, tables, ordering rules, and dashboards.|
|Payment and receipt setup|Provider configuration, test payments, receipt records, and reconciliation checks.|
|Printing and kitchen workflow|Printer configuration, ticket format, print logs, reprint process, and fallback SOP.|
|Training package|Role-based training materials for owners, managers, service staff, kitchen or counter users, and admin users.|
|Pilot operations report|Order volume, payment performance, kitchen handoff, table service, customer feedback, staff adoption, issues, and lessons learned.|
|Scale-up recommendation|Rollout plan, branch sequence, support model, commercial terms, custom features, and risks.|

## Appendix B: Open Items for Further Discussion

- [Client / restaurant or cafe owner name]
- [Pilot cafe or restaurant branch location]
- [Menus, product photos, categories, prices, tax, and service charge rules]
- [Payment provider credentials and settlement account]
- [Table list, QR placement, kitchen or counter layout, printer model if needed, and network readiness]
- [Commercial pricing, contract term, warranty, support, and SLA]
- [Authorized signatory, office address, email, phone, and company registration details]
