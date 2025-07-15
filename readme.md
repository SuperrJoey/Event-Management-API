# 🎟️ Event Management API

A RESTful API built with Node.js, Express, and PostgreSQL for managing events and user registrations.

---

## Tech Stack

* Node.js + Express
* PostgreSQL
* pg (node-postgres)
* dotenv

---

##  Setup Instructions

1. **Clone the repo**

   ```bash
   git clone https://github.com/your-username/event-management-api.git
   cd event-management-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**
   Create a `.env` file:

   ```
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_pg_user
   DB_PASSWORD=your_pg_password
   DB_NAME=event_management
   ```

4. **Create tables**

   ```sql
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     email VARCHAR(100) UNIQUE NOT NULL
   );

   CREATE TABLE events (
     id SERIAL PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     date_time TIMESTAMP NOT NULL,
     location VARCHAR(255) NOT NULL,
     capacity INT CHECK (capacity > 0 AND capacity <= 1000)
   );

   CREATE TABLE event_registrations (
     event_id INT REFERENCES events(id) ON DELETE CASCADE,
     user_id INT REFERENCES users(id) ON DELETE CASCADE,
     PRIMARY KEY (event_id, user_id)
   );
   ```

5. **Start the server**

   ```bash
   npm run dev
   ```

---

##  API Endpoints

###  Create Event

**POST** `/api/events`

```json
{
  "title": "Hackathon",
  "date_time": "2025-08-01T10:00:00Z",
  "location": "Mumbai",
  "capacity": 500
}
```

---

###  Get Event Details

**GET** `/api/events/:id`

Returns event info + registered users.

---

###  Register for Event

**POST** `/api/events/:id/register`

```json
{
  "user_id": 1
}
```

Constraints:

* No duplicate registrations
* Cannot register if full or for past events

---
###  Cancel Registration

**DELETE** `/api/events/:id/cancel/:userId`

---

###  List Upcoming Events

**GET** `/api/events/upcoming`

Sorted by:

1. Date (ascending)
2. Location (alphabetically)

---

###  Event Stats

**GET** `/api/events/:id/stats`

Returns:

* Total registrations
* Remaining capacity
* Percentage used

---

##  Notes

* All responses use standard HTTP status codes.
* Error messages are clean and descriptive.
* Input validation is enforced for all endpoints.

---

##  Author

Built by Dev as part of a backend API assessment.
