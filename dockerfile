FROM node:lts-slim

WORKDIR /app
COPY . .
RUN yarn install && yarn build

EXPOSE 3456
ENTRYPOINT ["yarn", "run", "start:staging"]