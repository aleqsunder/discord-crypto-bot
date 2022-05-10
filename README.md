# discord-crypto-bot

Для начала работы необходимо установить [NodeJS](https://nodejs.org/en/) и [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/) (либо не устанавливать, если ты фрик), и следом:

1. Клонировать репозиторий
2. `yarn install` (или `npm install`, если ты фрик)
3. Клонировать `.env.example` в `.env`, заполнить
    1. `API_KEY` - ключ доступа в [api.coingecko.com](https://api.coingecko.com/)
    2. `DISCORD_API_KEY` - ключ доступа в [discord.developer](https://discord.com/developers/applications)
4. Запустить `node -r dotenv/config index`
