# ── Frontend Dockerfile — React + Vite ──────────────────────
# Serves the Vite dev server on port 5173.
# In production, replace with a multi-stage build that outputs
# static files to nginx.

FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better Docker layer caching)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Vite dev server port
EXPOSE 5173

# Run Vite dev server with --host to accept external connections
# (required inside Docker container)
CMD ["npm", "run", "dev", "--", "--host"]
