# ---- Stage 1: build the Angular app --------------------------------------
# Same Node version as the one used to create package-lock.json.
FROM node:22.23.4-alpine AS build
WORKDIR /app

# Dependency manifests first: Docker caches this layer, so `npm ci`
# only reruns when package.json or package-lock.json change.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Stage 2: serve the static files ---------------------------------------
# Only the built files are kept: no Node, no source code, no node_modules.
# This nginx image runs as a non-root user and listens on 8080.
FROM nginxinc/nginx-unprivileged:1.31.7-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/camera-study/browser /usr/share/nginx/html
EXPOSE 8080
