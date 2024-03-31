# Discord Bot Bobby LEO

<p align="center">
  <a href="https://github.com/Corner324/Bobby-LEO">
    <img src="https://i.imgur.com/eR23ir4.png" alt="Logo" width="380" height="220"м>
  </a>
  
## Description
This Discord bot is designed to manage a field training program queue for trainees and their mentors. It allows users to join or leave the queue as trainees or mentors, take trainees from the queue, and log patrol sessions with trainees.


## Features
1. **Queue Management**: Allows trainees to join or leave a queue and mentors to take trainees from the queue.
2. **Automatic Expulsion**: Automatically removes trainees from the queue if they exceed a specified probation period.
3. **Patrol Logging**: Logs patrol sessions between mentors and trainees, providing a structured format for reporting.


## Prerequisites
- Node.js installed on your machine.
- Discord bot token.
- Discord interaction public key.
- Environment variables set up in a `.env` file (refer to `.env.example`).


## Setup
To set up and deploy this bot, follow these steps:

1. **Environment Setup**:
   - Create a `.env` file in the project root directory.
   - Define the following environment variables:
     - `PORT`: Port number for the Express server.
     - `PUBLIC_KEY`: Public key for verifying Discord requests.
     - `MAIN_CHANNEL`: ID of the main Discord channel for bot interactions.
     - `DEV_CHANNEL`: ID of the channel for error logging and debugging.
     - `LOG_CHANNEL`: ID of the channel for logging patrol sessions.

2. **Dependencies Installation**:
   - Run `npm install` to install the required dependencies specified in `package.json`.

3. **Starting the Bot**:
   - Execute `npm run start` to start the Express server and initialize the bot.
   - The bot will listen for interactions on the specified port.


## Usage

1. **Slash Commands**:
   - Use slash commands to trigger specific actions, such as creating an FTP bot or testing the bot functionality.

2. **Button Interactions**:
   - Interact with buttons in Discord messages to perform actions like joining/leaving the queue or taking a trainee.

3. **Automatic Processes**:
   - The bot automatically manages probation periods and expels trainees if they exceed the allowed time.


## Commands
- `/test`: Sends a test message.
- `/create_ftp_bot`: Initializes the field training program queue.

## Interactions
- `СТАЖЕР`, `ВЗЯТЬ`, `ФТО`: Buttons for trainee and mentor interactions within the queue.

## Logging
- Patrol sessions can be logged using the `ЗАВЕРШИТЬ ПАТРУЛЬ` button, which creates a log entry with relevant details.

## Support
For any issues or questions, please contact the bot developer.

## Credits
- Developed by [Corner324](https://github.com/Corner324).
  
## License
This project is licensed under the [MIT License](https://github.com/Corner324/Bobby-LEO/blob/main/LICENSE).
