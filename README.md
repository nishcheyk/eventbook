# Event Booking API

## Project Overview

This is an Event Booking API built with Node.js, TypeScript, Express, and MongoDB. It enables users to register, login, create and manage events, and book tickets with seat selection and QR code generation. The API is designed for scalability and efficient data handling using MongoDB's compound indexing strategy for seat bookings.

---

## Features

- User registration and JWT-based authentication
- CRUD operations for events
- Seat booking with individual seat selection per event
- QR code generation for booked tickets
- MongoDB indexing for efficient seat availability queries
- Dockerized for easy setup and deployment

---

## Getting Started

### Prerequisites

- Docker & Docker Compose installed (optional but recommended)
- Node.js and npm (for local development)

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd event-booking-api
```


2. Install dependencies (if running locally):
```
npm install
```


3. Create a `.env` file in the project root with the following format:

MONGO_URL=mongodb://mongo:27017/eventbook_db
JWT_SECRET=your_jwt_secret_key
NODE_ENV=local
PORT=3000

text

- `MONGO_URL`: MongoDB connection string (Docker service name is `mongo` if using Docker Compose)
- `JWT_SECRET`: Secret key for JWT signing
- `NODE_ENV`: Environment name (e.g., local, development, production)
- `PORT`: Port on which the app will run

---

### Running with Docker

1. Remove any local `node_modules` to avoid native module conflicts:

rm -rf node_modules

text

2. Build and run containers with Docker Compose:

docker-compose up --build

text

3. Access:

- API at `http://localhost:3000`
- API docs (Swagger UI) at `http://localhost:3000/api-docs`

---

## How Seat Booking is Designed Using MongoDB Indexing

### Why Not Embed Seats in Event Documents?

- Embedding a large seat array inside each event document leads to:
  - Large document size bloating, limiting MongoDB’s 16MB document size limit
  - Concurrency issues and write conflicts when many seats update simultaneously
  - Inefficient queries and updates when filtering or changing seat bookings

### Current Approach: Separate Booking Collection with Compound Index

- The `events` collection stores event metadata including total seats but **does not** embed seat status.
- The `bookings` collection stores individual seat bookings:
  - Each booking document links an `eventId`, `seatNumber`, `userId`, `status`, and optional QR code data.
- A **compound index on `(eventId, seatNumber)`** is created in the `bookings` collection.

### Benefits of Compound Indexing

- Efficiently determine seat availability by querying:

db.bookings.findOne({ eventId: "...", seatNumber: 5, status: "booked" });

text

- This query uses the index to quickly check if seat #5 in event is booked without scanning all bookings or loading large event documents.
- The index optimizes query speed and scales well even for events with many seats and concurrent bookings.
- MongoDB does not use traditional SQL joins; instead, related data is joined at the application layer using references.

### Summary

| Strategy                  | Effectiveness                       |
|---------------------------|------------------------------------|
| Embedding seat arrays     | Simple but causes bloat, conflicts, and poor concurrency |
| Separate bookings with index | Efficient, scalable, supports concurrency and fast queries |

---

## Additional Notes

- Docker image installs dependencies and builds the app with native modules correctly.
- Run the app with precompiled TypeScript or ensure `ts-node` is installed if running TypeScript directly inside Docker.
- Consider switching to pure JS `bcryptjs` to avoid native module rebuild issues in Docker.

---
