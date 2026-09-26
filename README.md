# RBAC Backend — Task 3

Node.js + Express + MongoDB backend with Role-Based Access Control (Admin / User), JWT auth, pagination, search/filter, and clean MVC structure.

## Project Structure

```
rbac-backend/
├── config/
│   └── db.js                  MongoDB connection
├── models/
│   ├── User.js                User schema (name, email, password, role)
│   └── Product.js             Product schema (the protected resource)
├── middleware/
│   ├── authMiddleware.js      Verifies JWT ("protect")
│   └── roleMiddleware.js      Checks user role ("authorize")
├── controllers/
│   ├── authController.js      register / login / getMe
│   └── productController.js   CRUD + pagination + search
├── routes/
│   ├── authRoutes.js
│   └── productRoutes.js
├── server.js                  App entry point
├── .env.example                Copy to .env and fill in
├── .gitignore
└── package.json
```

## How the RBAC design works

- **Two roles**: `admin` and `user`, stored on the `User` document and embedded in the JWT.
- `protect` middleware (in `authMiddleware.js`) reads the `Authorization: Bearer <token>` header, verifies the JWT, and loads the user onto `req.user`.
- `authorize(...roles)` middleware (in `roleMiddleware.js`) checks `req.user.role` is one of the allowed roles, otherwise returns **403 Forbidden**.
- **Ownership check**: for update/delete, both admin and user pass the role check, but inside the controller we compare `product.owner` to `req.user._id`. Admins bypass this check; regular users are blocked (403) if they don't own the resource.
- Both roles can **create** products (the creator becomes the owner) — this is what makes "users can update/delete their own data" possible. Only admins can update/delete resources they don't own.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+) installed
- MongoDB running locally (`mongodb://127.0.0.1:27017`) OR a free MongoDB Atlas cluster

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env` and edit values:
```bash
cp .env.example .env
```
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/rbac_db
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=1d
```
If using Atlas, paste your Atlas connection string as `MONGO_URI`.

### 4. Run the server
```bash
npm run dev     # with nodemon (auto-restart)
# or
npm start
```
You should see:
```
MongoDB connected: <host>
Server running on port 5000
```

## API Endpoints

### Auth
| Method | Route              | Access  | Description               |
|--------|---------------------|---------|----------------------------|
| POST   | /api/auth/register  | Public  | Create a user (role: user/admin) |
| POST   | /api/auth/login      | Public  | Log in, returns JWT       |
| GET    | /api/auth/me          | Private | Get logged-in user profile |

**Register body:**
```json
{ "name": "Ali Admin", "email": "admin@test.com", "password": "123456", "role": "admin" }
```
(Omit `role` or set `"user"` for a normal user.)

**Login body:**
```json
{ "email": "admin@test.com", "password": "123456" }
```
Response includes a `token` — copy it and use it as `Authorization: Bearer <token>` on every request below.

### Products (the protected resource)
| Method | Route                                   | Access                          |
|--------|-------------------------------------------|----------------------------------|
| GET    | /api/products?page=1&limit=10             | Any logged-in user (paginated)  |
| GET    | /api/products?search=phone&category=electronics | Any logged-in user (search/filter) |
| GET    | /api/products/:id                          | Any logged-in user               |
| POST   | /api/products                              | Any logged-in user (becomes owner) |
| PUT    | /api/products/:id                          | Admin (any) / User (own only)   |
| DELETE | /api/products/:id                          | Admin (any) / User (own only)   |

**Create product body:**
```json
{ "name": "iPhone 15", "category": "electronics", "price": 999, "description": "Latest model" }
```

## Step-by-Step Testing Guide (Postman / Thunder Client)

1. **Register an admin**: POST `/api/auth/register` with `role: "admin"`. Copy the returned `token`.
2. **Register a normal user**: POST `/api/auth/register` with `role: "user"` (or omit role). Copy this `token` too.
3. **Create a product as the user**: POST `/api/products` with the user's token in the Authorization header. Note the returned `_id`.
4. **Try updating someone else's product as the user** (create a second product with the admin's token first, then try to PUT it using the user's token) → expect **403 Forbidden**.
5. **Update/delete as admin**: use the admin's token to PUT/DELETE the user's product → should succeed (200), proving admin bypasses ownership.
6. **Update/delete own product as user**: should succeed (200).
7. **Test pagination**: GET `/api/products?page=1&limit=2` after creating 3+ products.
8. **Test search**: GET `/api/products?search=phone` or `/api/products?category=electronics`.
9. **Test no token**: call any `/api/products` route without the Authorization header → expect **401 Unauthorized**.
10. **Screenshot each of the above request/response pairs in Postman** — these screenshots are what you paste into your submission Word document.

## Task Submission Checklist

For your submission Word document, include:
1. **Screenshots** of the Postman/Thunder Client requests above (register, login, create, the 403 forbidden case, the successful admin override, pagination, search, and the 401 no-token case). Also include a screenshot of the MongoDB collection (e.g., via MongoDB Compass or `mongosh`) showing saved users/products.
2. **GitHub repository link** — push this project (see steps below) and make sure the repo is public.

## Pushing to GitHub

```bash
cd rbac-backend
git init
git add .
git commit -m "RBAC backend with JWT, MVC structure, pagination and search"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```
Then double check the repo's visibility is set to **Public** in GitHub settings, and that `.env` was NOT pushed (it's excluded via `.gitignore`).
