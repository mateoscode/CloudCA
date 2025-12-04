FROM node:18

WORKDIR /app
COPY home.html .
COPY server.js .

EXPOSE 8080
CMD ["node", "server.js"]
