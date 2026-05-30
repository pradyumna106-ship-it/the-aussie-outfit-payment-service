FROM node:20-alpine

WORKDIR /the-aussie-outfit-payment-service

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 5006

CMD ["npm", "start"]