import requests
import asyncio
from telegram import Bot

# Замените на ваш токен и chat_id
telegram_token = '7666759289:AAH_xctdYEI5LVWwvHjvrWE09nD2VKRvyF8'
chat_id = '663095878'

# URL вашего бота
bot_url = 'https://bobbyleo.ru'


async def send_telegram_message(message):
    bot = Bot(token=telegram_token)
    await bot.send_message(chat_id=chat_id, text=message)

async def check_bot():
    try:
        response = requests.get(bot_url)
        if response.status_code != 200:
            await send_telegram_message("Ошибка! Бот не доступен.")
    except requests.exceptions.RequestException:
        await send_telegram_message("Ошибка! Не удалось подключиться к боту.")

async def main():
    while True:
        await check_bot()
        await asyncio.sleep(300)  # Подождать 5 минут

# Запуск основного цикла
asyncio.run(main())
