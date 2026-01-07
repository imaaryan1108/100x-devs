
# PostgreSQL + Prisma in Node.js (Detailed Notes)

## 1. Introduction
Prisma is a modern ORM (Object Relational Mapper) for Node.js and TypeScript that provides:
- Type-safe database access
- Declarative schema
- Auto-generated client
- Excellent support for PostgreSQL

PostgreSQL is a powerful open-source relational database known for reliability and advanced features.

---

## 2. Project Setup

### 2.1 Install Dependencies
```bash
npm init -y
npm install prisma @prisma/client
npm install pg
```

### 2.2 Initialize Prisma
```bash
npx prisma init
```

This creates:
```
prisma/
 └── schema.prisma
.env
```

---

## 3. Prisma Schema Basics

### 3.1 Datasource & Generator
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3.2 Environment Variable
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

---

## 4. Models & Fields

### 4.1 Basic Model
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}
```

### 4.2 Field Attributes
- `@id` – Primary key
- `@default()` – Default value
- `@unique` – Unique constraint
- `?` – Nullable field

---

## 5. Prisma Migrations

### 5.1 Create Migration
```bash
npx prisma migrate dev --name init
```

### 5.2 Apply Existing Migrations
```bash
npx prisma migrate deploy
```

---

## 6. Prisma Client Usage

### 6.1 Initialize Client
```js
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```

### 6.2 Create Record
```js
const user = await prisma.user.create({
  data: {
    email: "test@example.com",
    name: "Test User"
  }
})
```

### 6.3 Read Records
```js
const users = await prisma.user.findMany()
```

### 6.4 Update Record
```js
await prisma.user.update({
  where: { id: 1 },
  data: { name: "Updated Name" }
})
```

### 6.5 Delete Record
```js
await prisma.user.delete({
  where: { id: 1 }
})
```

---

## 7. Relationships

### 7.1 One-to-One
```prisma
model User {
  id      Int     @id @default(autoincrement())
  profile Profile?
}

model Profile {
  id     Int  @id @default(autoincrement())
  userId Int  @unique
  user   User @relation(fields: [userId], references: [id])
}
```

### 7.2 One-to-Many
```prisma
model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}

model Post {
  id     Int  @id @default(autoincrement())
  title  String
  userId Int
  user   User @relation(fields: [userId], references: [id])
}
```

### 7.3 Many-to-Many
```prisma
model Student {
  id      Int      @id @default(autoincrement())
  courses Course[]
}

model Course {
  id       Int       @id @default(autoincrement())
  students Student[]
}
```

---

## 8. Nested Writes

```js
await prisma.user.create({
  data: {
    email: "nested@test.com",
    posts: {
      create: [
        { title: "Post 1" },
        { title: "Post 2" }
      ]
    }
  }
})
```

---

## 9. Queries & Filtering

### 9.1 Where Conditions
```js
await prisma.user.findMany({
  where: {
    email: { contains: "@gmail.com" },
    isActive: true
  }
})
```

### 9.2 Select & Include
```js
await prisma.user.findMany({
  select: {
    id: true,
    email: true
  }
})
```

```js
await prisma.user.findMany({
  include: {
    posts: true
  }
})
```

---

## 10. Pagination

```js
await prisma.post.findMany({
  skip: 10,
  take: 5
})
```

---

## 11. Transactions

```js
await prisma.$transaction([
  prisma.user.create({ data: { email: "a@test.com" }}),
  prisma.user.create({ data: { email: "b@test.com" }})
])
```

---

## 12. Indexes & Constraints

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  @@index([email])
}
```

---

## 13. Soft Deletes

```prisma
model User {
  id        Int      @id @default(autoincrement())
  deletedAt DateTime?
}
```

```js
await prisma.user.update({
  where: { id: 1 },
  data: { deletedAt: new Date() }
})
```

---

## 14. Prisma Studio

```bash
npx prisma studio
```

---

## 15. Best Practices
- Always use `select` in production APIs
- Handle `$disconnect()` on shutdown
- Use transactions for multi-step logic
- Keep Prisma schema as source of truth

---

## 16. Folder Structure (Recommended)
```
src/
 ├── prisma/
 │    └── client.ts
 ├── modules/
 ├── services/
 └── index.ts
```

---

## 17. Common Errors
- Migration drift → `prisma migrate reset`
- Connection issues → check DATABASE_URL
- Enum mismatch → regenerate client

---

## 18. Conclusion
Prisma with PostgreSQL provides a robust, type-safe, and scalable data layer for Node.js applications.
