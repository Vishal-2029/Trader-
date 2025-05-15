FROM node:lts-alpine AS build-stage

WORKDIR /Trader/web 

COPY package*.json ./

COPY . .

RUN npm run build

EXPOSE 8080

CMD [ "npm", "run", "serve" ]