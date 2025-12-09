FROM node:18-slim

# Build arguments for version tracking
ARG BUILD_VERSION=unknown
ARG BUILD_DATE=unknown

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create version file with build info
RUN echo "BUILD_VERSION=${BUILD_VERSION}" > /app/.version && \
    echo "BUILD_DATE=${BUILD_DATE}" >> /app/.version && \
    echo "NODE_VERSION=$(node --version)" >> /app/.version && \
    echo "NPM_VERSION=$(npm --version)" >> /app/.version

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code (will be overridden by volume mount in dev)
COPY . .

# Ensure version file exists (created above, but ensure it persists)
RUN if [ ! -f /app/.version ]; then \
      echo "BUILD_VERSION=${BUILD_VERSION}" > /app/.version && \
      echo "BUILD_DATE=${BUILD_DATE}" >> /app/.version && \
      echo "NODE_VERSION=$(node --version)" >> /app/.version && \
      echo "NPM_VERSION=$(npm --version)" >> /app/.version; \
    fi

# Generate Prisma Client for Linux platform (debian-openssl-3.0.x)
# This must happen before build to ensure Prisma Client is available
# Prisma generate doesn't need a real database connection
# Remove .env if it exists to avoid connection issues during build
RUN rm -f .env && npx prisma generate --schema=./prisma/schema.prisma

# Build the application for production
RUN npm run build

# Rebuild native modules (bcrypt, etc.) for the target platform AFTER build
# This ensures bcrypt is compiled for the correct platform (linux/amd64)
# Must happen after build to ensure all dependencies are in place
RUN npm rebuild bcrypt --build-from-source

# Expose port
EXPOSE 3001

# Default command for production
CMD ["npm", "run", "start:prod"]
