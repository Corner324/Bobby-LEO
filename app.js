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


async function send_eph_message(res, message){
  await res.send({type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: message,
      flags: InteractionResponseFlags.EPHEMERAL,
    }
  });
}

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
              description: "Система очереди для стажеров и их наставников\n" +
                  "\n" +
                  "**СТАЖЕР** – встать/выйти из очереди, используется стажерами.\n" +
                  "**ВЗЯТЬ** – взять первого в очереди стажера, используется ФТО.\n" +
                  "**ФТО** – встать/выйти из очереди, используется ФТО.\n",
              color: 0x5664F1,
              image: {url: "https://i.imgur.com/qFPguLQ.png"},
              footer: {text: 'Цель обучения — научить обходиться без учителя (Э. Хаббард).'},
              //footer: {text: 'О любых проблемах писать - corner324', icon_url: 'https://i.imgur.com/vbsliop.png'},
              author: {name: 'Developed by Corner', icon_url: 'https://i.imgur.com/YPAab26.png'},
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

    const endpoint = mainChannel + '/' + idLastMessage;

    let last_message = await DiscordRequest(endpoint, {method: 'GET'});
    let last_message_data = await last_message.json();
    let fields = last_message_data.embeds[0].fields;
    let probations = fields[1].value;
    let trainers = fields[2].value;

    let actual_time = moment(new Date()).unix()


    if (componentId === 'queue') {

      if (probations.indexOf(`<@${req.body.member.user.id}>`) !== -1) { // Стажер есть в списке
        console.log('В ОЧЕРЕДИ ЕСТЬ СТАЖЕР ТАКОЙ, УДАЛЯЕМ')
        probations = probations.replace(`<@${req.body.member.user.id}>`, "del")
        let index = probations.indexOf(`del`)
        probations = probations.slice(index+20, probations.length)

        await res.send({type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Вы покинули очередь`,
            flags: InteractionResponseFlags.EPHEMERAL,
          }
        });

      } else {

        probations += `<@${req.body.member.user.id}> <t:${actual_time}:R> \n\u200B`;

        console.log('Такого элемента не найдено, добавлен')

        await send_eph_message(res, `Вы встали в очередь как стажер`);
      }

      // Обновляем last_message_data с новыми значениями probations и trainers
      last_message_data.embeds[0].fields[1].value = probations;
      last_message_data.embeds[0].fields[2].value = trainers;

      await DiscordRequest(endpoint, {
        method: 'PATCH',
        body: {
          embeds: [last_message_data.embeds[0]]
        },
      });

    }

    if (componentId === 'active') {


      if (trainers.indexOf(`<@${req.body.member.user.id}>`) !== -1) {

        trainers = trainers.replace(`<@${req.body.member.user.id}>`, "")
        trainers = trainers.replace(`<@${req.body.member.user.id}>`, "del")
        let index = trainers.indexOf(`del`)
        trainers = trainers.slice(index+20, trainers.length)

        await send_eph_message(res, `Вы покинули очередь`);


      } else {

        trainers += `<@${req.body.member.user.id}> <t:${actual_time}:R>\n\u200B`;
        console.log('Такого элемента не найдено, добавлен')

        await send_eph_message(res, `Вы встали в очередь как ФТО`);

      }

      // Обновляем last_message_data с новыми значениями probations и trainers
      last_message_data.embeds[0].fields[1].value = probations;
      last_message_data.embeds[0].fields[2].value = trainers;

      await DiscordRequest(endpoint, {
        method: 'PATCH',
        body: {
          embeds: [last_message_data.embeds[0]]
        },
      });

    }

    if (componentId === 'take') {

      let prob;

      if(probations.length === 0){
        await send_eph_message(res, `В очереди пока нет стажеров, кого вы собрались брать?!`);
        return;
      }

      let endpointLogs = '/channels/1219647959591817237/messages'


      try {
        trainers = trainers.replace(`<@${req.body.member.user.id}>`, "del")
        let index = trainers.indexOf(`del`)
        trainers = trainers.slice(index+20, trainers.length)

        prob = probations.split('\n\u200B')[0] // get first probation
        let count_probation = probations.split('\n\u200B').length

        probations = probations.split('\n\u200B').slice(1,count_probation).join('\n\u200B')

        await send_eph_message(res, `Вы взяли стажера ${prob.split(" ")[0]}, продуктивной смены!`);

      } catch (err) {
        await send_eph_message(res, `Сначала встаньте в очередь!`);
      }

      // Обновляем last_message_data с новыми значениями probations и trainers
      last_message_data.embeds[0].fields[1].value = probations;
      last_message_data.embeds[0].fields[2].value = trainers;

      await DiscordRequest(endpoint, {
        method: 'PATCH',
        body: {
          embeds: [last_message_data.embeds[0]]
        },
      });


      let embed =  [
        {
          type: "rich",
          title: `📋 Patrol Log - ${new Date().getUTCDate()}.${new Date().getUTCMonth()}.${new Date().getFullYear()} ${new Date().getUTCHours()}:${new Date().getUTCMinutes()}`,
          description: `Отчет о патруле со стажером\n\u200BПатруль был начат: <t:${actual_time}:R>`,
          color: 0x5664F1,
          footer: {text: 'О любых проблемах писать - corner324', icon_url: 'https://i.imgur.com/vbsliop.png'},
          fields: [
            {name: '', value: ''},
            {name: 'Стажер', value: `<@${prob.split(" ")[0].replace('<@', "").replace(">","")}>`, inline: true},
            {name: 'Наставник', value: `<@${req.body.member.user.id}>`, inline: true},
            {name: '', value: ``, inline: false},
          ]
        }
      ]



      await DiscordRequest(endpointLogs, {
        method: 'POST',
        body: {
          content: `<@${prob.split(" ")[0].replace('<@', "").replace(">","")}> - <@${req.body.member.user.id}>`,
          embeds: embed
        },
      });

      let messages = await DiscordRequest(endpointLogs, {method: 'GET'});
      let messagesData = await messages.json();
      let idLastMessage = messagesData[0].id

      const endpointLastLogs = endpointLogs + '/' + idLastMessage;

      await DiscordRequest(endpointLastLogs, {
        method: 'PATCH',
        body: {
          content: ''
        },
      });


    }
  }

});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});