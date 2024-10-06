FROM node:lts-slim

WORKDIR /app
COPY . .
CMD yarn install && yarn build

ENTRYPOINT ["yarn", "run", "start:staging"]