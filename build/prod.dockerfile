FROM node:16-alpine3.16

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json", "tsconfig.json", ".env", "./"]

COPY ./src ./src
COPY ./prisma ./prisma

RUN npm ci
RUN npm run generate
RUN npm run build

CMD npm run migrate && npm run start:prod
