import moment from 'moment';
import { DiscordRequest } from './utils.js'; // Убедись, что этот импорт существует

export async function check_more_hour() {
    console.log('🔍 Начинаю проверку стажеров на превышение времени ожидания...');
    
    try {
      // Получаем последнее сообщение в основном канале
      const messagesResponse = await DiscordRequest(process.env.MAIN_CHANNEL_PD, { method: 'GET' });
      const messagesData = await messagesResponse.json();
  
      if (!messagesData || messagesData.length === 0) {
        console.warn('⚠️ Сообщения в основном канале не найдены.');
        return;
      }
  
      const idLastMessage = messagesData[0].id;
      const endpointToLastMessage = `${process.env.MAIN_CHANNEL_PD}/${idLastMessage}`;
  
      // Получаем подробности последнего сообщения
      const lastMessageResponse = await DiscordRequest(endpointToLastMessage, { method: 'GET' });
      const lastMessageData = await lastMessageResponse.json();
  
      // Извлекаем поля "Стажеры" и "Наставники"
      const probationsField = lastMessageData.embeds?.[0]?.fields?.[1];
      const trainersField = lastMessageData.embeds?.[0]?.fields?.[2];
  
      if (!probationsField) {
        console.warn('⚠️ Поле "Стажеры" отсутствует в embed-сообщении.');
        return;
      }
  
      let probationsList = probationsField.value ? probationsField.value.split('\n\u200B') : [];
  
      // Проверяем стажеров и удаляем тех, кто ждет более 1 часа
      const currentTime = moment().unix();
      let removedCount = 0;
  
      for (let i = probationsList.length - 1; i >= 0; i--) {
        const timeMatch = probationsList[i].match(/<t:(\d+):R>/);
        if (timeMatch) {
          const timeAdded = parseInt(timeMatch[1], 10); // Unix-время добавления
          const timeDiffMinutes = (currentTime - timeAdded) / 60;
  
          if (timeDiffMinutes > 60) { // 60 минут ожидания
            console.log(`⏰ Стажер ${probationsList[i]} был удален из очереди (превышено время ожидания: ${Math.floor(timeDiffMinutes)} минут).`);
            probationsList.splice(i, 1); // Удаляем стажера
            removedCount++;
          }
        } else {
          console.warn(`⚠️ Не удалось распознать время для элемента: "${probationsList[i]}"`);
        }
      }
  
      if (removedCount > 0) {
        // Обновляем поле "Стажеры" в сообщении
        probationsField.value = probationsList.length > 0 ? probationsList.join('\n\u200B') : '\u200B';
  
        await DiscordRequest(endpointToLastMessage, {
          method: 'PATCH',
          body: { embeds: [lastMessageData.embeds[0]] },
        });
  
        console.log(`✅ Проверка завершена. Удалено стажеров: ${removedCount}.`);
      } else {
        console.log('✅ Проверка завершена. Все стажеры в пределах допустимого времени ожидания.');
      }
  
    } catch (error) {
      console.error('❌ Ошибка в функции check_more_hour:', error.message);
    }
  }