# AlgoViz - Algorithm Visualization Platform

An interactive web application for visualizing algorithm execution step by step.
Built to help users develop deep intuition for how algorithms work internally.

## Architecture

```
algorithm_analyzer/
├── backend/          Express.js API server
│   ├── src/
│   │   ├── config/       Database connection, constants
│   │   ├── controllers/  Request handlers (auth, graphs)
│   │   ├── middleware/    Auth guards, error handling, validation
│   │   ├── models/       Mongoose schemas (User, Graph)
│   │   ├── routes/       Route definitions
│   │   ├── services/     Business logic (future)
│   │   ├── utils/        Helpers (tokens, errors, async wrapper)
│   │   └── validators/   Express-validator chains
│   └── tests/
├── frontend/         React + Vite application
│   ├── src/
│   │   ├── algorithms/   Algorithm engines (BFS, DFS, ...)
│   │   ├── api/          Axios client and endpoint wrappers
│   │   ├── components/
│   │   │   ├── canvas/      Interactive graph canvas
│   │   │   ├── controls/    Playback & settings bar
│   │   │   ├── layout/      Navbar, app shell
│   │   │   ├── panels/      Algorithm state panel
│   │   │   └── shared/      Protected routes, etc.
│   │   ├── pages/        Route-level page components
│   │   ├── store/        Zustand state (auth, graph, visualization)
│   │   └── styles/       Global CSS, design tokens
│   └── src/test/
└── .github/workflows/  CI pipeline
```

## Tech Stack

| Layer      | Technology                                |
|------------|-------------------------------------------|
| Frontend   | React 19, Vite 8, Zustand, Framer Motion  |
| Backend    | Express.js, Mongoose, JWT, bcryptjs        |
| Database   | MongoDB Atlas                              |
| Testing    | Vitest (frontend), Jest (backend)          |
| CI         | GitHub Actions                             |

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Backend

```bash
cd backend
npm install
npm run dev    # starts on port 5000 with nodemon
```

### Frontend

```bash
cd frontend
npm install
npm run dev    # starts on port 3000 with Vite
```

### Environment Variables

**Backend** (`.env`):
- `PORT` - server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - access token signing secret
- `JWT_REFRESH_SECRET` - refresh token signing secret
- `CLIENT_URL` - frontend origin for CORS

**Frontend** (`.env`):
- `VITE_API_URL` - backend API base URL

## Currently Implemented

### Algorithm Modules
- **Path Finding**: BFS, DFS with full step-by-step visualization

### Features
- Interactive graph canvas (create nodes, edges, set start/end)
- Weighted and directed graph support
- Step-by-step algorithm playback with variable speed
- Manual stepping (forward/backward)
- Algorithm state panel showing queue/stack, visited set, parent map
- JWT authentication with refresh token rotation
- Graph save/load via API

## Usage

1. Register or log in
2. Navigate to **Path Finding**
3. **Double-click** on the canvas to create nodes
4. **Shift+click** two nodes to connect them with an edge
5. **Right-click** a node to set it as start or end
6. Select an algorithm (BFS/DFS) and click **Run**
7. Use play/pause/step controls to watch the algorithm work
8. The side panel shows the internal state at each step

## Running Tests

```bash
# frontend
cd frontend && npm test

# backend
cd backend && npm test
```

## Future Plans

- Dijkstra's, A*, Bellman-Ford algorithms
- Sorting visualizations (merge sort, quicksort, etc.)
- Tree traversals and operations
- Dynamic programming table visualization
- Algorithm execution recording (server-side)
- Goal tree / recursion tree visualization
- More advanced animations and transitions
