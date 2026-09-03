# StudentHub Smart Cloud POS System

Production-quality Cloud Point of Sale (POS) system designed for Book Shops and Student Service Centers ("Student Hub POS").

## Repository Structure

```
student-hub-pos/
├── frontend/        # React + Tailwind CSS client (Global Design System)
├── server/          # Node.js / Express backend API
└── README.md
```

## Quick Start

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```

#### Check Database Connection (Terminal)
To test the Firestore connection directly in your terminal at any time:
```bash
cd server
npm run test:db
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:5173` and automatically proxy API calls to `http://localhost:5000`.

See [server/README.md](./server/README.md) for full backend architecture and configuration documentation.
