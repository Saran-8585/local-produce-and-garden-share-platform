FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package*.json frontend/
RUN cd frontend && npm install --legacy-peer-deps
COPY frontend/ frontend/
RUN cd frontend && npm run build

FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json backend/
RUN cd backend && npm ci --omit=dev
COPY backend/ backend/
COPY --from=build /app/frontend/dist /app/frontend/dist
EXPOSE 5000
CMD ["node", "backend/index.js"]
