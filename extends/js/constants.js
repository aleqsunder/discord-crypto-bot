import {Intents} from "discord.js"

const bitcoin_avatar = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/800px-Bitcoin.svg.png'
const ethereum_avatar = 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png'

export const default_timeout = 3e4
export const default_webhook_data = {
    btc: {
        name: 'BTC enjoyer',
        avatar: bitcoin_avatar
    },
    eth: {
        name: 'ETH enjoyer',
        avatar: ethereum_avatar
    }
}
export const api_path = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum,bitcoin'
export const discord_intents = [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]