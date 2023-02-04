FROM node:17.8-slim as BASEIMAGE

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY . .
RUN npm run prebuild && npm run build && npm prune --production

FROM node:17.8-slim

RUN npm i -g pm2

COPY --from=BASEIMAGE /app/package.json /app/package.json
COPY --from=BASEIMAGE /app/dist /app/dist
COPY --from=BASEIMAGE /app/node_modules /app/node_modules

EXPOSE 3100

CMD [ "pm2-runtime", "node", "--", "/app/dist/main" ]