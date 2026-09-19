# develop stage
FROM node:22-alpine AS develop-stage
WORKDIR /app

COPY package*.json ./
COPY quasar.config.ts ./
COPY ./ ./

RUN npm install -g @quasar/cli@latest 
RUN npm install


# build stage
FROM develop-stage AS build-stage
ARG FINANMAP_API_URL=https://api.devmoreno.com.br/api/
ENV FINANMAP_API_URL=${FINANMAP_API_URL}
RUN quasar build

# production stage
FROM nginx:1.27-alpine AS production-stage
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
