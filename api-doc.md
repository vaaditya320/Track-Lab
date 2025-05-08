# TrackLab API Documentation

## Authentication
All API routes require authentication using NextAuth.js. Include the session token in your requests.

## User Management

### Get Current User Profile
```http
GET /api/users/me
```
Returns the current user's profile information.

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "regId": "string",
  "email": "string",
  "branch": "string",
  "section": "string",
  "batch": "string",
  "role": "string"
}
```

### Update User Profile
```http
PUT /api/users/me
```
Update the current user's profile information.

**Request Body:**
```json
{
  "branch": "string",
  "section": "string",
  "batch": "string"
}
```

**Response:** Updated user object

### Get Users by Role
```http
GET /api/users?role=TEACHER
```
Get all users with a specific role. Roles can be: STUDENT, TEACHER, ADMIN.

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "email": "string",
    "regId": "string",
    "role": "string"
  }
]
```

## Project Management

### Create Project
```http
POST /api/projects/create
```
Create a new project.

**Request Body:**
```json
{
  "title": "string",
  "teamMembers": ["string"],
  "components": "string",
  "assignedTeacherId": "string"
}
```

**Response:**
```json
{
  "message": "Project created",
  "project": {
    "id": "string",
    "title": "string",
    "teamMembers": "string",
    "components": "string",
    "assignedTeacherId": "string",
    "leaderId": "string",
    "status": "string"
  }
}
```

### Get User's Projects
```http
GET /api/projects
```
Get all projects where the current user is the leader.

**Response:**
```json
[
  {
    "id": "string",
    "title": "string",
    "teamMembers": "string",
    "components": "string",
    "leader": {
      "name": "string",
      "email": "string",
      "regId": "string"
    }
  }
]
```

### Get Project Details
```http
GET /api/projects/[id]
```
Get details of a specific project.

**Response:**
```json
{
  "id": "string",
  "title": "string",
  "teamMembers": "string",
  "components": "string",
  "leader": {
    "id": "string",
    "name": "string",
    "email": "string",
    "regId": "string"
  },
  "status": "string",
  "summary": "string",
  "projectPhoto": "string"
}
```

### Delete Project
```http
DELETE /api/projects/[id]
```
Delete a project. Only the project leader can delete their project.

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
Mark a project as complete and submit final details.

**Request Body (FormData):**
```
summary: string
photo: File
```

**Response:** Updated project object

### Get Assigned Projects (Teachers Only)
```http
GET /api/projects/assigned
```
Get all projects assigned to the current teacher.

**Response:**
```json
[
  {
    "id": "string",
    "title": "string",
    "teamMembers": ["string"],
    "components": "string",
    "leader": {
      "id": "string",
      "name": "string",
      "email": "string",
      "regId": "string"
    }
  }
]
```

### Download Project Report
```http
GET /api/projects/[id]/download
```
Generate and email a PDF report of the project.

**Response:**
```json
{
  "message": "PDF sent to your email"
}
```

## Admin Routes

### Get All Users (Admin Only)
```http
GET /api/admin/users
```
Get all users in the system. Requires admin privileges.

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "email": "string",
    "regId": "string",
    "role": "string",
    "branch": "string",
    "section": "string",
    "batch": "string"
  }
]
```

### Update User Role (Admin Only)
```http
PUT /api/admin/users
```
Update a user's role. Requires admin privileges.

**Request Body:**
```json
{
  "userId": "string",
  "role": "STUDENT|TEACHER|ADMIN"
}
```

**Response:** Updated user object

### Delete User (Admin Only)
```http
DELETE /api/admin/users
```
Delete a user. Requires admin privileges.

**Request Body:**
```json
{
  "id": "string"
}
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

### Get User Details (Admin Only)
```http
GET /api/admin/users/[id]
```
Get detailed information about a specific user. Requires admin privileges.

**Response:** Complete user object

### Get All Projects (Admin Only)
```http
GET /api/admin/projects
```
Get all projects in the system. Requires admin privileges.

**Response:**
```json
[
  {
    "id": "string",
    "title": "string",
    "teamMembers": "string",
    "components": "string",
    "leader": {
      "name": "string",
      "batch": "string"
    },
    "leaderName": "string",
    "leaderBatch": "string"
  }
]
```

### Create Project (Admin Only)
```http
POST /api/admin/projects
```
Create a new project as an admin.

**Request Body:**
```json
{
  "title": "string",
  "teamMembers": ["string"],
  "components": "string",
  "summary": "string",
  "projectPhoto": "string",
  "leaderId": "string"
}
```

**Response:** Created project object

## Error Responses
All API routes may return the following error responses:

```json
{
  "error": "Unauthorized"
}
```
Status: 401 - When authentication is required but not provided

```json
{
  "error": "Forbidden"
}
```
Status: 403 - When the user doesn't have required permissions

```json
{
  "error": "Not Found"
}
```
Status: 404 - When the requested resource doesn't exist

```json
{
  "error": "Internal server error"
}
```
Status: 500 - When an unexpected error occurs