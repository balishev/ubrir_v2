# Используем официальный образ Node.js
FROM node:20.12.2

# Устанавливаем рабочую директорию
WORKDIR /usr/src/app

# Копируем package.json и устанавливаем зависимости
COPY package.json ./
RUN npm install

# Копируем остальные файлы проекта
COPY . .

# Указываем переменную окружения для порта
ENV PORT=3001

# Экспонируем порт
EXPOSE ${PORT}

# Запускаем приложение
CMD ["npm", "start"]