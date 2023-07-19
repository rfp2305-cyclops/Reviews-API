# BASE IMG - node
FROM node:19-alpine

# copy to container/app
COPY package.json /app/
COPY app /app/app/
COPY .env /app/

# change / cd into container/app
WORKDIR /app

# install npm deps into container
RUN npm install
RUN npm run clean
RUN npm run transpile
RUN ls

# run the server
CMD ["node", "dist-server/index.js"]