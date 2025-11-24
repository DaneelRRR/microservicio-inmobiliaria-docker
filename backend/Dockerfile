# Imagen Base: version ligera de Node (Alpine Linux)
FROM node:18-alpine

# Directorio de Trabajo
WORKDIR /app

# Optimizacion de Cache
COPY package.json .

# Instalacion de dependencias
RUN npm install

# Copia del codigo fuente
COPY . .

# Puerto expuesto
EXPOSE 3000

# Comando de Arranque
CMD ["node", "src/index.js"]