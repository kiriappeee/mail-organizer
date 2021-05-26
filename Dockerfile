FROM node:15-alpine
WORKDIR /src
COPY ./webapp/ /src/webapp/
COPY package.json /src
COPY package-lock.json /src
ENV NODE_ENV production
RUN npm install
EXPOSE 3000
CMD node webapp/app.js
