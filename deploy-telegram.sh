#!/bin/bash

# IT Checklist - Telegram Mini App Deployment Script
# Этот скрипт развертывает приложение и регистрирует его в Telegram

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 IT Checklist - Telegram Mini App Deployment${NC}"
echo "=================================================="

# Проверка переменных окружения
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo -e "${RED}❌ Ошибка: TELEGRAM_BOT_TOKEN не установлен${NC}"
    echo "Использование: TELEGRAM_BOT_TOKEN=your_token ./deploy-telegram.sh"
    exit 1
fi

if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  VERCEL_TOKEN не установлен. Используется интерактивный режим.${NC}"
fi

echo -e "${BLUE}📦 Шаг 1: Подготовка приложения${NC}"
pnpm install
pnpm build

echo -e "${BLUE}🌐 Шаг 2: Развертывание на Vercel${NC}"

# Если есть VERCEL_TOKEN, используем его
if [ ! -z "$VERCEL_TOKEN" ]; then
    export VERCEL_TOKEN=$VERCEL_TOKEN
    DEPLOY_OUTPUT=$(vercel --prod --token $VERCEL_TOKEN 2>&1 || true)
else
    DEPLOY_OUTPUT=$(vercel --prod 2>&1 || true)
fi

# Извлечь URL из вывода
APP_URL=$(echo "$DEPLOY_OUTPUT" | grep -oP 'https://[^\s]+' | head -1)

if [ -z "$APP_URL" ]; then
    echo -e "${RED}❌ Не удалось получить URL приложения${NC}"
    echo "Вывод Vercel:"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

echo -e "${GREEN}✅ Приложение развернуто: $APP_URL${NC}"

echo -e "${BLUE}🤖 Шаг 3: Регистрация Mini App в Telegram${NC}"

# Получить информацию о боте
BOT_INFO=$(curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe")
BOT_USERNAME=$(echo "$BOT_INFO" | grep -oP '"username":"?\K[^"]*')

echo "Bot username: @$BOT_USERNAME"

# Установить Web App Info
SET_WEB_APP=$(curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebAppInfo" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$APP_URL\"
  }")

echo "Web App Info response: $SET_WEB_APP"

# Установить главную кнопку меню
SET_MENU_BUTTON=$(curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d "{
    \"menu_button\": {
      \"type\": \"web_app\",
      \"text\": \"📋 Открыть чек-лист\",
      \"web_app\": {
        \"url\": \"$APP_URL\"
      }
    }
  }")

echo "Menu button response: $SET_MENU_BUTTON"

echo -e "${GREEN}✅ Mini App зарегистрирован в Telegram${NC}"

echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Развертывание завершено!${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📱 Откройте Telegram и найдите бота:${NC}"
echo -e "   @$BOT_USERNAME"
echo ""
echo -e "${BLUE}🌐 URL приложения:${NC}"
echo -e "   $APP_URL"
echo ""
echo -e "${BLUE}💡 Советы:${NC}"
echo "   1. Нажмите кнопку 'Открыть чек-лист' в боте"
echo "   2. Приложение должно загрузиться в Telegram"
echo "   3. Если не работает, проверьте консоль браузера (F12)"
echo ""
