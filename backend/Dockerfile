FROM node:20-alpine as build

WORKDIR /app
COPY ./package.json /app
COPY ./package-lock.json /app
RUN npm install
COPY . /app
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY ./package.json /app
COPY ./start.sh /app
COPY ./package-lock.json /app
RUN npm install
COPY ./.env /app
COPY --from=build /app/dist /app
EXPOSE 3000
CMD ["./start.sh"]