FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY server.js ./

# Створимо файл .env для реалістичності (атакуючий може шукати його)
RUN echo "DB_PASS=Csms@2024!Secure" > .env
RUN echo "INTERNAL_IP=192.168.20.20" >> .env

EXPOSE 8080

CMD [ "npm", "start" ]