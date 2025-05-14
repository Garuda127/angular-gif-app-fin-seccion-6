# Etapa 1: Build de Angular
FROM node:20-alpine AS build-step

WORKDIR /app

# Copiar solo los archivos de dependencias para aprovechar la caché
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Establecer variables de entorno para producción
ENV NODE_ENV=production

# Construir la aplicación
RUN npm run build --prod

# Eliminar archivos innecesarios para reducir el tamaño
RUN rm -rf node_modules


