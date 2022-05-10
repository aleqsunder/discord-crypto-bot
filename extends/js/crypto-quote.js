import {formatValue} from './helpers.js'

export default class CryptoQuote {
    constructor(_data) {
        this.data = _data
    }
    
    get name() {
        return this.data?.name ?? 'CPT'
    }
    
    get price() {
        if (this.data?.current_price) {
            return formatValue(this.data.current_price)
        }
        return ''
    }
    
    get dayHigh() {
        if (this.data?.high_24h) {
            return formatValue(this.data.high_24h)
        }
        return ''
    }
    
    get dayLow() {
        if (this.data?.low_24h) {
            return formatValue(this.data.low_24h)
        }
        return ''
    }
    
    get dayPriceChange() {
        if (this.data?.price_change_24h) {
            return formatValue(this.data.price_change_24h)
        }
        return ''
    }
    
    get dayPriceChangeInPercentage() {
        if (this.data?.price_change_percentage_24h) {
            return formatValue(this.data.price_change_percentage_24h)
        }
        return ''
    }
}