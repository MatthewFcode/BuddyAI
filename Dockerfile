FROM node:22

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]
RUN npm ci

COPY . .

ENV NODE_ENV=production

RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev