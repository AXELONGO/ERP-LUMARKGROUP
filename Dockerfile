FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /usr/src/app

# Copiar configuración de dependencias
COPY package*.json ./

# Instalar solo las dependencias de producción
RUN npm ci --only=production

# Copiar el resto del código (incluyendo credenciales si no están en .dockerignore)
COPY . .

# Hacer ejecutable el script de sincronización de tiempo
RUN chmod +x /usr/src/app/entrypoint.sh

# Exponer el puerto
EXPOSE 3000

# Usar el script de entrada que sincroniza el tiempo y luego levanta el servidor
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
CMD ["node", "server.js"]
