FROM node:16.20.0

COPY package.json /app/
COPY app /app/

WORKDIR /app

RUN npm install
RUN npm run transpile:docker

CMD ['node', './dist-server/index.js']