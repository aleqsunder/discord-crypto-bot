import fetch from 'node-fetch'
import {Client, MessageEmbed} from 'discord.js'
import {formatValue} from './helpers.js'
import {
    api_path,
    default_timeout,
    default_webhook_data,
    discord_intents as intents
} from './constants.js'

export default class CryptoBot {
    constructor(_apiKey = null) {
        if (_apiKey === null) {
            return console.error('api key not specified')
        }
        
        this._cache = []
        this.apiKey = _apiKey
        
        this.main = this.main.bind(this)
        this.collector = this.collector.bind(this)
        this.instantCollector = this.instantCollector.bind(this)
        this.messageListenerCallback = this.messageListenerCallback.bind(this)
    }
    
    async fetchCryptoCurrency() {
        const response = await fetch(api_path)
        const data = await response.json()
        if (response.error) {
            this.error(response)
            return false
        }
    
        this.cache = data
        return true
    }
    
    async collector() {
        console.log('Get up-to-date quotes')
        if (await this.fetchCryptoCurrency()) {
            console.log('Received! Change the status of the bot')
            this.client.user.setPresence({
                activities: [{
                    name: `$${this.cache.btc.current_price} / $${this.cache.eth.current_price}`,
                    type: 'COMPETING'
                }],
                status: 'idle'
            })
        }
    }
    
    async instantCollector() {
        await this.collector()
        setInterval(this.collector, default_timeout)
    }
    
    async main() {
        console.log('Initialization')
        await this.instantCollector()
        this.client.on('messageCreate', this.messageListenerCallback)
    }
    
    init() {
        if (!this.apiKey) {
            console.error('api key not specified')
        }
        
        this.client = new Client({intents})
        this.client.login(this.apiKey)
            .then(this.main)
            .catch(this.error)
    }
    
    messageListenerCallback(message) {
        if (message.channel.type !== 'GUILD_TEXT' || message.author.bot || !message.content.startsWith(process.env.DISCORD_PREFIX)) {
            return false
        }
        
        const [command] = message.content.split(' ')
        const type = command.slice(1).trim().toLowerCase()
        if (!Object.keys(default_webhook_data).includes(type) || typeof this.cache[type] === "undefined") {
            return false
        }
        
        console.log('Forming data to send to the webhook')
        
        const {name, avatar} = default_webhook_data[type]
        const fields = this.formatFields(type)
        const embed = new MessageEmbed()
            .setTitle(`${this.cache[type].name} - $${this.cache[type].current_price}`)
            .addFields(fields)
            .setTimestamp()
        
        message.channel
            .createWebhook(name, {avatar})
            .then(async context => {
                console.log('Sending a message')
                await context.send({embeds: [embed]})
                await context.delete()
                console.log('Message sent!')
            })
    }
    
    formatFields(type) {
        return [
            {
                name: 'Дневной интервал (минимум/максимум)',
                value: `${formatValue(this.cache[type].high_24h)} / ${formatValue(this.cache[type].low_24h)}`
            },
            {
                name: 'Разница за сутки',
                value: formatValue(this.cache[type].price_change_24h),
                inline: true
            },
            {
                name: 'Разница за сутки (%)',
                value: formatValue(this.cache[type].price_change_percentage_24h),
                inline: true
            }
        ]
    }
    
    error(...args) {
        console.log(...args)
    }
    
    get cache() {
        return this._cache
    }
    
    set cache(data) {
        this._cache = data.reduce((obj, crypto) => (obj[crypto.symbol] = crypto, obj), {})
    }
}