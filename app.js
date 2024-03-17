import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';


// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: 'hello world ' + getRandomEmoji(),
        },
      });
    }

    if (name === 'goods') {

      let words = "Активный Амбициозный Авантюрный Благородный Буйный Влиятельный Внимательный Восхитительный Воодушевляющий Всегда уверенный в себе Вдумчивый Грациозный Героический Дерзкий Дисциплинированный Живой Загадочный Заботливый Задумчивый Игривый Интригующий Интеллигентный Инициативный Интеллектуальный Искренний Искусный Коммуникабельный Легкий в общении Ловкий Мужественный Мотивирующий Надежный Настойчивый Непреклонный Непримиримый Непоколебимый Неуправляемый Незабываемый Обаятельный Одаренный Оптимистичный Оригинальный Остроумный Очаровательный Отзывчивый Понимающий Поразительный Потрясающий Передовой Преданный Предприимчивый Прагматичный Проницательный Решительный Рациональный Сексуальный Сильный Смелый Собранный Сострадательный Спокойный Стойкий Стратегический Талантливый Твердый Творческий Трудолюбивый Уверенный в себе Умный Уникальный Уравновешенный Успешный Философский Харизматичный Храбрый Целеустремленный Честный Энергичный Эрудированный".split(" ")
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          // Math.random() * (1 - words.length-1) + 1
          content: `<@${req.body.member.user.id}> самый ${words[Math.floor(Math.random()*words.length)].toLowerCase()}!`
        },
      });
    }


    if (data.name === 'button') {
      // Send a message with a button
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'A message with a button',
          // Buttons are inside of action rows
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  // Value for your app to identify the button
                  custom_id: 'my_button',
                  label: 'Взять ФТО',
                  style: ButtonStyleTypes.PRIMARY,

                },
                {
                  type: MessageComponentTypes.BUTTON,
                  // Value for your app to identify the button
                  custom_id: 'my_button2',
                  label: 'Взять стажера',
                  style: ButtonStyleTypes.SECONDARY,

                },
                {
                  type: MessageComponentTypes.BUTTON,
                  // Value for your app to identify the button
                  custom_id: 'my_button3',
                  label: 'Взять в рот',
                  style: ButtonStyleTypes.SUCCESS,

                },
              ],
            },
          ],
        },
      });
    }

    if (data.name === 'list') {
      // Send a message with a button
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data:
            {
              "content": "Mason is looking for new arena partners. What classes do you play?",
              "components": [
                {
                  "type": 1,
                  "components": [
                    {
                      "type": 3,
                      "custom_id": "class_select_1",
                      "options":[
                        {
                          "label": "Rogue",
                          "value": "rogue",
                          "description": "Sneak n stab",
                          "emoji": {
                            "name": "rogue",
                            "id": "625891304148303894"
                          }
                        },
                        {
                          "label": "Mage",
                          "value": "mage",
                          "description": "Turn 'em into a sheep",
                          "emoji": {
                            "name": "mage",
                            "id": "625891304081063986"
                          }
                        },
                        {
                          "label": "Priest",
                          "value": "priest",
                          "description": "You get heals when I'm done doing damage",
                          "emoji": {
                            "name": "priest",
                            "id": "625891303795982337"
                          }
                        }
                      ],
                      "placeholder": "Choose a class",
                      "min_values": 1,
                      "max_values": 3
                    }
                  ]
                }
              ]
            }
      });
    }

    if (data.name === 'select') {
      // Send a message with a button
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '',
          // Selects are inside of action rows
          components: [
            {
              type: 1,
              components: [
                {
                  style: 1,
                  label: `Взять FTO`,
                  custom_id: `dev_button_id`,
                  disabled: false,
                  emoji: {
                    id: null,
                    name: `👴🏻`
                  },
                  type: 2
                },
                {
                  style: 3,
                  label: `Взять стажера`,
                  custom_id: `techie_button_id`,
                  disabled: false,
                  emoji: {
                    id: null,
                    name: `👶🏻`
                  },
                  type: 2
                }
              ]
            }
          ],
          embeds: [
            {
              type: "rich",
              title: `FIELD TRAINING PROGRAM QUEUE`,
              description: "Система очереди для FTO и стажеров. Стажер автоматически покидает очередь через час ожидания, если FTO не был найден.\n" +
                  "\n" +
                  "QUEUE – встать/выйти из очереди, используется стажерами.\n" +
                  "TAKE – взять первого в очереди стажера, используется FTO.\n" +
                  "ACTIVE – обозначить себя доступным и получать уведомления, используется FTO.\n" +
                  "⟳ – обновляет очередь.",
              color: 0x5664F1,
              image: {url: "https://i.imgur.com/9PUjV76.png"},
              footer: {text: 'Цель обучения — научить обходиться без учителя (Э. Хаббард).'},
              author: {name: 'FTP Coordinator', icon_url: 'https://i.imgur.com/JKzAl4J.png'}
            }
          ]
        },
      });
    }

    if (data.name === 'input') {
      // Send a message with a button

      return res.send({
        type: InteractionResponseType.APPLICATION_MODAL,
        data: {
          "content": "Test",
          "embeds": [{
            "title": "Hello, Embed!",
            "description": "This is an embedded message."
          }]}

      });
    }

    // "challenge" command
    if (name === 'challenge' && id) {
      const userId = req.body.member.user.id;
      // User's object choice
      const objectName = req.body.data.options[0].value;

      // Create active game using message ID as the game ID
      activeGames[id] = {
        id: userId,
        objectName,
      };

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: `Rock papers scissors challenge from <@${userId}>`,
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  // Append the game ID to use later on
                  custom_id: `accept_button_${req.body.id}`,
                  label: 'Accept',
                  style: ButtonStyleTypes.PRIMARY,
                },
              ],
            },
          ],
        },
      });
    }
  }

  /**
   * Handle requests from interactive components
   * See https://discord.com/developers/docs/interactions/message-components#responding-to-a-component-interaction
   */
  if (type === InteractionType.MESSAGE_COMPONENT) {
    // custom_id set in payload when sending message component
    const componentId = data.custom_id;

    if (componentId.startsWith('accept_button_')) {
      // get the associated game ID
      const gameId = componentId.replace('accept_button_', '');
      // Delete message with token in request body
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
      try {
        await res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'What is your object of choice?',
            // Indicates it'll be an ephemeral message
            flags: InteractionResponseFlags.EPHEMERAL,
            components: [
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.STRING_SELECT,
                    // Append game ID
                    custom_id: `select_choice_${gameId}`,
                    options: getShuffledOptions(),
                  },
                ],
              },
            ],
          },
        });
        // Delete previous message
        await DiscordRequest(endpoint, { method: 'DELETE' });
      } catch (err) {
        console.error('Error sending message:', err);
      }
    } else if (componentId.startsWith('select_choice_')) {
      // get the associated game ID
      const gameId = componentId.replace('select_choice_', '');

      if (activeGames[gameId]) {
        // Get user ID and object choice for responding user
        const userId = req.body.member.user.id;
        const objectName = data.values[0];
        // Calculate result from helper function
        const resultStr = getResult(activeGames[gameId], {
          id: userId,
          objectName,
        });

        // Remove game from storage
        delete activeGames[gameId];
        // Update message with token in request body
        const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

        try {
          // Send results
          await res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: resultStr },
          });
          // Update ephemeral message
          await DiscordRequest(endpoint, {
            method: 'PATCH',
            body: {
              content: 'Nice choice ' + getRandomEmoji(),
              components: [],
            },
          });
        } catch (err) {
          console.error('Error sending message:', err);
        }
      }
    }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});