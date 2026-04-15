FROM node:24
ENV NODE_ENV=production
RUN ["corepack", "enable"]
COPY ./package.json ./pnpm-lock.yaml ./
RUN ["pnpm", "install", "--frozen-lockfile"]
COPY . .
CMD ["pnpm", "start"]