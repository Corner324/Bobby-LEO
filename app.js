import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
} from 'discord-interactions';
import { VerifyDiscordRequest, DiscordRequest } from './utils.js';
import moment from 'moment';
import { check_more_hour } from './queueManager.js';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

function twoDigits(d) {
  return (d < 10 ? '0' : '') + d;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));


async function loop() {
  while (true) {
    await sleep(1 * 60 * 1000); // Интервал проверки: 1 минута

    await DiscordRequest(process.env.DEV_CHANNEL, {
      method: 'POST',
      body: {
        content: `Server Working - ${new Date().getUTCDate()}.${twoDigits(new Date().getUTCMonth() + 1)}.${new Date().getFullYear()} ${twoDigits(new Date().getUTCHours() + 3)}:${twoDigits(new Date().getUTCMinutes())}`
      },
    });

    await check_more_hour();
  }
}

/**
 * Форматирование времени для логирования и интерфейсов
 */
const formatTime = (time) => (time < 10 ? '0' : '') + time;

/**
 * Логирование в удобном формате
 */
const log = (message, level = 'INFO') => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
};

/**
 * Создает embed-лог для начала патруля
 * @param {string} trainee - ID стажера
 * @param {string} trainer - ID наставника
 * @param {number} timestamp - Текущее время в UNIX
 * @returns {Object} Embed-объект
 */
function createPatrolEmbed(trainee, trainer, timestamp) {
  return [
    {
      type: 'rich',
      title: `📋 Patrol Log - ${new Date().getUTCDate()}.${twoDigits(Number(new Date().getUTCMonth()) + 1)}.${new Date().getFullYear()} ${twoDigits(new Date().getUTCHours() + 3)}:${twoDigits(new Date().getUTCMinutes())}`,
      description: `Отчет о патруле со стажером\n\u200BПатруль был начат: <t:${timestamp}:R>`,
      color: 0x5664F1,
      footer: { text: 'О любых проблемах писать - corner324', icon_url: 'https://i.imgur.com/vbsliop.png' },
      fields: [
        { name: '', value: '' },
        { name: 'Стажер', value: `${trainee}`, inline: true },
        { name: 'Наставник', value: `${trainer}`, inline: true },
      ],
    },
  ];
}

/**
 * Создает ветку для патруля и добавляет в нее участников
 * @param {string} channelId - ID лог-канала
 * @param {string} messageId - ID сообщения
 * @param {string} trainerId - ID наставника
 * @param {string} traineeId - ID стажера
 */
async function createPatrolThread(channelId, messageId, trainerId, traineeId) {
  const endpointThread = `${channelId}/${messageId}/threads`;
  const threadName = `🔗 Ветка координации патруля ${new Date().getUTCDate()}-${twoDigits(new Date().getUTCMonth())}`;
  
  // Создаем ветку
  await DiscordRequest(endpointThread, {
    method: 'POST',
    body: {
      name: threadName,
      auto_archive_duration: 60,
      message: { content: 'Обратите внимание, данная ветка сохраняется и доступа после патруля' },
    },
  });

  const threadId = endpointThread.split('/')[4];

  // Добавляем участников в ветку
  await DiscordRequest(`/channels/${threadId}/thread-members/${trainerId}`, { method: 'PUT' });
  await DiscordRequest(`/channels/${threadId}/thread-members/${traineeId}`, { method: 'PUT' });

  // Отправляем сообщение в ветке
  await DiscordRequest(`/channels/${threadId}/messages`, {
    method: 'POST',
    body: {
      content: `👋 Привет, <@${traineeId}> и <@${trainerId}>! Эта ветка была создана специально для вас, тут вы можете предварительно скоординировать свои OOC действия.\n\u200BЖелаю вам продуктивной смены!\n\u200BОднако обратите внимание, данная ветка будет удалена через час!`,
    },
  });
}

/**
 * Получение последнего сообщения из указанного канала
 */
async function getLastMessage(channelId) {
  try {
    const messagesResponse = await DiscordRequest(channelId, { method: 'GET' });
    const messagesData = await messagesResponse.json();
    if (!messagesData?.length) throw new Error('Сообщения в канале не найдены.');

    const lastMessageId = messagesData[0].id;
    const endpoint = `${channelId}/${lastMessageId}`;
    const lastMessageResponse = await DiscordRequest(endpoint, { method: 'GET' });
    return { lastMessage: await lastMessageResponse.json(), endpoint };
  } catch (error) {
    log(`Ошибка при получении последнего сообщения: ${error.message}`, 'ERROR');
    return null;
  }
}

/**
 * Обновление сообщения с новой информацией
 */
async function updateEmbed(endpoint, embeds) {
  await DiscordRequest(endpoint, {
    method: 'PATCH',
    body: { embeds },
  });
  log('Сообщение успешно обновлено.');
}

/**
 * Обновление завершенного патруля
 */
async function finishPatrol(req, res) {
  try {
    const messageId = req.body.message.id;
    const endpoint = `${process.env.LOG_CHANNEL_PD}/${messageId}`;

    // Обновление кнопки
    await DiscordRequest(endpoint, {
      method: 'PATCH',
      body: {
        components: [{
          type: 1,
          components: [{
            style: 1,
            label: 'ПАТРУЛЬ ЗАВЕРШЕН',
            custom_id: 'finish_patrol',
            disabled: true,
            emoji: { name: '🏁' },
            type: 2,
          }],
        }],
      },
    });

    // Получаем embed сообщения
    const logResponse = await DiscordRequest(endpoint, { method: 'GET' });
    const logData = await logResponse.json();

    // Расчет времени
    const startTime = Number(logData.embeds[0].description.split(' ')[7].replace('<t:', '').replace(':R>', ''));
    const elapsedTime = moment().unix() - startTime;
    const duration = new Date(elapsedTime * 1000);

    // Обновляем embed с продолжительностью
    logData.embeds[0].description += `\n\u200BПродолжительность: ${formatTime(duration.getUTCHours())}:${formatTime(duration.getUTCMinutes())}`;
    await updateEmbed(endpoint, [logData.embeds[0]]);

    // Ответ пользователю
    await sendEphemeralMessage(res, `## 📋 Патруль завершен!\n\u200B
**Продолжительность:** ${formatTime(duration.getUTCHours())}:${formatTime(duration.getUTCMinutes())}`);
    log(`Патруль завершен для сообщения ${messageId}.`);
  } catch (error) {
    log(`Ошибка при завершении патруля: ${error.message}`, 'ERROR');
    await sendEphemeralMessage(res, '❌ Произошла ошибка при завершении патруля.');
  }
}

/**
 * Добавляет или удаляет пользователя из очереди наставников
 */
function toggleTrainerInQueue(trainers, userId, username, timestamp) {
  const trainersList = trainers.split('\n\u200B').filter(Boolean);
  if (trainers.includes(`<@${userId}>`)) {
    log(`ФТО ${username} вышел из очереди.`);
    return trainersList.filter(entry => !entry.includes(`<@${userId}>`)).join('\n\u200B');
  }
  log(`ФТО ${username} добавлен в очередь.`);
  trainersList.push(`<@${userId}> <t:${timestamp}:R>`);
  return trainersList.join('\n\u200B');
}

/**
 * Берет первого стажера из очереди
 * @param {string} probations - Строка со списком стажеров
 * @returns {Object} Объект с информацией о стажере и обновленным списком
 */
function takeFirstTrainee(probations) {
  const probationsList = probations.split('\n\u200B').filter(Boolean); // Разбиваем очередь на строки
  if (probationsList.length === 0) {
    return { trainee: null, updatedProbations: '' }; // Очередь пуста
  }

  const trainee = probationsList.shift(); // Берем первого стажера
  return { trainee, updatedProbations: probationsList.join('\n\u200B') }; // Возвращаем обновленный список
}

/**
 * Добавляет или удаляет пользователя из очереди стажеров
 */
function toggleTraineeInQueue(probations, userId, username, timestamp) {
  const probationsList = probations.split('\n\u200B').filter(Boolean); // Разбиваем на строки и убираем пустые
  if (probations.includes(`<@${userId}>`)) {
    log(`Стажер ${username} покинул очередь.`);
    return probationsList.filter(entry => !entry.includes(`<@${userId}>`)).join('\n\u200B'); // Удаляем стажера
  }
  log(`Стажер ${username} добавлен в очередь.`);
  probationsList.push(`<@${userId}> <t:${timestamp}:R>`); // Добавляем стажера с меткой времени
  return probationsList.join('\n\u200B');
}

/**
 * Отправка временного сообщения пользователю
 */
async function sendEphemeralMessage(res, content) {
  await res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.EPHEMERAL,
      content,
    },
  });
}

app.post('/interactions', async (req, res) => {
  const { type, data, member } = req.body;

  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  try {
    if (type === InteractionType.MESSAGE_COMPONENT) {
      const { custom_id: componentId } = data;
      const { id: userId, username } = member.user;

      // Получаем последнее сообщение
      const { lastMessage, endpoint } = await getLastMessage(process.env.MAIN_CHANNEL_PD);
      if (!lastMessage) throw new Error('Не удалось получить сообщение с очередью.');

      const fields = lastMessage.embeds[0].fields;
      let probations = fields[1].value || '';
      let trainers = fields[2].value || '';
      const currentTime = moment().unix();

      // Обработка кнопки "ПАТРУЛЬ ЗАВЕРШЕН"
      if (componentId === 'finish_patrol') {
        return await finishPatrol(req, res);
      }

      // Обработка кнопки "ФТО"
      if (componentId === 'active') {
        trainers = toggleTrainerInQueue(trainers, userId, username, currentTime);
        lastMessage.embeds[0].fields[2].value = trainers;
        await updateEmbed(endpoint, [lastMessage.embeds[0]]);
        await sendEphemeralMessage(res, '✅ Статус наставника обновлен.');
      }

      // Обработка кнопки "СТАЖЕР"
      if (componentId === 'queue') {
        probations = toggleTraineeInQueue(probations, userId, username, currentTime);
        lastMessage.embeds[0].fields[1].value = probations;
        await updateEmbed(endpoint, [lastMessage.embeds[0]]);
        await sendEphemeralMessage(
          res,
          probations.includes(`<@${userId}>`)
            ? '✅ Вы встали в очередь как стажер.'
            : '⏪ Вы вышли из очереди.'
        );
      }

      if (componentId === 'take') {
        if (!probations) {
          log('Попытка взять стажера при пустой очереди.', 'WARN');
          return await sendEphemeralMessage(res, '⏳ В очереди пока нет стажеров.');
        }
      
        try {
          // Удаляем наставника из списка
          const trainersList = trainers.split('\n\u200B').filter(Boolean);
          const updatedTrainers = trainersList.filter(entry => !entry.includes(`<@${userId}>`)).join('\n\u200B');
          trainers = updatedTrainers;
      
          // Берем первого стажера из очереди
          const probationsList = probations.split('\n\u200B').filter(Boolean);
          const trainee = probationsList.shift();
          if (!trainee) throw new Error('Не удалось найти стажера в очереди.');
          probations = probationsList.join('\n\u200B');
      
          const traineeId = trainee.split(' ')[0]; // Извлекаем ID стажера
          const currentTime = moment().unix();
      
          // Обновляем embed с очередью
          lastMessage.embeds[0].fields[1].value = probations;
          lastMessage.embeds[0].fields[2].value = trainers;
          await updateEmbed(endpoint, [lastMessage.embeds[0]]);
      
          // Создаем embed-лог
          const patrolEmbed = createPatrolEmbed(traineeId, `<@${userId}>`, currentTime);
          const logResponse = await DiscordRequest(process.env.LOG_CHANNEL_PD, {
            method: 'POST',
            body: { embeds: patrolEmbed },
          });
      
          const logData = await logResponse.json();
          const logMessageId = logData.id;
      
          // Создаем ветку и добавляем участников
          await createPatrolThread(process.env.LOG_CHANNEL_PD, logMessageId, userId, traineeId.replace(/[<>@]/g, ''));
      
          // Сообщаем наставнику, что он взял стажера
          log(`Наставник ${username} взял стажера ${traineeId}.`);
          await sendEphemeralMessage(res, `✅ Вы взяли стажера ${traineeId}. Удачной смены!`);
        } catch (error) {
          log(`Ошибка при взятии стажера: ${error.message}`, 'ERROR');
          await sendEphemeralMessage(res, '❌ Произошла ошибка при взятии стажера.');
        }
      }
    }
  } catch (error) {
    log(`Ошибка обработки взаимодействия: ${error.message}`, 'ERROR');
    await sendEphemeralMessage(res, '🚨 Произошла непредвиденная ошибка.');
  }
});


app.listen(PORT, '127.0.0.1', async () => {
  console.log('Listening on port', PORT);
  await loop();
});
