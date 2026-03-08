FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# Development server
# node_modules live in a named Docker volume — install at startup to keep in sync
FROM base AS dev
WORKDIR /app
EXPOSE 5173
CMD ["sh", "-c", "yarn install --frozen-lockfile && yarn dev"]

# Build
FROM deps AS builder
COPY . .
RUN yarn build

# Production — serve static files with nginx
FROM nginx:alpine AS prod
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
