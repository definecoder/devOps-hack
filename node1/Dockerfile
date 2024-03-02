# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

COPY . .

RUN bash -c "npm install"

EXPOSE 7070

CMD ["npm", "start"]
