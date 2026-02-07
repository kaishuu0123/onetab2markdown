# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Enable Corepack for Yarn 4
RUN corepack enable

COPY package*.json ./
COPY .yarnrc.yml ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
