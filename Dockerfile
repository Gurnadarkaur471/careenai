# Stage 1: Build the React client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production server runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install server dependencies
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production

# Copy server code
COPY server/ ./

# Copy built frontend assets to client/dist
WORKDIR /app
COPY --from=client-builder /app/client/dist ./client/dist

# Expose port
EXPOSE 5000

# Start server
WORKDIR /app
CMD ["node", "server/src/server.js"]
