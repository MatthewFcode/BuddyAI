# FROM node:22

# WORKDIR /app

# COPY ["package.json", "package-lock.json*", "./"]
# RUN npm ci

# COPY . .


# ENV NODE_ENV=production

# RUN npx prisma generate
# RUN npm run build
# RUN npm prune --omit=dev

# # starting the next.js server
# EXPOSE 3000
# CMD ["npm", "start"]

FROM node:22

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]
RUN npm ci

COPY . .

ENV NODE_ENV=production
ENV PORT=80

RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

EXPOSE 80
CMD ["sh", "-c", "npm start -- -p 80"]