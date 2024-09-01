# Usa una imagen base oficial de Node.js de Docker Hub
FROM node:16

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el archivo package.json y package-lock.json (si existe) al directorio de trabajo
COPY package*.json .

# Instala las dependencias de la aplicación
RUN npm install

# Si estás construyendo para producción
# RUN npm ci --only=production

# Copia el resto de los archivos de la aplicación al directorio de trabajo
COPY . .

# Exponer el puerto en el que la aplicación va a correr
EXPOSE 8080

# Define el comando por defecto para ejecutar la aplicación
CMD ["npm", "start"]
