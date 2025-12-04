FROM node:18

WORKDIR /app
COPY home.html .server.js 

EXPOSE 8080
CMD ["node", "server.js"]
