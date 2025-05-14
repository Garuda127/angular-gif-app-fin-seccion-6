# Etapa 1: Build Angular
FROM node:20-alpine AS build-step

WORKDIR /app

# Copiamos solo los archivos de dependencias primero para aprovechar la caché
COPY package.json package-lock.json ./
RUN npm ci

# Copiamos el resto del código fuente
COPY . .

# Build de producción
RUN docker build --platform=linux/arm64 -t gifs-angular .
RUN npm run build --prod


# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiamos los archivos generados en el build
COPY --from=build-step /app/dist/gifs-app/browser /usr/share/nginx/html

# Configuración personalizada de Nginx para soporte SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Puerto que expone Nginx dentro del contenedor
EXPOSE 80

# Inicia Nginx
CMD ["nginx", "-g", "daemon off;"]
