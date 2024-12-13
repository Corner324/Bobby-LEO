import 'dotenv/config';
import fetch from 'node-fetch';
import { verifyKey } from 'discord-interactions';

export function VerifyDiscordRequest(clientKey) {
  return function (req, res, buf, encoding) {
    try {
      const signature = req.get('X-Signature-Ed25519');
      const timestamp = req.get('X-Signature-Timestamp');

      if (!signature || !timestamp) {
        res.status(401).send('Missing signature headers');
        return;
      }

      const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);

      if (!isValidRequest) {
        res.status(401).send('Bad request signature');
        return;
      }
    } catch (error) {
      console.error('Signature verification failed:', error);
      res.status(401).send('Invalid request');
    }
  };
}

export async function DiscordRequest(endpoint, options) {
  const url = 'https://discord.com/api/v10/' + endpoint;

  if (options.body) options.body = JSON.stringify(options.body);

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
      },
      ...options,
      timeout: 5000, // Тайм-аут
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`Discord API Error: ${res.status} - ${res.statusText}`);
      console.error(`Response Body: ${errorBody}`);
      throw new Error(`Discord API Error: ${res.status}`);
    }

    return res;
  } catch (error) {
    console.error(`Fetch Error: ${error.message}`);
    throw error;
  }
}

export async function InstallGlobalCommands(appId, commands) {
  const endpoint = `applications/${appId}/commands`;

  try {
    await DiscordRequest(endpoint, { method: 'PUT', body: commands });
    console.log(`Global commands installed successfully for application ${appId}`);
  } catch (err) {
    console.error(`Failed to install global commands: ${err.message}`);
  }
}

export function getRandomEmoji() {
  const emojiList = ['😭','😄','😌','🤓','😎','😤','🤖','😶‍🌫️','🌏','📸','💿','👋','🌊','✨'];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
