# Codemate Backend Core Service

A production-ready **Node.js + Express** REST API backend using **MongoDB** (via Mongoose) as the database. It includes JWT-based authentication, role-based access control, AWS S3 file uploads, Swagger API documentation, and multi-environment configuration.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Code Quality](#code-quality)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js `>=20.12.1` |
| Framework | Express.js |
| Database | MongoDB (Mongoose ODM) |
| Authentication | JWT (`jsonwebtoken`) + Passport.js |
| Password Hashing | bcryptjs |
| File Uploads | AWS S3 (via `multer-s3`) |
| Email | Nodemailer |
| Validation | express-validator |
| API Docs | Swagger UI (`swagger-jsdoc` + `swagger-ui-express`) |
| Code Quality | ESLint (Airbnb), Prettier, Husky (pre-commit) |
| Package Manager | pnpm |

---

## Requirements

- **Node.js** `>=20.12.1` — [Download](https://nodejs.org/)
- **pnpm** — [Install](https://pnpm.io/installation)
- **MongoDB** — [Local](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/atlas)
- **git** — [Download](https://git-scm.com/)

Verify your setup:

```bash
node --version   # v20.x.x or higher
pnpm --version   # 8.x.x or higher
```

Install pnpm globally if needed:

```bash
npm install -g pnpm
```

---

## Getting Started

```bash
# 1. Clone the repository
git clone <GIT_REPOSITORY_URL>
cd <project-folder>

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.template .env
# Edit .env with your actual values (see Environment Configuration below)

# 4. Start the server
pnpm start
```

---

## Environment Configuration

Copy `.env.template` to `.env` and fill in the required values.

```env
# App
NODE_ENV=local          # local | development | test | production
PORT=3000

# MongoDB — environment-specific URIs (see config/database.js)
LOCAL_MONGODB_URI=mongodb://localhost:27017/backend-local
DEV_MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/backend-dev
TEST_MONGODB_URI=mongodb://localhost:27017/backend-test
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/backend

# Auth
SESSION_SECRET=your_session_secret
JWT_SECRET_KEY=your_jwt_secret_key

# AWS S3
AWS_S3_REGION=ap-south-1
AWS_INPUT_BUCKET=your-s3-bucket-name
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
CDN_WEB_STATIC=https://your-cloudfront-domain.com

# Swagger Auth (Basic Auth for API docs)
SWAGGER_ADMIN_USER=admin@example.com
SWAGGER_ADMIN_PASSWORD=yourpassword
SWAGGER_MOBILE_USER=mobile@example.com
SWAGGER_MOBILE_PASSWORD=yourpassword

# URLs
FRONTEND_URL=http://localhost:4200
BACKEND_URL=http://localhost:3000

# External APIs
POSTAL_PINCODE_API=https://api.postalpincode.in/pincode
```

### How Environment DB Selection Works

The `NODE_ENV` variable determines which MongoDB URI is used automatically via [`config/database.js`](./config/database.js):

| `NODE_ENV` | URI Variable Used |
|---|---|
| `local` | `LOCAL_MONGODB_URI` |
| `development` | `DEV_MONGODB_URI` |
| `test` | `TEST_MONGODB_URI` |
| `production` | `MONGODB_URI` |

No code changes needed — just set `NODE_ENV` and the matching URI variable.

---

## Running the Project

```bash
# Start the server
pnpm start

# Run linting with auto-fix
pnpm run lint

# Run Prettier formatting + lint
pnpm run format
```

The server starts at `http://localhost:<PORT>` (default: `3000`).

---

## Project Structure

```
p-i-backend/
├── app.js                          # Express app entry point
├── package.json
├── .env.template                   # Environment variable template
│
├── config/
│   ├── database.js                 # MongoDB env-based URI config
│   ├── jwtOptions.js               # JWT secret and expiry config
│   ├── options.js                  # App-wide constants (roles, statuses, etc.)
│   └── swagger.js                  # Swagger configuration
│
├── models/
│   ├── index.js                    # Dynamic model auto-loader (scans models/*.js)
│   ├── User.js                     # Mongoose User schema
│   ├── Address.js                  # Mongoose Address schema
│   ├── helpers/
│   │   ├── InitializeConnectionHelper.js  # mongoose.connect() on startup
│   │   ├── AuthHelper.js           # JWT verify + authenticateJWT middleware
│   │   ├── UserHelper.js           # User utility functions
│   │   ├── AWSHelper.js            # S3 upload helpers
│   │   ├── EmailHelper.js          # Nodemailer wrapper
│   │   ├── ErrorHandleHelper.js    # Global error logger
│   │   ├── GeneratePDFHelper.js    # PDF generation
│   │   ├── ExceljsHelper.js        # Excel generation
│   │   └── UtilHelper.js           # General utilities (OTP, genRes, etc.)
│   └── repositories/
│       ├── UserRepository.js       # All User CRUD + auth operations
│       ├── SubAdminRepository.js   # Admin management operations
│       └── PostalPincodeRepository.js  # Postal pincode API integration
│
├── controllers/
│   └── api/v1/
│       ├── User.js                 # User auth & profile endpoints
│       ├── Shared.js               # Shared endpoints (file upload, etc.)
│       └── admin/
│           ├── User.js             # Admin user management
│           └── SubAdmin.js         # Sub-admin management
│
├── routes/
│   └── api/v1/
│       ├── User.js                 # /api/v1/user routes
│       ├── Shared.js               # /api/v1/shared routes
│       └── admin/
│           ├── User.js             # /api/v1/admin/user routes
│           └── SubAdmin.js         # /api/v1/admin/sub-admin routes
│
├── schema-validation/              # express-validator request schemas
├── api-docs/                       # Swagger YAML documentation files
└── public/                         # Static assets & views
```

### Adding a New Model

Drop any new `.js` Mongoose model file into `models/` — it is **automatically discovered and registered** by `models/index.js`. No manual import needed.

```js
// models/Product.js
const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({ ... });
module.exports = mongoose.model('Product', productSchema);

// Now available anywhere via:
const { Product } = require('./models');
```

---

## API Documentation

Swagger UI is available in **non-production** environments:

| Docs | URL |
|---|---|
| Admin API | `http://localhost:3000/api-docs/v1/admin` |
| Mobile / Web API | `http://localhost:3000/api-docs/v1/web-mobile` |

Access is protected by HTTP Basic Auth (configured via `SWAGGER_ADMIN_USER` / `SWAGGER_MOBILE_USER` env vars).

---

## Code Quality

### Linting & Formatting

This project uses ESLint (Airbnb base ruleset) and Prettier. A Husky pre-commit hook runs formatting automatically before every commit.

```bash
pnpm run format   # Prettier + ESLint fix
pnpm run lint     # ESLint fix only
```

### Pre-commit Hook

Husky runs `pnpm run format` automatically on every `git commit`. To set it up after a fresh clone:

```bash
pnpm install   # Husky hooks are installed via the "prepare" script
```