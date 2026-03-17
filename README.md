
---


> 🚧 This project is under active development. APIs and structure may evolve.

---

# 🌱 Garden Task Planner API

A multi-user garden task planner that turns structured garden data into **clear, daily actionable work**.

Instead of managing static to-do lists, this system models how gardening actually works:

* Tasks belong to **beds**
* Beds belong to a **garden**
* Work is done **sequentially, in space, over time**

---

# 🚀 Core Idea

> “What should I do today, and where do I start?”

This API answers that by:

* Tracking tasks against garden beds
* Identifying what’s due today
* Guiding users through their garden in a logical walk order

---

# 🧱 Domain Model

```
Garden
  └── Beds (ordered)
        └── Tasks (scheduled)
```

### Key Concepts

* **Garden**: A user-owned space (e.g. property, backyard)
* **Bed**: A physical area within a garden (ordered by position)
* **Task**: A unit of work with a due date

---

# 🛠️ Tech Stack

* **Framework**: NestJS
* **ORM**: Prisma
* **Database**: PostgreSQL
* **Auth**: Auth0 (planned / in progress)

---

# 📡 Key Endpoints

## Gardens

```
POST   /gardens
GET    /gardens
```

## Beds

```
POST   /beds
GET    /gardens/:gardenId/beds
```

## Tasks

```
POST   /tasks
GET    /beds/:bedId/tasks
```

## 🌟 Product Endpoints

### 📅 Due Today

```
GET /gardens/:gardenId/tasks/due-today
```

Returns all tasks due today, ordered by:

1. Bed position
2. Due time

---

### 🚶 Walk the Garden

```
GET /gardens/:gardenId/walk
```

Returns tasks grouped by bed, in walking order.

This enables a natural workflow:

* Start at Bed 1
* Complete tasks
* Move to next bed

---

# 🔄 Example Workflow

```
1. Create a garden
2. Add beds (in physical order)
3. Add tasks to beds
4. Query tasks due today
5. Walk the garden and complete tasks
```

---

# 🔐 Ownership Model

All queries enforce ownership at the database level:

* Gardens belong to a user
* Beds belong to a garden
* Tasks belong to a bed

This ensures:

* No cross-user data access
* Clean, single-query enforcement via Prisma

---

# 🧠 Design Philosophy

This project intentionally avoids over-engineering.

Focus areas:

* Simple, composable data model
* Real-world alignment (gardens are spatial)
* Incremental feature layering
* Backend-first product thinking

---

# 🗺️ Roadmap

### Near Term

* Swagger / OpenAPI integration
* DTO validation improvements
* Optional query filters (e.g. per bed)

### Mid Term

* Recurring task engine (watering, fertilising, etc.)
* Task completion tracking
* Basic frontend / mobile client

### Long Term

* Multi-user gardens
* Shared templates
* Subscription-based SaaS model

---

# ⚙️ Running Locally

```bash
# Install deps
npm install

# Run database
npx prisma migrate dev

# Start server
npm run start:dev
```

---

# 🧪 Example Use Case

A user with:

* 5 garden beds
* 20+ recurring tasks

Each morning:

* Calls `/tasks/due-today`
* Then `/walk`
* Completes tasks in order

No thinking. Just doing.

---

# 💡 Why This Project Exists

To explore:

* Real-world domain modelling
* Clean backend architecture
* Building toward a small, useful SaaS product

---

