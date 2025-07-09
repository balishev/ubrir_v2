let API_KEY = null;
let chatHistory = [];

const logDiv = document.getElementById('log');
const chatBody = document.getElementById('chatBody');
const chatWindow = document.getElementById('chatWindow');
const errorDiv = document.getElementById('error');

function addLog(message) {
    const timestamp = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Paris' });
    const logMessage = `[${timestamp}] ${message}\n`;
    logDiv.textContent += logMessage;
    console.log(logMessage);
    logDiv.scrollTop = logDiv.scrollHeight;
}

function toggleChat() {
    chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
    if (chatWindow.style.display === 'flex') {
        chatBody.scrollTop = chatBody.scrollHeight;
        addLog('Чат открыт пользователем.');
    } else {
        addLog('Чат закрыт пользователем.');
    }
}

function addMessageToChat(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', role);
    messageDiv.textContent = content;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
    chatHistory.push({ role, content });
}

// Загрузка API-ключа с сервера с повторными попытками
async function loadApiKey(retries = 3, delay = 1000) {
    addLog('Попытка загрузки API-ключа с сервера (порт 3001)...');
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch('http://localhost:3001/get-api-key', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
            }
            const data = await response.json();
            if (!data.apiKey) {
                throw new Error('API-ключ не найден в ответе сервера.');
            }
            API_KEY = data.apiKey;
            addLog('API-ключ успешно загружен.');
            return true;
        } catch (error) {
            addLog(`Ошибка загрузки API-ключа (попытка ${i + 1}/${retries}): ${error.message}`);
            if (i < retries - 1) {
                addLog(`Повторная попытка через ${delay} мс...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    errorDiv.textContent = 'Не удалось загрузить API-ключ. Проверьте сервер (порт 3001) и повторите позже.';
    addLog('Не удалось загрузить API-ключ после всех попыток.');
    return false;
}

// Инициализация
loadApiKey();

async function getResponse() {
    const userInput = document.getElementById('userInput').value.trim();
    errorDiv.textContent = '';
    addLog(`Пользователь задал вопрос: "${userInput}"`);

    if (!userInput) {
        errorDiv.textContent = 'Пожалуйста, введите финансовый вопрос.';
        addLog('Ошибка: Пользователь ввел пустой запрос.');
        return;
    }

    addMessageToChat('user', userInput);
    document.getElementById('userInput').value = '';

    if (!API_KEY) {
        const loaded = await loadApiKey();
        if (!loaded) {
            errorDiv.textContent = 'API-ключ не загружен. Проверьте сервер.';
            addLog('Ошибка: API-ключ не доступен.');
            return;
        }
    }

    try {
        addLog('Отправка запроса к API DeepSeek...');
        const apiUrl = 'https://api.deepseek.com/v1/chat/completions';
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
            'Accept': 'application/json'
        };
        const payload = {
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'system',
                    content: 'Вы финансовый ИИ-консультант. Предоставляйте точные и полезные финансовые советы на русском языке.'
                },
                {
                    role: 'user',
                    content: userInput
                }
            ],
            temperature: 0.7,
            max_tokens: 512
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        addLog('Получен ответ от API DeepSeek.');
        addLog(`Содержимое ответа: ${aiResponse.substring(0, 100)}...`);
        addMessageToChat('assistant', aiResponse);
    } catch (error) {
        console.error('Ошибка:', error);
        errorDiv.textContent = 'Произошла ошибка при получении ответа. Проверьте ваш API-ключ и попробуйте снова.';
        addLog(`Ошибка во время API-запроса: ${error.message}`);
    }
}