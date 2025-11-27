# AI Coding Agent Instructions: Smart School Bus

## Architecture Overview

This is a **microservices-based full-stack application** for managing school buses. Key architectural pattern:

- **API Gateway** (`back_end/API_gateway/server.js`): Single entry point on port 5000, routes requests to 11+ services
- **11 Independent Services**: Each runs on separate port (5001-5019), deployed via Docker Compose
- **Frontend**: Next.js (TypeScript) with TSX components on port 3000
- **Database**: MySQL with per-service schemas (not shared databases)

### Service Ports & Responsibilities
- **5000**: API Gateway (routes all requests)
- **5010**: Auth Service (user login, account sync)
- **5011**: Bus Service (bus operations)
- **5001**: Student Service
- **5002**: Messaging Service (Socket.io real-time)
- **5003**: Route Service (route planning via ORS)
- **5005**: Schedule Service
- **5009**: Location Service
- **5012**: User Service (drivers, parents, users)
- **5015+**: Notification, Incident, Log services

## Development Workflow

### Local Setup
1. **Root level**: `npm run dev` spawns all services concurrently using `concurrently` package
2. **Backend only**: `cd back_end && npm install && npm run dev`
3. **Frontend only**: `cd front_end && npm install && npm run dev`
4. **Services**: Use workspace setup (`npm install` at back_end root installs all service dependencies)

### Docker Deployment
```bash
docker-compose up  # Starts all services simultaneously
```
Each service has its own Docker container with volume mounts for live reload.

### Database Initialization
Run SQL scripts from `database/` folder:
- `user_service.sql` → Auth/User management schema
- Individual schema files for each service
- No shared database; each service owns its data schema

## Code Patterns & Conventions

### Service Structure
Every microservice follows this pattern:
```
service_name/
├── app.js                    # Express app setup (cors, routes)
├── package.json              # Service-specific dependencies
├── routes/                   # Express route handlers
├── controllers/              # Business logic
├── db/                       # Database connections/queries
└── services/                 # Additional service logic (auth.service.js pattern)
```

### Request/Response Format
- **Port configuration**: Services must respect `process.env.PORT` or default value
- **CORS**: All services have `cors()` middleware enabled
- **Body parser**: Use `express.json()` for JSON payloads
- **Error handling**: Catch-all middleware pattern (see `user_service/app.js`)
  ```javascript
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  });
  ```

### Authentication Pattern
- Auth Service uses bcrypt for password hashing (10 rounds)
- Password sync endpoint: POST `/api/auth/sync` with `{userID, username, password, roleID}`
- JWT tokens expected in requests (from auth routes pattern)
- User roles: Admin (R001), Driver (R002), Parent (R003)

### Database Access
- MySQL2 package for queries
- Helper pattern for Promise-based queries (see `auth.service.js`):
  ```javascript
  const query = (sql, params) => {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };
  ```

## Frontend Patterns

- **Framework**: Next.js with App Router (port 3000)
- **Language**: TypeScript (TSX components)
- **Styling**: Tailwind CSS
- **Components**: Organized by role (`AdminDashboard/`, `DriverDashboard/`, `ParentDashboard/`)
- **API calls**: Axios (see dependencies)
- **Maps**: React Leaflet and @react-google-maps/api for routing
- **Type paths**: `@/*` alias maps to project root (tsconfig.json)

## Cross-Service Communication

### Batch Endpoints Pattern
Services support batch operations via `service_config.json`:
```json
{
  "auth": { "url": "http://localhost:3010/api/auth/batch", "method": "POST" },
  "user": { "url": "http://localhost:3019/api/users/batch", "method": "POST" }
}
```
Use for syncing data across services.

### API Gateway Routing
All routes must be registered in `back_end/API_gateway/server.js`:
```javascript
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
```
The gateway aggregates all service endpoints into a single facade.

## Important Implementation Details

### Port Conflicts
- Each service must have unique port (check `docker-compose.yml` for assignments)
- Services use `localhost:PORT` for inter-service calls within Docker
- Change ports in: service's `app.js`, `docker-compose.yml`, and `service_config.json`

### Environment Variables
- Services use `.env` files (see `Services/auth_service/.env`)
- Database credentials: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Port override: `PORT=XXXX` in .env or Docker environment

### Mixed Language Content
- Routes/comments may include Vietnamese (e.g., "Thiếu dữ liệu để đồng bộ user")
- Follow existing pattern when adding validation messages

### Missing Service Files
Some service directories exist but lack `app.js` (e.g., `incident_service/`, `route_service/`). Implement using auth_service template when scaffolding.

## Testing & Validation Gaps

- **No test files**: Implement tests using Jest for Node.js services, React Testing Library for frontend
- **No validation layer**: Add express-validator (already in dependencies) to routes
- **No rate limiting**: Consider adding for production
- **No logging**: Log service exists but not fully integrated

## Database Schema Quick Reference

User Service schema includes:
- `roles` table: RoleID (R001=Admin, R002=Driver, R003=Parent), RoleName
- `users` table: UserID (PK), RoleID (FK), UserName, Password (bcrypt hash)
- Student/Bus/Route/Location schemas in separate databases per service

---

Last updated: November 26, 2025
