# develop stage
FROM node:18-alpine as develop-stage
WORKDIR /app

COPY package*.json ./
COPY quasar.config.ts ./
COPY ./ ./

RUN npm install -g @quasar/cli@latest 
RUN npm install


# build stage
FROM develop-stage as build-stage
RUN quasar build

# production stage
FROM nginx:1.17.5-alpine as production-stage
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
