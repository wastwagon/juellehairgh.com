FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code (will be overridden by volume mount in dev)
COPY . .

# Expose port
EXPOSE 3000

# Default command (will be overridden in docker-compose.yml for dev)
CMD ["npm", "run", "dev"]
