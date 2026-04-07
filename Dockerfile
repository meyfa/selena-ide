ARG BUILDPLATFORM

# build
FROM --platform=$BUILDPLATFORM node:24.14.1-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run prod

# production
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
