# Next.js standalone build. No secrets: only NEXT_PUBLIC_API_BASE is baked in.
# NEXT_PUBLIC_* vars are inlined at BUILD time — pass --build-arg on every
# production build, or set API_BASE_INTERNAL at RUNTIME (read live by the BFF).
FROM node:22-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_BASE=http://localhost:8000/api/v1
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
RUN NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
