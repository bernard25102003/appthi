# FastFood Backend

Node.js backend for FastFood Ordering Platform.

## Stack

- **Runtime**: Node.js 20+, TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Auth**: JWT (access token) + Refresh Token (httpOnly cookie)
- **Image Storage**: ImageKit
- **Email**: Brevo (SMTP)
- **Deploy**: Render

## Setup

```bash
# 1. Cài dependencies
pnpm install

# 2. Tạo file .env từ example
cp .env.example .env
# → Điền đầy đủ các biến môi trường

# 3. Generate Prisma Client
pnpm db:generate

# 4. Chạy migrations
pnpm db:migrate:dev

# 5. Seed dữ liệu mẫu
pnpm db:seed

# 6. Start dev server
pnpm dev
```

## Deploy lên Render

1. Connect GitHub repo vào Render
2. Build command: `pnpm install && pnpm build && pnpm db:generate && pnpm db:migrate`
3. Start command: `node dist/index.js`
4. Environment variables: copy từ `.env.example` và điền giá trị thực
