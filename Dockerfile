FROM node:20 as dependencies
WORKDIR usr/src/app
COPY package*.json  ./
RUN yarn install
COPY . .
RUN yarn run build
EXPOSE 3000
CMD ["npm", "start"]
