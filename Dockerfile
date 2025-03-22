# Stage 1: Build the Angular application
FROM node:20-slim AS build

# Set the working directory
WORKDIR /app

RUN npm install -g pnpm
# Copy package.json and package-lock.json
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install
COPY . .
RUN pnpm run build

# Stage 2: Serve the Angular application using Nginx
FROM nginx:alpine
COPY --from=build /app/dist/toaseen-cms/browser /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
# Start Nginx
EXPOSE 80
