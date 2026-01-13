# 🤖 Развертывание Telegram Mini App - Пошаговая инструкция

## Быстрый старт (5 минут)

### Вариант 1: Развернуть на Vercel (РЕКОМЕНДУЕТСЯ)

Это самый простой способ - приложение будет доступно онлайн за 2 минуты.

#### Шаг 1: Подготовить код

```bash
# Клонировать репозиторий
git clone https://github.com/Pan1kajkeew/Itl.git
cd Itl

# Установить зависимости
pnpm install

# Собрать приложение
pnpm build
```

#### Шаг 2: Развернуть на Vercel

Вариант А - Через веб-интерфейс:
1. Перейти на https://vercel.com
2. Нажать "New Project"
3. Выбрать репозиторий `Pan1kajkeew/Itl`
4. Нажать "Deploy"
5. Ждать 2-3 минуты

Вариант Б - Через CLI:
```bash
npm install -g vercel
vercel --prod
```

**Результат**: Вы получите URL вроде `https://itl.vercel.app`

#### Шаг 3: Создать Telegram Bot

1. Откройте Telegram и найдите [@BotFather](https://t.me/botfather)
2. Отправьте команду `/newbot`
3. Следуйте инструкциям:
   - Введите имя бота (например, "IT Checklist Bot")
   - Введите username (например, "it_checklist_bot")
4. **Скопируйте токен** (выглядит как `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

#### Шаг 4: Зарегистрировать Mini App

Вариант А - Через BotFather (ПРОЩЕ):
1. Напишите BotFather `/setmenubutton`
2. Выберите вашего бота
3. Выберите "Web App"
4. Введите URL вашего приложения (например, `https://itl.vercel.app`)
5. Введите текст кнопки (например, "Открыть чек-лист")

Вариант Б - Через Telegram Bot API:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebAppInfo" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": <YOUR_USER_ID>,
    "url": "https://your-vercel-app.vercel.app"
  }'
```

#### Шаг 5: Протестировать

1. Откройте Telegram
2. Найдите вашего бота (по username)
3. Нажмите кнопку "Открыть чек-лист"
4. Приложение должно загрузиться в Telegram!

---

### Вариант 2: Развернуть на собственном сервере

Для тех, кто хочет полный контроль.

#### Требования
- Node.js 18+
- npm или pnpm
- Доменное имя (опционально)
- SSL сертификат (обязательно для Telegram)

#### Шаг 1: Подготовить сервер

```bash
# SSH на сервер
ssh user@your-server.com

# Установить Node.js (если еще не установлен)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установить pnpm
npm install -g pnpm

# Клонировать репозиторий
git clone https://github.com/Pan1kajkeew/Itl.git
cd Itl

# Установить зависимости
pnpm install

# Собрать приложение
pnpm build
```

#### Шаг 2: Настроить Nginx

```bash
# Установить Nginx
sudo apt-get install -y nginx

# Создать конфиг
sudo nano /etc/nginx/sites-available/checklist
```

Содержимое конфига:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Редирект на HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL сертификаты (используйте Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Статические файлы
    location / {
        root /home/user/Itl/dist;
        try_files $uri $uri/ /index.html;
    }

    # Кэширование
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Активировать конфиг
sudo ln -s /etc/nginx/sites-available/checklist /etc/nginx/sites-enabled/

# Проверить конфиг
sudo nginx -t

# Перезагрузить Nginx
sudo systemctl restart nginx
```

#### Шаг 3: Настроить SSL (Let's Encrypt)

```bash
# Установить Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Получить сертификат
sudo certbot certonly --nginx -d your-domain.com

# Автоматическое обновление
sudo systemctl enable certbot.timer
```

#### Шаг 4: Запустить приложение

```bash
# Вариант 1: Через PM2 (рекомендуется)
npm install -g pm2
pm2 start "pnpm start" --name "checklist"
pm2 startup
pm2 save

# Вариант 2: Через systemd
sudo nano /etc/systemd/system/checklist.service
```

Содержимое systemd сервиса:
```ini
[Unit]
Description=IT Checklist App
After=network.target

[Service]
Type=simple
User=user
WorkingDirectory=/home/user/Itl
ExecStart=/usr/local/bin/pnpm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable checklist
sudo systemctl start checklist
```

---

## Интеграция с Telegram Bot API

### Отправка отчетов в Telegram

Если вы хотите, чтобы приложение отправляло отчеты прямо в Telegram:

```typescript
// В компоненте приложения
const sendToTelegram = async (message: string) => {
  const botToken = process.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = user.id; // ID пользователя Telegram

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    })
  });
};
```

### Синхронизация через CloudStorage

Telegram предоставляет CloudStorage API для синхронизации данных:

```typescript
// Сохранить данные
if (window.Telegram?.WebApp?.CloudStorage) {
  window.Telegram.WebApp.CloudStorage.setItem('checklist_data', JSON.stringify(data));
}

// Загрузить данные
if (window.Telegram?.WebApp?.CloudStorage) {
  window.Telegram.WebApp.CloudStorage.getItem('checklist_data', (err, value) => {
    if (!err && value) {
      const data = JSON.parse(value);
      // Использовать данные
    }
  });
}
```

---

## Проверка и отладка

### Проверить, работает ли Mini App

```bash
# Проверить доступность приложения
curl -I https://your-domain.com

# Проверить, что это валидный HTML
curl https://your-domain.com | head -20
```

### Логирование ошибок

В консоли Telegram (F12 в десктопной версии):
```javascript
// Проверить, загружен ли Telegram SDK
console.log(window.Telegram);

// Проверить информацию пользователя
console.log(window.Telegram?.WebApp?.initData);

// Отправить логи в консоль
window.Telegram?.WebApp?.onEvent('viewportChanged', () => {
  console.log('Viewport changed');
});
```

---

## Решение проблем

### Приложение не загружается

**Проблема**: Белый экран в Telegram
**Решение**:
1. Проверьте консоль браузера (F12)
2. Убедитесь, что URL доступен: `curl https://your-domain.com`
3. Проверьте, что используется HTTPS (обязательно для Telegram)

### Ошибка "Invalid URL"

**Проблема**: Telegram не принимает URL приложения
**Решение**:
1. URL должен быть с HTTPS
2. URL должен быть доступен из интернета
3. Проверьте, что домен зарегистрирован и работает

### Данные не сохраняются

**Проблема**: После перезагрузки приложения данные исчезают
**Решение**:
1. Проверьте, что LocalStorage не отключен в браузере
2. Используйте Telegram CloudStorage API для синхронизации
3. Проверьте консоль на ошибки

### Медленная загрузка

**Проблема**: Приложение загружается долго
**Решение**:
1. Включите сжатие Gzip в Nginx
2. Используйте CDN (Cloudflare)
3. Оптимизируйте размер бандла: `pnpm build --analyze`

---

## Мониторинг и поддержка

### Мониторинг приложения

```bash
# Проверить статус приложения
pm2 status

# Просмотреть логи
pm2 logs checklist

# Перезагрузить приложение
pm2 restart checklist
```

### Обновление приложения

```bash
# Получить последние изменения
git pull origin main

# Переустановить зависимости
pnpm install

# Собрать новую версию
pnpm build

# Перезагрузить приложение
pm2 restart checklist
```

---

## Дополнительные ресурсы

- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Nginx Configuration](https://nginx.org/en/docs/)

---

**Готово!** 🎉 Ваше приложение должно работать в Telegram.

Если возникли проблемы, проверьте:
1. ✅ URL доступен и использует HTTPS
2. ✅ Telegram Bot создан и токен скопирован
3. ✅ Mini App зарегистрирован в BotFather
4. ✅ Консоль браузера не показывает ошибок

Удачи! 🚀
