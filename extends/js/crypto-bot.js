import fetch from 'node-fetch'
import {Client, MessageEmbed} from 'discord.js'
import {
    available_methods,
    default_timeout,
    default_webhook_data,
    discord_intents as intents,
    get_markets
} from './constants.js'
import CryptoQuote from "./crypto-quote.js"

export default class CryptoBot {
    constructor(_apiKey = null) {
        if (_apiKey === null) {
            return console.error('api key not specified')
        }
        
        this.origin = 'https://api.coingecko.com/api/v3'
        this._cache = []
        this.apiKey = _apiKey
        
        this.main = this.main.bind(this)
        this.collector = this.collector.bind(this)
        this.instantCollector = this.instantCollector.bind(this)
        this.messageListenerCallback = this.messageListenerCallback.bind(this)
    }
    
    async fetchCryptoCurrency() {
        try {
            const path = this.getPath(get_markets, {
                vs_currency: 'usd',
                ids: ['ethereum', 'bitcoin'].join(',')
            })
            const response = await fetch(path)
            const data = await response.json()
            if (response.error) {
                this.error(response)
                return false
            }
            this.cache = data
        } catch (e) {
            console.error(e)
            return false
        }
        
        return true
    }
    
    async collector() {
        console.log('Get up-to-date quotes')
        if (await this.fetchCryptoCurrency()) {
            console.log('Received! Change the status of the bot')
            const name = []
            if (this.cache?.btc) {
                name.push('$' + this.cache.btc.price)
            }
            if (this.cache?.eth) {
                name.push('$' + this.cache.eth.price)
            }
            this.client.user.setPresence({
                activities: [{
                    name: name.length > 0 ? name.join(' / ') : 'пустоте',
                    type: 'STREAMING'
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
        /** @type CryptoQuote */
        const quote = this.cache[type]
        const fields = this.formatFields(quote)
        const embed = new MessageEmbed()
            .setTitle(`${quote.name} - $${quote.price}`)
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
    
    formatFields(quote) {
        return [
            {
                name: 'Дневной интервал (минимум/максимум)',
                value: `${quote.dayHigh} / ${quote.dayLow}`
            },
            {
                name: 'Разница за сутки',
                value: quote.dayPriceChange,
                inline: true
            },
            {
                name: 'Разница за сутки (%)',
                value: quote.dayPriceChangeInPercentage,
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
        this._cache = data.reduce((obj, crypto) => {
            obj[crypto.symbol] = new CryptoQuote(crypto)
            return obj
        }, {})
    }
    
    getPath(method = get_markets, params = []) {
        if (!available_methods.includes(method)) {
            throw new Error('Method is not available')
        }
        
        let search = []
        if (Object.keys(params).length > 0) {
            for (let param in params) {
                search.push(param + '=' + params[param])
            }
        }
        return this.origin + method + (search.length > 0 ? '?' : '') + search.join('&')
    }
}