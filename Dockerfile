FROM node:22-slim

WORKDIR /app

COPY package*.json ./

RUN apt-get update && apt-get upgrade -y && npm install

COPY . .

CMD ["npm", "start"]