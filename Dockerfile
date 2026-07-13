# Etapa Base
FROM node:20-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

# Etapa Desarrollo
FROM base AS dev
RUN npm install
COPY . .
RUN chmod +x /usr/src/app/entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
CMD ["node", "--watch", "server.js"]

# Etapa Producción
FROM base AS production
RUN npm ci --only=production
COPY . .
RUN chmod +x /usr/src/app/entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
CMD ["node", "server.js"]
