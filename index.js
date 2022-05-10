import CryptoBot from './extends/js/crypto-bot.js'

const bot = new CryptoBot(process.env.DISCORD_API_KEY)
bot.init()