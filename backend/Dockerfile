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
COPY ./package-lock.json /app
RUN npm install
COPY ./start.sh /app
COPY ./.env /app
COPY --from=build /app/dist /app
EXPOSE 3000
CMD ["sh", "./start.sh"]