FROM node:20-alpine AS base
RUN corepack enable && corepack prepare yarn@stable --activate
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json yarn.lock* .yarnrc.yml* ./
RUN yarn install --immutable

# Development server
FROM deps AS dev
COPY . .
EXPOSE 5173
CMD ["yarn", "dev"]

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
