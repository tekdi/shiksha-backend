FROM node:20 as dependencies
WORKDIR usr/src/app
COPY package*.json  ./
RUN npm run install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
