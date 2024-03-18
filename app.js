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

import moment from 'moment';


/*
  TODO: Кик через время []
  Дополнительный лог []


 */


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
    const { name, user } = data;

    // "test" command
    if (name === 'test') {


      let currentDate = new Date();

      // console.log(currentDate.getFullYear());
      // console.log(currentDate.getMonth());
      // console.log(currentDate.getDate());
      // console.log(currentDate.getHours());
      // console.log(currentDate.getMinutes());
      // console.log(currentDate.getSeconds());

      let mainChannel = '/channels/1218918494280745101/messages'

      let messages = await DiscordRequest(mainChannel, {method: 'GET'});

      let messagesData = await messages.json();

      let idLastMessage = messagesData[0]



      //console.log(req.body)
      // console.log(`${currentDate.getDate()}/${currentDate.getMonth()}/${currentDate.getFullYear()}`)
      // console.log(currentDate)

      console.log(idLastMessage.embeds[0].fields)




      let result = Math.floor(Date.parse(idLastMessage)/1000)


      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `<t:${moment(idLastMessage).unix()}:R>`,
        },
      });
    }

    if (name === 'goods') {


      console.log('ОТВЕТ:')
      console.log(prom.id)

      let words = "Активный Амбициозный Авантюрный Благородный Буйный Влиятельный Внимательный Восхитительный Воодушевляющий Всегда уверенный в себе Вдумчивый Грациозный Героический Дерзкий Дисциплинированный Живой Загадочный Заботливый Задумчивый Игривый Интригующий Интеллигентный Инициативный Интеллектуальный Искренний Искусный Коммуникабельный Легкий в общении Ловкий Мужественный Мотивирующий Надежный Настойчивый Непреклонный Непримиримый Непоколебимый Неуправляемый Незабываемый Обаятельный Одаренный Оптимистичный Оригинальный Остроумный Очаровательный Отзывчивый Понимающий Поразительный Потрясающий Передовой Преданный Предприимчивый Прагматичный Проницательный Решительный Рациональный Сексуальный Сильный Смелый Собранный Сострадательный Спокойный Стойкий Стратегический Талантливый Твердый Творческий Трудолюбивый Уверенный в себе Умный Уникальный Уравновешенный Успешный Философский Харизматичный Храбрый Целеустремленный Честный Энергичный Эрудированный".split(" ")
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          // Math.random() * (1 - words.length-1) + 1
          content: `<@${req.body.member.user.id}> самый ${words[Math.floor(Math.random() * words.length)].toLowerCase()}!`
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
                  label: `СТАЖЕР`,
                  custom_id: `queue`,
                  disabled: false,
                  emoji: {
                    id: null,
                    name: `👶🏻`
                  },
                  type: 2
                },
                {
                  style: 2,
                  label: `ВЗЯТЬ`,
                  custom_id: `take`,
                  disabled: false,
                  emoji: {
                    id: null,
                    name: `🤝`
                  },
                  type: 2
                },
                {
                  style: 3,
                  label: `ФТО`,
                  custom_id: `active`,
                  disabled: false,
                  emoji: {
                    id: null,
                    name: `👴🏻`
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
                  "**СТАЖЕР** – встать/выйти из очереди, используется стажерами.\n" +
                  "**ВЗЯТЬ** – взять первого в очереди стажера, используется FTO.\n" +
                  "**ФТО** – обозначить себя доступным и получать уведомления, используется FTO.\n",
              color: 0x5664F1,
              //image: {url: "https://i.imgur.com/p1wzoEw.png"},
               footer: {text: 'Цель обучения — научить обходиться без учителя (Э. Хаббард).'},
              //footer: {text: 'О любых проблемах писать - corner324', icon_url: 'https://i.imgur.com/vbsliop.png'},
              author: {name: 'FTP Coordinator', icon_url: 'https://i.imgur.com/JKzAl4J.png'},
              fields: [
                {name: '', value: ''},
                {name: 'СТАЖЕРЫ', value: '\n\u200B', inline: true},
                {name: 'НАСТАВНИКИ', value: '\n\u200B', inline: true},
              ]
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
    // user who clicked button
    const userId = req.body.member.user.id;

    let mainChannel = '/channels/1218918494280745101/messages'

    let messages = await DiscordRequest(mainChannel, {method: 'GET'});

    let messagesData = await messages.json();

    let idLastMessage = messagesData[0].id


    if (componentId === 'queue') {

      const fromEndpoint = mainChannel + '/' + idLastMessage;


      let first_res = await DiscordRequest(fromEndpoint, {method: 'GET'});

      let result = await first_res.json();


      if (result.embeds[0].fields[1].value.indexOf(`<@${req.body.member.user.id}>`) !== -1) {


        result.embeds[0].fields[1].value = result.embeds[0].fields[1].value.replace(`<@${req.body.member.user.id}>`, "del")
        let index = result.embeds[0].fields[1].value.indexOf(`del`)

        result.embeds[0].fields[1].value = result.embeds[0].fields[1].value.slice(index+20, result.embeds[0].fields[1].value.length)




        await res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Вы покинули очередь`,
            // Indicates it'll be an ephemeral message
            flags: InteractionResponseFlags.EPHEMERAL,
          }
        });

      } else {

        let currentDate = new Date();
        let actual_time = moment(currentDate).unix()


        result.embeds[0].fields[1].value += `<@${req.body.member.user.id}> <t:${actual_time}:R> \n\u200B`;
        //result.embeds[0].fields[1].value += "123 \n\u200B\n\u200B\n\u200B\n";
        console.log('СТАЛО:')
        console.log(`1 ${result.embeds[0].fields[1].value} 2`)
        console.log('Такого элемента не найдено, добавлен')

        await res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Вы встали в очередь как стажер`,
            // Indicates it'll be an ephemeral message
            flags: InteractionResponseFlags.EPHEMERAL,
          }
        });

      }


      const ToEndpoint = mainChannel + '/' + idLastMessage;


      //console.log(result.embeds[0].fields.at(0))


      await DiscordRequest(ToEndpoint, {
        method: 'PATCH',
        body: {
          embeds: result.embeds
        },
      });


    }

    if (componentId === 'active') {

      const fromEndpoint = mainChannel + '/' + idLastMessage;

      let first_res = await DiscordRequest(fromEndpoint, {method: 'GET'});

      let result = await first_res.json();

      const ToEndpoint = mainChannel + '/' + idLastMessage;


      if (result.embeds[0].fields[2].value.indexOf(`<@${req.body.member.user.id}>`) !== -1) {

        result.embeds[0].fields[2].value = result.embeds[0].fields[2].value.replace(`<@${req.body.member.user.id}>`, "")



        result.embeds[0].fields[2].value = result.embeds[0].fields[2].value.replace(`<@${req.body.member.user.id}>`, "del")

        let index = result.embeds[0].fields[2].value.indexOf(`del`)
        result.embeds[0].fields[2].value = result.embeds[0].fields[2].value.slice(index+20, result.embeds[0].fields[2].value.length)

        await res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Вы покинули очередь`,
            // Indicates it'll be an ephemeral message
            flags: InteractionResponseFlags.EPHEMERAL,
          }
        });

      } else {

        let currentDate = new Date();
        let actual_time = moment(currentDate).unix()

        result.embeds[0].fields[2].value += `<@${req.body.member.user.id}> <t:${actual_time}:R>\n\u200B`;
        console.log('Такого элемента не найдено, добавлен')

        await res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Вы встали в очередь как ФТО`,
            // Indicates it'll be an ephemeral message
            flags: InteractionResponseFlags.EPHEMERAL,
          }
        });

      }

      await DiscordRequest(ToEndpoint, {
        method: 'PATCH',
        body: {
          embeds: result.embeds
        },
      });


    }

    if (componentId === 'take') {

      const fromEndpoint = mainChannel + '/' + idLastMessage;

      let first_res = await DiscordRequest(fromEndpoint, {method: 'GET'});

      let result = await first_res.json();

      const ToEndpoint = mainChannel + '/' + idLastMessage;

      let currentDate = new Date();
      let actual_time = moment(currentDate).unix()



      if(result.embeds[0].fields[1].value.length === 0){
        await res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `В очереди пока нет стажеров, кого вы собрались брать?!`,
            // Indicates it'll be an ephemeral message
            flags: InteractionResponseFlags.EPHEMERAL,
          }
        });
        return;
      }

      try {
        result.embeds[0].fields[2].value = result.embeds[0].fields[2].value.replace(`<@${req.body.member.user.id}>`, "del")
        let index = result.embeds[0].fields[2].value.indexOf(`del`)
        result.embeds[0].fields[2].value = result.embeds[0].fields[2].value.slice(index+20, result.embeds[0].fields[2].value.length)

        let prob = result.embeds[0].fields[1].value.split('\n\u200B')[0] // get first probation

        console.log('ТЕПЕРЬ:')
        console.log(result.embeds[0].fields[1].value)

        let count_probation = result.embeds[0].fields[1].value.split('\n\u200B').length

        result.embeds[0].fields[1].value = result.embeds[0].fields[1].value.split('\n\u200B').slice(1,count_probation).join('\n\u200B')
        //

        await res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Вы взяли стажера ${prob.split(" ")[0]}, продуктивной смены!`,
            // Indicates it'll be an ephemeral message
            flags: InteractionResponseFlags.EPHEMERAL,
          }
        });
      } catch (err) {
        await res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Сначала встаньте в очередь!`,
            // Indicates it'll be an ephemeral message
            flags: InteractionResponseFlags.EPHEMERAL,
          }
        });
      }


      await DiscordRequest(ToEndpoint, {
        method: 'PATCH',
        body: {
          embeds: result.embeds
        },
      });
    }
  }




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