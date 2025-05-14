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

# Etapa 2: Servir con Nginx
FROM nginx:1.23-alpine

# Crear un usuario no-root para ejecutar nginx
RUN addgroup -g 1001 -S appgroup && \
  adduser -u 1001 -S appuser -G appgroup

# Copiar configuración personalizada de nginx
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build Angular desde la etapa anterior
COPY --from=build-step /app/dist/gifs-app/browser /usr/share/nginx/html

# Establecer los permisos correctos
RUN chown -R appuser:appgroup /usr/share/nginx/html && \
  chmod -R 755 /usr/share/nginx/html && \
  chown -R appuser:appgroup /var/cache/nginx && \
  chown -R appuser:appgroup /var/log/nginx && \
  chown -R appuser:appgroup /etc/nginx/conf.d && \
  touch /var/run/nginx.pid && \
  chown -R appuser:appgroup /var/run/nginx.pid

# Cambiar al usuario no-root
USER appuser

# Exponer el puerto y ejecutar
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
