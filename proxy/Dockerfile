FROM node:16-alpine

# Dependencies
RUN apk add --update bash git

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY ./proxy/package*.json ./

USER node
RUN npm install
COPY --chown=node:node ./proxy .
EXPOSE $PORT
CMD [ "node", "app.js" ]