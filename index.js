import CryptoBot from './extends/js/Discord.js'

const bot = new CryptoBot(process.env.DISCORD_API_KEY)
bot.init()