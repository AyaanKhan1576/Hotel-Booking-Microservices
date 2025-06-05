# Hotel Booking Microservices Platform

## Contributers:
- **Ayaan Khan**   (22i-0832)
- **Ayaan Mughal** (22i-0861)
- **Mishal Ali**   (22i-1291)

A fully containerized microservices-based hotel booking platform, comprising:

- **User Service** (authentication, profiles, loyalty, favorites)  
- **Hotel Service** (hotel & room CRUD, search/filter, pricing)  
- **Booking Service** (room booking, cancellations, payments, group bookings)  
- **Joint Frontend** (single React app for all user, hotel, and booking modules)  

All services communicate via REST APIs and persist to MongoDB. Jest & Supertest cover backend white- and black-box tests.

---

## Repository Structure

```
/
├── docker-compose.yml
├── README.md
├── user-service/
│   ├── src/
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── hotel-service/
│   ├── src/
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── booking-service/
│   ├── src/
│   ├── tests/
│   ├── .env.example
│   └── package.json
└── joint-frontend/
    ├── public/
    ├── src/
    ├── .env.example
    └── package.json
```

---

## Technologies

- **Backend**: Node.js, Express.js, MongoDB, Mongoose  
- **Frontend**: React (Create React App)  
- **Testing**: Jest, Supertest  
- **Containerization**: Docker, Docker Compose  

---

## Prerequisites

- [Docker & Docker Compose](https://docs.docker.com/)  
- (Or) Node.js ≥14 & npm/yarn  
- A running MongoDB instance (or let Docker spin one up)

---

## Running Manually (Without Docker)

1. **Start MongoDB locally** on default port.
2. **In each service folder**:

   ```bash
   cd user-service
   cp .env.example .env
   npm install
   npm start
   ```

   Repeat for `hotel-service` and `booking-service`.  
3. **Frontend**:

   ```bash
   cd joint-frontend
   cp .env.example .env
   npm install
   npm start
   ```

---

## Testing

### Backend

Each service includes unit & integration tests:

```bash
# e.g. in user-service:
cd user-service
npm test -- --coverage
```

- Coverage reports generated under `coverage/`.
- Recommended: ≥ 70% coverage per service.

---

## API Endpoints Overview

### User Service (5001)

- **POST** `/api/users/register`  
- **POST** `/api/users/login`  
- **GET/PUT/DELETE** `/api/users/:id`  
- **Favorites**: POST/DELETE/GET `/api/users/favorites`  
- **Loyalty**: POST `/api/users/loyalty/enroll`, GET `/api/users/loyalty/status`, POST `/api/users/loyalty/redeem`

### Hotel Service (5000)

- **CRUD Hotels**:  
  - POST `/api/hotels`  
  - GET `/api/hotels` (filter via `?location=…`)  
  - GET/PUT/DELETE `/api/hotels/:id`
- **CRUD Rooms** (in room-service):  
  - POST `/api/rooms`, GET `/api/rooms` (filter/sort), GET/PUT/DELETE `/api/rooms/:id`, PATCH `/api/rooms/:id/price`

### Booking Service (5002)

- **Bookings**:  
  - GET `/api/bookings/search?email=…`  
  - POST `/api/bookings`, GET/PUT/DELETE `/api/bookings/:id`, PATCH `/api/bookings/:id/payment`
- **Group Bookings**:  
  - POST `/api/group-bookings`, GET `/api/group-bookings?agentEmail=…`  
  - PUT `/api/group-bookings/:groupId/rooms/:roomId`  
  - PATCH `/api/group-bookings/:groupId/discount`
- **Loyalty Award**: POST `/api/bookings/loyalty/award`

---

## Architecture & Design

- **Microservices**: Each core domain (user, hotel, booking) in its own Node.js service  
- **Layered**: Controllers → Models (Mongoose)  
- **Dockerized**: One container per service + one for MongoDB  
- **Frontend**: Single React app consuming all APIs

---
## 📄 License

This project is licensed under the [MIT License](LICENSE).

---
