FROM node:20 as dependencies
WORKDIR usr/src/app
COPY package*.json  ./
CMD npm install
COPY . .
CMD npm run build
EXPOSE 3000
CMD ["npm", "start"]
