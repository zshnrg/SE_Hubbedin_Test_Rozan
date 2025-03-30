# Birthday Reminder Service

By Rozan Ghosani

The Birthday Reminder Service is a backend application designed to store user data, including their birthdays. It features a worker that sends a "Happy Birthday" message to users at 9 AM in their local time zones on their birthday.

## Table of Contents

- [How to Run](#how-to-run)
  - [Using Docker](#using-docker)
  - [Using Node.js](#using-nodejs)
- [API Endpoints](#api-endpoints)
  - [Retrieve All Users](#1-retrieve-all-users)
  - [Retrieve User by ID](#2-retrieve-user-by-id)
  - [Create a New User](#3-create-a-new-user)
  - [Update an Existing User](#4-update-an-existing-user)
  - [Delete a User](#5-delete-a-user)
- [Assumptions](#assumptions)
- [Limitations](#limitations)
- [Design Decisions](#design-decisions)

## How to Run

### Using Docker
1. Run the application directly using Docker Compose:
    ```bash
    docker-compose up
    ```

### Using Node.js
1. Ensure MongoDB is running and accessible.
2. Add the MongoDB connection URL to the `.env` file using the format provided in `.env.example`.
3. Start the server:
    ```bash
    npm start
    ```
4. Run unit tests:
    ```bash
    npm test
    ```

## API Endpoints


**Response Body Template:**
```ts
{
   "data": Object,
   "message": string,
   "errors": string[]
}
```

### 1. Retrieve All Users
**Endpoint:** `GET /api/users`  
**Description:** Retrieve all users with pagination and optional search functionality.  

**Query Parameters:**
- `page` (number): Page number.
- `limit` (number): Number of users per page.
- `search` (string): Search term for filtering users by name

**Response:**
- **200 OK**: Returns an array of user objects with pagination details.
- **400 Bad Request**: Validation error for `limit` or `page`.

**Example Request:**  
`GET /api/users?limit=1`

**Example Response:**
```json
{
   "message": "Users retrieved successfully",
   "data": [
      {
        "_id": "67e890b44ec4c1cbe5e62316",
        "name": "Rozan Ghosani",
        "email": "ghosanirozan1@gmail.com",
        "birthday": "2003-08-13T00:00:00.000Z",
        "timezone": "Asia/Jakarta",
        "__v": 0
      }
   ],
   "pagination": {
      "page": 1,
      "limit": 10,
      "totalUsers": 1,
      "totalPages": 1
   }
}
```
```json
{
    "message": "Invalid query parameters",
    "errors": [
        "Page and limit must be numbers"
    ]
}
```

---

### 2. Retrieve User by ID
**Endpoint:** `GET /api/users/:id`  
**Description:** Retrieve a specific user by their ID.  

**Path Parameters:**
- `id` (string, required): The ID of the user.

**Response:**
- **200 OK**: Returns the user object.
- **404 Not Found**: User not found.


**Example Response:**
```json
{
    "message": "User retrieved successfully",
    "data": {
        "_id": "67e82a3714d2d40cf26b356f",
        "name": "Rozan Ghosani",
        "email": "ghosanirozan1@gmail.com",
        "birthday": "2003-08-13T00:00:00.000Z",
        "timezone": "Asia/Jakarta",
        "__v": 0
    }
}
```
```json
{
    "message": "User not found",
    "errors": [
        "User not found"
    ]
}
```

### 3. Create a New User
**Endpoint:** `POST /api/users`  
**Description:** Create a new user with the required fields and validations. For each new user, the system will automatically generate a schedule for their next birthday to send a "Happy Birthday" message at 9 AM in their local timezone.

**Request Body:**
```ts
{
  "name": string,
  "email": string,
  "birthday": string,
  "timezone": string
}
```

**Response:**
- **201 Created**: User created successfully.
- **400 Bad Request**: Validation errors for missing or invalid fields.

**Validation Rules:**
- `name` (string, required): Must be at least 3 characters long.
- `email` (string, required): Must be a valid email address and unique. It will be validated to ensure no duplicate email addresses exist in the system.
- `birthday` (string, required): Must be in `YYYY-MM-DD` format.
- `timezone` (string, required): Must be a valid timezone.

**Example Request:**

`POST /api/users`
```json
{
  "name": "Rozan Ghosani",
  "email": "ghosanirozan1@gmail.com",
  "birthday": "2003-08-13",
  "timezone": "Asia/Jakarta"
}
```

**Example Response:**
```json
{
  "message": "User created successfully",
  "data": {
    "_id": "67e890b44ec4c1cbe5e62316",
    "name": "Rozan Ghosani",
    "email": "ghosanirozan1@gmail.com",
    "birthday": "2003-08-13T00:00:00.000Z",
    "timezone": "Asia/Jakarta",
    "__v": 0
  }
}
```
```json
{
  "message": "Invalid request body",
  "errors": [
    "Name, email, birthday, and timezone are required",
    "Name must be at least 3 characters long",
    "Email is not valid",
    "Birthday must be in YYYY-MM-DD format",
    "Invalid timezone"
  ]
}
```

### 4. Update an Existing User
**Endpoint:** `PUT /api/users/:id`  
**Description:** Update an existing user's details. This will delete the user's current birthday schedule and replace it with a new one based on the updated information.  

**Path Parameters:**
- `id` (string, required): The ID of the user to update.

**Request Body:**
```ts
{
  "name": string,
  "email": string,
  "birthday": string,
  "timezone": string
}
```

**Response:**
- **200 OK**: User updated successfully.
- **400 Bad Request**: Validation errors for missing or invalid fields.
- **404 Not Found**: User not found.

**Validation Rules:**
- `name` (string, required): Must be at least 3 characters long.
- `email` (string, required): Must be a valid email address and unique. It will be validated to ensure no duplicate email addresses exist in the system.
- `birthday` (string, required): Must be in `YYYY-MM-DD` format.
- `timezone` (string, required): Must be a valid timezone.

**Example Request:**

`PUT /api/users/67e890b44ec4c1cbe5e62316`
```json
{
  "name": "Rozan Ghosani Updated",
  "email": "updatedemail@gmail.com",
  "birthday": "2003-08-14",
  "timezone": "Asia/Kolkata"
}
```

**Example Response:**
```json
{
  "message": "User updated successfully",
  "data": {
    "_id": "67e890b44ec4c1cbe5e62316",
    "name": "Rozan Ghosani Updated",
    "email": "updatedemail@gmail.com",
    "birthday": "2003-08-14T00:00:00.000Z",
    "timezone": "Asia/Kolkata",
    "__v": 0
  }
}
```
```json
{
  "message": "Invalid request body",
  "errors": [
    "Name, email, birthday, and timezone are required",
    "Name must be at least 3 characters long",
    "Email is not valid",
    "Birthday must be in YYYY-MM-DD format",
    "Invalid timezone"
  ]
}
```
```json
{
  "message": "User not found",
  "errors": [
    "User not found"
  ]
}
```

### 5. Delete a User
**Endpoint:** `DELETE /api/users/:id`  
**Description:** Delete a user by their ID. This will also remove the user's birthday schedule from the system.  

**Path Parameters:**
- `id` (string, required): The ID of the user to delete.

**Response:**
- **200 OK**: User deleted successfully.
- **404 Not Found**: User not found.

**Example Response:**

`DELETE /api/users/67e890b44ec4c1cbe5e62316`
```json
{
  "message": "User deleted successfully",
  "data": {
    "_id": "67e890b44ec4c1cbe5e62316",
    "name": "Rozan Ghosani",
    "email": "ghosanirozan1@gmail.com",
    "birthday": "2003-08-13T00:00:00.000Z",
    "timezone": "Asia/Jakarta",
    "__v": 0
  }
}
```
```json
{
  "message": "User not found",
  "errors": [
    "User not found"
  ]
}
```

## Assumptions
- The application is designed to run directly using Node.js (`node index.js`) within a Docker container. It is assumed that process management and restarts will be handled by Docker or an orchestrator such as Kubernetes.

## Limitations
- Currently, the application only logs emails to the console (`console.log`) and does not send actual emails due to the limitations of the SMTP email configuration.

## Design Decisions
### Modular Architecture
- The application follows a modular architecture to separate concerns into distinct layers such as controllers, services, models, and routes. This approach enhances maintainability and simplifies future development.

### Configuration Management
- All configuration settings are centralized in the `config/` directory, making it easier to modify and manage application settings.

### Service-Based Approach
- Business logic is encapsulated within the `services/` directory. This promotes reusability and ensures that controllers remain clean and focused on handling HTTP requests and responses.

### Organized API Structure
- The application adopts an MVC-like pattern with organized directories for `controllers/`, `models/`, and `routes/`. This structure supports scalability and makes the codebase easier to navigate and extend.