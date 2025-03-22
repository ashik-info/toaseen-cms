# Stage 1: Build the Angular application
FROM node:20-slim AS build

# Set the working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files first
COPY package.json pnpm-lock.yaml ./

# Verify that package.json is present (debugging step)
RUN ls -la /app

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the project files
COPY . .

# Build the Angular app
RUN pnpm run build

# Stage 2: Serve the built application
FROM node:20-slim AS runtime

WORKDIR /app

RUN npm install -g pnpm

# Copy the built app from the previous stage
COPY --from=build /app/dist/toaseen-cms/ ./dist/toaseen-cms

# Set the command to run the SSR server
CMD node dist/toaseen-cms/server/server.mjs

EXPOSE 4000