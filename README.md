# Travel Copilot

A real-time chat application with LLM integration, built with React and Cloudflare Workers.

## Features

- Real-time chat using WebSocket connections
- LLM integration for AI-powered responses
- User authentication
- Serverless architecture using Cloudflare Workers
- Modern UI with Chakra UI

## Project Structure

```
travel-copilot/
├── frontend/         # React frontend
│   ├── src/         # Source code
│   └── package.json # Frontend dependencies
├── backend/         # Cloudflare Backend
│   ├── src/        # Backend source code
│   └── wrangler.toml # Backend configuration
└── package.json    # Root package.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm
- Cloudflare account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/travel-copilot.git
cd travel-copilot
```

2. Install dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

4. Create a `.dev.vars` file in the backend directory with:
```
OPENAI_API_KEY=your_openai_api_key
```

### Development

1. Start the development servers:

In one terminal (for the frontend):
```bash
npm run dev:frontend
```

In another terminal (for the backend):
```bash
npm run dev:backend
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:8787

### Deployment

1. Deploy the backend:
```bash
cd backend
wrangler deploy
```

2. Deploy the frontend:
```bash
cd frontend
npm run deploy
```

## Environment Variables

### Frontend
- `VITE_WORKER_URL`: URL of the deployed backend

### Backend
- `OPENAI_API_KEY`: Your OpenAI API key

## License

This project is licensed under the MIT License - see the LICENSE file for details.