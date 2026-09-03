# Student Hub POS - Backend API

Production-quality Cloud Point of Sale (POS) backend foundation designed specifically for a Book Shop and Student Service Center ("Student Hub POS").

---

## 1. Project Description

**Student Hub POS** is a modern, cloud-based Point of Sale system tailored to handle both retail merchandise (books, stationery, snacks, drinks, USB/accessories) and campus student services (printing, photocopying, scanning, laminating, binding).

This repository contains the Node.js / Express backend foundation (Phase 1), structured around Firebase Authentication, Firestore, role-based authorization, and clean layered architecture.

---

## 2. Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v4)
- **Module System**: JavaScript ES Modules (`"type": "module"`)
- **Database & Auth**: Firebase Admin SDK (`firebase-admin` - Firestore, Authentication, Storage)
- **Security**: `helmet` (HTTP header hardening), `cors` (Cross-Origin Resource Sharing)
- **Configuration**: `dotenv`
- **Development Tooling**: `nodemon`

---

## 3. Backend Architecture

The backend adheres strictly to a clean, multi-tier layered architecture:

```
Request (HTTP)
      ↓
[ Express Application & Security Middleware (Helmet, CORS, Body Parsers) ]
      ↓
[ Route Layer (routes/index.js -> /api/v1/*) ]
      ↓
[ Authentication & Authorization Middleware (authMiddleware, requireRole) ]
      ↓
[ Controller Layer (Input extraction & Response formatting) ]
      ↓
[ Service Layer (Core Business Rules & Query Orchestration) ]
      ↓
[ Database / Firebase Admin SDK (Firestore Collections) ]
```

### Key Architecture Principles:
- **Separation of Concerns**: Routes register endpoints; Controllers handle HTTP req/res; Services encapsulate business logic; Database abstraction handles data persistence.
- **Single Responsibility Principle**: Each middleware, service, and controller file is focused and small.
- **Never expose secrets**: Firebase Admin private keys and configuration are kept strictly on the server and loaded via environment variables.

---

## 4. Folder Structure

```
server/
│
├── src/
│   ├── config/
│   │   ├── environment.js          # Centralized environment variable loader
│   │   ├── firebase.js             # Singleton Firebase Admin SDK initialization
│   │   └── database.js            # Firestore database & collection access helpers
│   │
│   ├── constants/
│   │   ├── roles.js                # System roles: ADMIN, MANAGER, CASHIER, INVENTORY_MANAGER
│   │   ├── collections.js          # 14 planned Firestore collection names
│   │   └── itemTypes.js            # PHYSICAL_PRODUCT vs SERVICE distinction
│   │
│   ├── controllers/                # Minimal controller placeholders for all modules
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── employeeController.js
│   │   ├── expenseController.js
│   │   ├── healthController.js
│   │   ├── inventoryController.js
│   │   ├── notificationController.js
│   │   ├── productController.js
│   │   ├── purchaseController.js
│   │   ├── reportController.js
│   │   ├── salesController.js
│   │   ├── serviceController.js
│   │   └── supplierController.js
│   │
│   ├── errors/
│   │   └── AppError.js             # Custom operational error classes (400, 401, 403, 404, 409, 422, 500)
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js       # Firebase ID token validation middleware
│   │   ├── roleMiddleware.js       # Reusable requireRole() RBAC middleware
│   │   ├── notFoundMiddleware.js   # 404 Not Found handler
│   │   └── errorMiddleware.js      # Centralized error formatting handler
│   │
│   ├── models/                     # Firestore data models and schemas placeholder
│   │
│   ├── routes/
│   │   ├── index.js                # Central API v1 route aggregator
│   │   ├── authRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── healthRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── productRoutes.js
│   │   ├── purchaseRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── salesRoutes.js
│   │   ├── serviceRoutes.js
│   │   └── supplierRoutes.js
│   │
│   ├── services/                   # Service layer placeholders connecting controllers to data
│   │   ├── authService.js
│   │   ├── customerService.js
│   │   ├── employeeService.js
│   │   ├── expenseService.js
│   │   ├── inventoryService.js
│   │   ├── notificationService.js
│   │   ├── productService.js
│   │   ├── purchaseService.js
│   │   ├── reportService.js
│   │   ├── salesService.js
│   │   ├── serviceItemService.js
│   │   └── supplierService.js
│   │
│   ├── utils/
│   │   └── apiResponse.js          # Standardized sendSuccess() and sendError() helpers
│   │
│   ├── validators/                 # Request validation schemas placeholder
│   │
│   ├── app.js                      # Express application setup
│   └── server.js                   # Server entry point & startup listener
│
├── .env                            # Local environment variables (gitignored)
├── .env.example                    # Environment variable template
├── .gitignore                      # Git ignore rules
├── package.json                    # Node dependencies & npm scripts
└── README.md                       # Documentation
```

---

## 5. Installation Instructions

1. Ensure Node.js (v18 or higher) and npm are installed:
   ```bash
   node -v
   npm -v
   ```

2. Navigate into the `server/` directory:
   ```bash
   cd server
   ```

3. Install production and development dependencies:
   ```bash
   npm install
   ```

---

## 6. Environment Variables

Create a `.env` file in `server/` by copying `.env.example`:

```bash
cp .env.example .env
```

Configurable variables:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Server listening port | `5000` |
| `NODE_ENV` | Runtime environment (`development` / `production` / `test`) | `development` |
| `CLIENT_URL` | Allowed origin for CORS | `http://localhost:5173` |
| `FIREBASE_PROJECT_ID` | Firebase Project ID | `your-firebase-project-id` |
| `FIREBASE_CLIENT_EMAIL` | Firebase Service Account client email | `firebase-adminsdk-xxx@...` |
| `FIREBASE_PRIVATE_KEY` | Firebase Service Account private key string | `"-----BEGIN PRIVATE KEY-----\n..."` |
| `FIREBASE_STORAGE_BUCKET` | Firebase Cloud Storage bucket name | `your-project.appspot.com` |
| `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` | (Optional) Path to service account JSON file | `./serviceAccountKey.json` |

---

## 7. Firebase Setup Requirements

To connect to live Firebase services:
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Create or select your Firebase project.
3. Enable **Firebase Authentication** (Email/Password, etc.).
4. Enable **Cloud Firestore** in production or test mode.
5. Generate a new Private Key:
   - Go to **Project Settings** > **Service Accounts**.
   - Click **Generate new private key**.
   - Download the JSON file.
6. Populate your `server/.env` file with `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`.
   *(Alternatively, save the file locally as `serviceAccountKey.json` and configure `FIREBASE_SERVICE_ACCOUNT_KEY_PATH`)*.

> **Security Note:** Never commit `.env` or service account keys to GitHub or expose them to frontend clients.

---

## 8. Running Development Server

Start the backend with automatic hot-reloading using `nodemon`:

```bash
npm run dev
```

Start the backend in production mode:

```bash
npm start
```

---

## 9. API Base URL

All REST API endpoints are versioned and mounted under:

```
http://localhost:5000/api/v1
```

Available API module routes:
- `/api/v1/health`
- `/api/v1/auth`
- `/api/v1/products`
- `/api/v1/services`
- `/api/v1/inventory`
- `/api/v1/sales`
- `/api/v1/purchases`
- `/api/v1/suppliers`
- `/api/v1/customers`
- `/api/v1/expenses`
- `/api/v1/reports`
- `/api/v1/employees`
- `/api/v1/notifications`

---

## 10. Health Check Endpoint

Public endpoint for monitoring server status (no authentication required):

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/v1/health` (also accessible at `/api/health`)
- **Status Code**: `200 OK`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Student Hub POS API is running",
    "data": {
      "environment": "development"
    }
  }
  ```

---

## 11. Authentication Approach

- **Client-Side Auth**: The frontend (React) authenticates users directly with Firebase Auth (e.g. Email/Password) and obtains a signed JWT ID Token.
- **Backend Verification**: Client sends the ID token with each request:
  ```http
  Authorization: Bearer <firebase_id_token>
  ```
- **Middleware**: `authMiddleware.js` extracts and validates the token using `auth.verifyIdToken(token)`.
- **User Attachment**: Verified identity is attached to `req.user` (`uid`, `email`, `role`, `claims`).
- Missing or invalid tokens return HTTP 401 Unauthorized with standardized error JSON.

---

## 12. Role Structure

Defined in `src/constants/roles.js`:

| Role | Responsibilities / Access Level |
| :--- | :--- |
| `ADMIN` | Complete access to all resources, system settings, employee management, and financial audit logs. |
| `MANAGER` | Daily operational control: reports, inventory, suppliers, purchasing, expenses, and staff oversight. |
| `CASHIER` | Front-counter sales, processing physical product transactions, and student service orders. |
| `INVENTORY_MANAGER` | Stock replenishment, purchasing from suppliers, inventory adjustments, and product catalog management. |

Protected routes utilize the reusable `requireRole(...roles)` middleware:
```javascript
router.get('/inventory', authMiddleware, requireRole('ADMIN', 'MANAGER', 'INVENTORY_MANAGER'), inventoryController.getInventory);
```

---

## 13. Development Roadmap

- **Phase 1 (Completed)**: Backend Foundation & Architecture
  - Modular directory layout
  - Firebase Admin SDK singleton
  - Security headers & CORS
  - Centralized error handling & unified response formats
  - Authentication & Role-based middleware
  - Placeholder routes, controllers, and services
  - Git branch `Computer` and repository sync
- **Phase 2 (Next)**: Authentication & User/Employee Management
  - User synchronization with Firestore
  - Firebase custom claims assignment for roles (`ADMIN`, `MANAGER`, `CASHIER`, `INVENTORY_MANAGER`)
  - Employee profile management & audit trails
- **Phase 3**: Product & Student Service Management
  - Physical products with inventory quantity tracking
  - Service catalog (Printing, Photocopy, Laminating, etc.)
  - Category management
- **Phase 4**: Inventory & Supplier Management
  - Stock levels, low-stock alerts, inventory transaction logs
  - Supplier management & Purchase Orders
- **Phase 5**: POS Sales & Billing Engine
  - Cart calculations, discount rules, tax handling
  - Mixed sales (Physical items + Services)
  - Receipts generation & sales records
- **Phase 6**: Expenses, Financial Reporting & Analytics
