# TrackLab API Documentation

## Authentication

Most API routes use **NextAuth.js** session cookies (browser) or equivalent session handling. Some admin UI calls also send `Authorization: Bearer <userId>`; the server still validates the session via `getServerSession`.

Unauthenticated requests typically receive **401**. Missing permissions receive **403** or **401** depending on the route.

---

## User Management

### Get Current User Profile

```http
GET /api/users/me
```

Returns the signed-in user’s profile.

**Response (selected fields):**

```json
{
  "id": "string",
  "name": "string",
  "regId": "string",
  "email": "string",
  "phoneNumber": "string | null",
  "branch": "string | null",
  "section": "string | null",
  "batch": "string | null",
  "role": "string"
}
```

### Update User Profile

```http
PUT /api/users/me
```

**Request body (JSON):**

```json
{
  "branch": "string | null",
  "section": "string | null",
  "batch": "string | null",
  "phoneNumber": "string | null"
}
```

**Response:** Updated user object.

### List Users by Role (for pickers / assignments)

```http
GET /api/users?role=TEACHER
```

**Query parameters**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `role` | Yes | `TEACHER` or `admin` (lowercase) |

- `role=TEACHER` — users with role `TEACHER`.
- `role=admin` — users with role `ADMIN` or `SUPER_ADMIN`.

**Response:** JSON array of users (includes `id`, `name`, `email`, `regId`, `role`, `phoneNumber` where applicable).

**Errors:** `400` if `role` is missing or not allowed.

### Search Students (team member picker)

```http
GET /api/users/search?q=ab&limit=20
```

Used to find **students** by name or registration ID when adding team members (minimum query length avoids heavy queries).

**Query parameters**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `q` | Yes | Search string; **must be at least 2 characters** after trim. |
| `limit` | No | Max results, default `20`, clamped between **1** and **50**. |

Excludes the current user from results. Only users with `role: STUDENT` are returned.

**Response:** JSON array:

```json
[
  {
    "id": "string",
    "name": "string",
    "regId": "string"
  }
]
```

**Errors:** `400` if `q` is shorter than 2 characters; `401` if not signed in.

---

## Project Management

### List Projects for the Current User

```http
GET /api/projects
```

Returns projects where the current user is either:

- The **project leader**, or  
- A **registered team member** (`ProjectMember` row for that user).

This is what powers the dashboard so **team members can see projects their leader created** (once they are linked as members).

**Response:** JSON array of projects, each including a `leader` object (`name`, `email`, `regId`).

### Create Project (primary flow)

```http
POST /api/projects/create
```

Creates a project with optional **team member user IDs** (students). Team membership is stored in `ProjectMember` so members appear in `GET /api/projects`.

**Request body (JSON):**

```json
{
  "title": "string",
  "components": "string",
  "assignedTeacherId": "string | null",
  "teamMemberIds": ["user-uuid", "..."]
}
```

- `teamMemberIds` — array of **other** users’ IDs (students); must not include the leader’s own ID; duplicates rejected; all IDs must exist and be `STUDENT` role.
- `components` — required (can be empty string after trim checks in app logic).

**Response:** `201`

```json
{
  "message": "Project created",
  "project": { }
}
```

### Create Project (alternate handler on collection route)

```http
POST /api/projects
```

Alternate creation path (different body shape and team membership handling than `/api/projects/create`). Prefer **`POST /api/projects/create`** for new integrations. See `app/api/projects/route.js` for the exact JSON fields and behavior.

### Get Project Details

```http
GET /api/projects/[id]
```

**Access:** Allowed if the user is the **leader**, an **assigned teacher** (`assignedTeacherId`), or a **team member** (via `ProjectMember`).

**Response:** Project object (includes `leader`, `members` as stored in DB) plus:

| Field | Description |
|-------|-------------|
| `viewerRole` | `"leader"` \| `"member"` \| `"teacher"` — how the current user relates to this project |

**Errors:** `401`, `403` (no access), `404`.

### Update Project

```http
PUT /api/projects/[id]
```

**Access:** **Project leader only.**  
**Condition:** Project `status` must be `PARTIAL` (draft edits).

**Request body (JSON):** optional `title`, `components`, `teamMembers` (string or serializable as used by the route).

### Delete Project

```http
DELETE /api/projects/[id]
```

**Access:** **Project leader only.**

**Response:**

```json
{
  "message": "Project deleted successfully"
}
```

### Complete Project

```http
POST /api/projects/[id]/complete
```

Submit/finalize project (e.g. summary and photo). See route implementation for exact **FormData** fields and validation.

### Get Assigned Projects (teachers)

```http
GET /api/projects/assigned
```

Returns projects where the current user is the **assigned teacher** (`assignedTeacherId`).

### Download Project Report

```http
GET /api/projects/[id]/download
```

Generates/sends project report (PDF flow). See route for behavior and required role/access.

---

## Admin Routes

Admin endpoints use `getServerSession` and role checks (`isAdmin` / `isSuperAdmin` as implemented per route).

### List Projects (admin)

```http
GET /api/admin/projects?take=20&skip=0&search=&leader=&status=&batch=
```

**Access:** Admin (not necessarily super admin — see `isAdmin` in code).

**Pagination**

| Parameter | Default | Description |
|-----------|---------|-------------|
| `take` | `20` | Page size (max `100`). |
| `skip` | `0` | Offset for next page. |

**Response:**

```json
{
  "items": [ ],
  "hasMore": true
}
```

Each item includes project fields plus `leaderName` and `leaderBatch` from the leader user.

**Filters (server-side)**

| Parameter | Description |
|-----------|-------------|
| `search` | Case-insensitive substring on **project title** or **leader name**. |
| `leader` | Case-insensitive substring on **leader name** (can combine with `batch`). |
| `status` | `PARTIAL` or `SUBMITTED`. |
| `batch` | Leader’s batch enum value (e.g. `A1`). |

Ordering: newest-first by project `id` descending.

### Create / Update / Delete Project (admin)

See `app/api/admin/projects/route.js` — `POST`, `PUT`, `DELETE` require admin privileges; shapes match server validation.

### List Users (super admin)

```http
GET /api/admin/users?take=20&skip=0&search=&email=&role=
```

**Access:** **Super admin only** (`isSuperAdmin`).

**Pagination:** Same `take` / `skip` pattern as admin projects; **max `take` = 100**.

**Response:**

```json
{
  "items": [ ],
  "hasMore": true
}
```

**Filters**

| Parameter | Description |
|-----------|-------------|
| `search` | Trimmed; applied only when **length ≥ 2**. Case-insensitive match on **name** or **regId**. |
| `email` | Applied only when **length ≥ 2**. Case-insensitive substring on **email**. |
| `role` | Exact role filter: `STUDENT`, `TEACHER`, `SUPER_ADMIN`, or `ADMIN`. |

**Note:** When `role=ADMIN`, the API returns users whose role is **`ADMIN` or `SUPER_ADMIN`** (both administrator tiers).

First-page fetch (`skip=0`) may be logged for auditing.

### Update User Role (super admin)

```http
PUT /api/admin/users
```

**Request body:**

```json
{
  "userId": "string",
  "role": "STUDENT | TEACHER | ADMIN | SUPER_ADMIN"
}
```

**Response:** Updated user object (selected fields).

### Delete User (super admin)

```http
DELETE /api/admin/users
```

**Request body:**

```json
{
  "id": "string"
}
```

### Get User by ID (admin)

```http
GET /api/admin/users/[id]
```

Returns detailed user information for admin tools (see route for exact shape).

---

## Error Responses

Common patterns:

| Status | Meaning |
|--------|---------|
| `400` | Bad request (validation, missing parameters). |
| `401` | Not authenticated or not allowed to use the endpoint. |
| `403` | Forbidden (authenticated but insufficient access). |
| `404` | Resource not found. |
| `500` | Server error |

Example bodies:

```json
{ "error": "Unauthorized" }
```

```json
{ "error": "Forbidden" }
```

```json
{ "error": "Not Found" }
```

```json
{ "error": "Internal server error" }
```

Exact `error` strings vary by route; clients should treat by HTTP status first.
