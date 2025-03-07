# TrackLab API Documentation

This document provides an overview of the available API routes in TrackLab, including their request methods, authentication requirements, and responses.

---

## **Authentication & Access Tokens**

**How to Authenticate Requests**

Most API endpoints require authentication. You must include the `Authorization` header in your requests:

```
Authorization: Bearer <access_token>
```

To get the `access_token`, make a request to `/api/auth/session`.

### `POST /api/auth/[...nextauth]`
Handles OAuth2 authentication using Google.
- **Request:**  
  - No request body required, handled via OAuth2 flow.
- **Response:**  
  - Redirects user to Google authentication and returns a session token.
- **Example:**  
  ```json
  {
    "user": {
      "name": "Real User",
      "email": "admin-user@poornima.org",
      "id": "216a7d93-5b5b-416d-83b7-ff987341aab7",
      "role": "ADMIN"
    },
    "expires": "2025-03-08T08:26:22.314Z"
  }
  ```

## **Admin Routes**

These routes require admin privileges.

### `GET /api/admin/users`
Fetch all registered users.
- **Authentication:** Admin only.
- **Response:**
  ```json
  [
    {
      "id": "0e77ad27-cad7-4d10-8112-476f299295c5",
      "name": "Palak Agarwal",
      "regId": "2024pietadpalak039",
      "email": "2024pietadpalak039@poornima.org",
      "role": "STUDENT"
    },
    {
      "id": "0dddf7a7-99b5-4cbb-a8b1-7dabaffc7cb7",
      "name": "SARTHAK CHOPRA PIET23CS148",
      "regId": "2023pietcssarthak148",
      "email": "2023pietcssarthak148@poornima.org",
      "role": "STUDENT"
    }
  ]
  ```

### `GET /api/admin/users/[id]`
Fetch details of a specific user.
- **Authentication:** Admin only.
- **Parameters:**
  - `id` (string) → User ID
- **Response:**
  ```json
  {
    "id": "0dddf7a7-99b5-4cbb-a8b1-7dabaffc7cb7",
    "name": "SARTHAK CHOPRA PIET23CS148",
    "regId": "2023pietcssarthak148",
    "email": "2023pietcssarthak148@poornima.org",
    "role": "STUDENT"
  }
  ```

### `GET /api/admin/projects`
Fetch all projects.
- **Authentication:** Admin only.
- **Response:**
  ```json
  [
    {
      "id": "7d5ca63f-06a8-452c-b318-b45c9e825a5b",
      "title": "AI Model",
      "leaderId": "216a7d93-5b5b-416c-83b7-ff987341aab7"
    }
  ]
  ```

### `GET /api/admin/projects/[id]`
Fetch a specific project's details.
- **Authentication:** Admin only.
- **Parameters:**
  - `id` (string) → Project ID
- **Response:**
  ```json
  {
    "id": "7d5ca63f-06a8-452c-b318-b45c9e825a5b",
    "title": "AI Model",
    "leader": {
      "id": "216a7d93-5b5b-416c-83b7-ff987341aab7",
      "name": "AADITYA VINAYAK"
    }
  }
  ```

## **Project Routes**

These routes handle project management.

### `POST /api/projects/create`
Create a new project.
- **Authentication:** Required.
- **Request Body:**
  ```json
  {
    "title": "AI Model",
    "description": "A machine learning project",
    "leaderId": "216a7d93-5b5b-416c-83b7-ff987341aab7"
  }
  ```
- **Response:**
  ```json
  {
    "id": "7d5ca63f-06a8-452c-b318-b45c9e825a5b",
    "title": "AI Model",
    "description": "A machine learning project",
    "leaderId": "216a7d93-5b5b-416c-83b7-ff987341aab7"
  }
  ```

### `GET /api/projects/[id]`
Fetch a specific project's details.
- **Authentication:** Required.
- **Parameters:**
  - `id` (string) → Project ID
- **Response:**
  ```json
  {
    "id": "7d5ca63f-06a8-452c-b318-b45c9e825a5b",
    "title": "AI Model",
    "leaderId": "216a7d93-5b5b-416c-83b7-ff987341aab7"
  }
  ```

### `DELETE /api/projects/[id]`
Delete a project if the user is the leader.
- **Authentication:** Required.
- **Parameters:**
  - `id` (string) → Project ID
- **Response:**
  - 200 OK:
    ```json
    { 
      "message": "Project deleted successfully" 
    }
    ```
  - 403 Forbidden:
    ```json
    { 
      "error": "Forbidden" 
    }
    ```

### `POST /api/projects/[id]/complete`
Mark a project as complete and upload a project photo.
- **Authentication:** Required.
- **Parameters:**
  - `id` (string) → Project ID
- **Request Body:**
  ```json
  {
    "summary": "Final version of AI Model",
    "photo": "base64-encoded-image"
  }
  ```
- **Response:**
  ```json
  { 
    "message": "Project marked as complete" 
  }
  ```

### `GET /api/projects/[id]/download`
Download a project report as a PDF.
- **Authentication:** Required.
- **Parameters:**
  - `id` (string) → Project ID
- **Response:**
  - A downloadable PDF file.