const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors({ origin: '*' })); // Разрешить все источники для тестов
app.use(express.json());

app.get('/get-api-key', (req, res) => {
    if (!process.env.DEEPSEEK_API_KEY) {
        return res.status(500).json({ error: 'API-ключ не найден в .env' });
    }
    res.json({ apiKey: process.env.DEEPSEEK_API_KEY });
});

app.use(express.static('public'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});