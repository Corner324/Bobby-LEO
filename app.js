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

const sleep = ms => new Promise(r => setTimeout(r, ms));

let prob_list = []

async function check_more_hour(){
  let messages = await DiscordRequest(process.env.MAIN_CHANNEL, {method: 'GET'});
  let messagesData = await messages.json();
  let idLastMessage = messagesData[0].id

  const endpoint = process.env.MAIN_CHANNEL + '/' + idLastMessage;

  let last_message = await DiscordRequest(endpoint, {method: 'GET'});
  let last_message_data = await last_message.json();

  console.log(last_message_data.embeds[0].fields[1].value.split('\n\u200B'))

  let probat;

  if(last_message_data.embeds[0].fields[1].value){
    let probationons = last_message_data.embeds[0].fields[1].value.split('\n\u200B')

    for (let i = 0; i < probationons.length-1; i++) {
      let time_probation = probationons[i].split(' ')[1].replace('<t:',"").replace(':R>','');
      probat = probationons[i].split(' ')[0].replace('<@', "").replace(">","")
      let actual_time = moment(new Date()).unix()// + 60 * 60 * 3;
      console.log('Time left - ', ((actual_time-time_probation) / 60 ))
      if(((actual_time-time_probation) / 60 ) > 60){ 
        probationons.splice(i, 1)
        console.log('СТАЖЕР УДАЛЕН!')
      }
    }

    last_message_data.embeds[0].fields[1].value = probationons.join('\n\u200B');

    await DiscordRequest(endpoint, {
      method: 'PATCH',
      body: {
        embeds: [last_message_data.embeds[0]]
      },
    });


    // await sleep(3000);
    //
    // for (const elem of prob_list) {
    //   if(elem.id === probat){
    //       await elem.member.send({type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    //       data: {
    //         flags: InteractionResponseFlags.EPHEMERAL,
    //         content: 'Прошел 1 час и вы были исключены из очереди, если вы все ещё ищите наставника, то можете вставь в очередь вновь. ',
    //       }
    //     });
    //   }
    //   await sleep(3000);
    // }
  }



}

async function loop(){

    while (true){
      await sleep(1 * 60 * 1000);


      await DiscordRequest("/channels/1220385577724022814/messages", {
        method: 'POST',
        body: {
          content: `Server Working - ${new Date().getUTCDate()}.${twoDigits(new Date().getUTCMonth())}.${new Date().getFullYear()} ${twoDigits(new Date().getUTCHours()+3)}:${twoDigits(new Date().getUTCMinutes())}`
        },
      });

      await check_more_hour()

     // console.log(`Server Working - ${new Date().getUTCDate()}.${twoDigits(new Date().getUTCMonth())}.${new Date().getFullYear()} ${new Date().getUTCHours()+3}:${new Date().getUTCMinutes()}`)
    }

}

function twoDigits(d) {
  return (d < 10 ? '0' : '') + d; // добавляем "0" в начало числа, если это требуется
}

async function send_eph_message(res, message){
  await res.send({type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.EPHEMERAL,
      content: message,
    }
  });

 // await sleep(300);

  let mainChannel = process.env.MAIN_CHANNEL;

  let messages = await DiscordRequest(mainChannel, {method: 'GET'});
  let messagesData = await messages.json();
  let idLastMessage = messagesData[0].id

  const endpoint = mainChannel + '/' + idLastMessage;




  // await DiscordRequest(endpoint, {
  //   method: 'DELETE',
  // });

}

app.get('/test', async function (req, res) {
  res.send('OK!')
})

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

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Hello World!`,
        },
      });

    }



    if (data.name === 'create_ftp_bot') {
      // Send a message with a button


      await DiscordRequest(process.env.MAIN_CHANNEL, {
        method: 'POST',
        body: {
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
              author: {name: 'Developed by Corner', icon_url: 'https://i.imgur.com/LQFHAVJ.png'},
              fields: [
                {name: '', value: ''},
                {name: 'СТАЖЕРЫ', value: '\n\u200B', inline: true},
                {name: 'НАСТАВНИКИ', value: '\n\u200B', inline: true},
              ]
            }
          ]
        },
      });

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
                  "Автокик стажера из очереди через 1 час ожидания\n" +
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
  try{
    if (type === InteractionType.MESSAGE_COMPONENT) {
      // custom_id set in payload when sending message component
      const componentId = data.custom_id;
      // user who clicked button
      const userId = req.body.member.user.id;

      let mainChannel = process.env.MAIN_CHANNEL;

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


      if (componentId === 'finish_patrol') {


        await DiscordRequest(process.env.LOG_CHANNEL + '/' + req.body.message.id, {
          method: 'PATCH',
          body: {
            components: [
              {
                type: 1,
                components: [
                  {
                    style: 1,
                    label: `ПАТРУЛЬ ЗАВЕРШЕН`,
                    custom_id: `finish_patrol`,
                    disabled: true,
                    emoji: {
                      id: null,
                      name: `🏁`
                    },
                    type: 2

                  }
                ],
              }
            ]
          },
        });

        let patrol_log = await DiscordRequest(process.env.LOG_CHANNEL + '/' + req.body.message.id, {method: 'GET'});
        let messagesData = await patrol_log.json();

        console.log(messagesData.embeds[0].description.split(' '))

        let start_patrol_time = Number(messagesData.embeds[0].description.split(' ')[7].replace('<t:',"").replace(':R>',''))
        let time_unix = (moment(new Date()).unix() - start_patrol_time)
        let patrol_time = new Date(time_unix * 1000);


        send_eph_message(res, `## 📋 Патруль успешно завершен!\n\u200B
        **Стажер:** ${messagesData.embeds[0].fields[1].value}
        **Генератор отчетов:** [Ссылка](https://mdc.gtaw.me/generators/view/103)
        **FTP секция форума:** [Ссылка](https://lspd.gtaw.me/viewforum.php?f=947&sid=e524c358347a390926c3da383c039b7d)
        **Время начала патруля:** ${twoDigits(new Date(start_patrol_time * 1000).getUTCHours()+3)}:${twoDigits(new Date(start_patrol_time * 1000).getUTCMinutes())}
        **Продолжительность:** ${twoDigits(patrol_time.getUTCHours())}:${twoDigits(patrol_time.getUTCMinutes())}`)



      }

      if (componentId === 'queue') {

        if (probations.indexOf(`<@${req.body.member.user.id}>`) !== -1) { // Стажер есть в списке

          let probations_list = probations.split('\n\u200B')

          for (let i = 0; i < probations_list.length; i++) {
            if(probations_list[i].indexOf(`<@${req.body.member.user.id}>`) !== -1){ // Есть такой ФТО
              probations_list.splice(i, 1);
              prob_list.splice(i, 1);
            }
          }

          probations = probations_list.join('\n\u200B')

          console.log('В ОЧЕРЕДИ ЕСТЬ СТАЖЕР ТАКОЙ, УДАЛЯЕМ')
          // probations = probations.replace(`<@${req.body.member.user.id}>`, "del")
          // let index = probations.indexOf(`del`)
          // probations = probations.slice(index+20, probations.length)

          await send_eph_message(res, `Вы покинули очередь`);


        } else {

          probations += `<@${req.body.member.user.id}> <t:${actual_time}:R> \n\u200B`;
          prob_list.push({id: req.body.member.user.id, member: res})
          console.log('ТУТ!')
          console.log(prob_list)

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


          let trainers_list = trainers.split('\n\u200B')

          for (let i = 0; i < trainers_list.length; i++) {
            if(trainers_list[i].indexOf(`<@${req.body.member.user.id}>`) !== -1){ // Есть такой ФТО
              trainers_list.splice(i, 1);
            }
          }

          trainers = trainers_list.join('\n\u200B')

          // trainers = trainers.replace(`<@${req.body.member.user.id}>`, "")
          // trainers = trainers.replace(`<@${req.body.member.user.id}>`, "del")
          // let index = trainers.indexOf(`del`)
          // trainers = trainers.slice(index+20, trainers.length)

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

        let endpointLogs = process.env.LOG_CHANNEL;


        try {

          let trainers_list = trainers.split('\n\u200B')

          for (let i = 0; i < trainers_list.length; i++) {
            if(trainers_list[i].indexOf(`<@${req.body.member.user.id}>`) !== -1){ // Есть такой ФТО
              trainers_list.splice(i, 1);
            }
          }

          trainers = trainers_list.join('\n\u200B')

          // trainers = trainers.replace(`<@${req.body.member.user.id}>`, "del")
          // let index = trainers.indexOf(`del`)
          // trainers = trainers.slice(index+20, trainers.length)

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
            title: `📋 Patrol Log - ${new Date().getUTCDate()}.${twoDigits(new Date().getUTCMonth())}.${new Date().getFullYear()} ${new Date().getUTCHours()+3}:${new Date().getUTCMinutes()}`,
            description: `Отчет о патруле со стажером\n\u200BПатруль был начат: <t:${actual_time}:R>`,
            color: 0x5664F1,
            footer: {text: 'О любых проблемах писать - corner324', icon_url: 'https://i.imgur.com/vbsliop.png'},
            fields: [
              {name: '', value: ''},
              {name: 'Стажер', value: `${prob.split(" ")[0]}`, inline: true},
              {name: 'Наставник', value: `<@${req.body.member.user.id}>`, inline: true},
              {name: '', value: ``, inline: false},
            ]
          }
        ]



        await DiscordRequest(endpointLogs, {
          method: 'POST',
          body: {
            //content: `<@${prob.split(" ")[0].replace('<@', "").replace(">","")}> - <@${req.body.member.user.id}>`,
            embeds: embed,
            components: [
              {
                type: 1,
                components: [
                  {
                    style: 3,
                    label: `ЗАВЕРШИТЬ ПАТРУЛЬ`,
                    custom_id: `finish_patrol`,
                    disabled: false,
                    emoji: {
                      id: null,
                      name: `✅`
                    },
                    type: 2

                  }
                ],
              }
              ]
          },
        });

        let messages = await DiscordRequest(endpointLogs, {method: 'GET'});
        let messagesData = await messages.json();
        let idLastMessage = messagesData[0].id

        const endpointLastLogs = endpointLogs + '/' + idLastMessage;

        // await DiscordRequest(endpointLastLogs, {
        //   method: 'PATCH',
        //   body: {
        //     content: ''
        //   },
        // });


        await DiscordRequest(endpointLastLogs + '/threads', {
          method: 'POST',
          body: {
            name: `🔗 Ветка координации патруля ${new Date().getUTCDate()}-${twoDigits(new Date().getUTCMonth())}`,
            auto_archive_duration: 60,
            message: {content: 'Обратите внимание, данная ветка будет удалена через час!'}
          },
        });

        await DiscordRequest(`/channels/${endpointLastLogs.split('/')[4]}/thread-members/` + req.body.member.user.id, {
          method: 'PUT',
        });

        await DiscordRequest(`/channels/${endpointLastLogs.split('/')[4]}/thread-members/` + prob.split(" ")[0].replace('<@', "").replace(">",""), {
          method: 'PUT',
        });

        await DiscordRequest(`/channels/${endpointLastLogs.split('/')[4]}/messages`, {
          method: 'POST',
          body: {
            content: `👋 Привет, ${prob.split(" ")[0]} и <@${req.body.member.user.id}>! Эта ветка была создана специально для вас, тут вы можете предварительно скокординировать свои OOC действия.\n\u200BЖелаю вам продуктивной смены!\n\u200BОднако обратите внимание, данная ветка будет удалена через час!`,
          }

        });

      }



    }
  } catch (e){

    let actual_time = moment(new Date()).unix()

    // await DiscordRequest("/channels/1220385577724022814/messages", {
    //   method: 'POST',
    //   body: {
    //     content: `<@${244053499179040768}> <t:${actual_time}:R>\n\u200B` + e,
    //   }
    // })


      console.log(e)

      await res.send({type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.EPHEMERAL,
          content: '🚨 На сервере произошла непредвиденная ошибка, мы уже работаем над её исправлением. ',
        }
      });

  }


});

app.listen(PORT, async () => {
  console.log('Listening on port', PORT);
  await loop();
});
