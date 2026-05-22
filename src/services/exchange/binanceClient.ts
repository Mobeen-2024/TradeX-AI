import crypto from 'crypto';

interface BinanceOrderConfig {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT';
    quantity: number;
    price?: number;
}

export class BinanceClient {
    private apiKey: string;
    private apiSecret: string;
    private baseUrl: string;

    constructor() {
        // FORCE TESTNET for safety as requested
        const mode = process.env.EXCHANGE_MODE || 'testnet';
        const isLive = mode === 'live';
        
        this.apiKey = process.env.BINANCE_API_KEY || '';
        this.apiSecret = process.env.BINANCE_SECRET_KEY || '';
        this.baseUrl = isLive ? 'https://api.binance.com' : 'https://testnet.binance.vision';

        console.log(`[BinanceClient] INITIALIZED. Mode: ${mode.toUpperCase()}, BaseUrl: ${this.baseUrl}`);
        if (!this.apiKey || !this.apiSecret) {
            console.warn('[BinanceClient] Missing BINANCE_API_KEY or BINANCE_SECRET_KEY in env.');
        }
    }

    private signQuery(queryString: string): string {
        const signature = crypto.createHmac('sha256', this.apiSecret).update(queryString).digest('hex');
        console.log(`[BinanceClient] Signed Query: ${queryString} -> ${signature.substring(0, 8)}...`);
        return signature;
    }

    private async request(endpoint: string, method: string, queryParams: Record<string, any> = {}) {
        let maxRetries = 3;
        let attempt = 0;
        
        console.log(`[BinanceClient] HTTP ${method} ${endpoint} - Params:`, JSON.stringify(queryParams));

        while (attempt < maxRetries) {
            attempt++;
            try {
                // Add timestamp
                queryParams.timestamp = Date.now();
                const queryString = new URLSearchParams(queryParams as any).toString();
                const signature = this.signQuery(queryString);
                const url = `${this.baseUrl}${endpoint}?${queryString}&signature=${signature}`;

                console.log(`[BinanceClient] Sending Request (${attempt}/${maxRetries}): ${url.split('?')[0]}`);

                const response = await fetch(url, {
                    method,
                    headers: {
                        'X-MBX-APIKEY': this.apiKey
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    console.error(`[BinanceClient] Response Error (${response.status}):`, JSON.stringify(data));
                    throw new Error(`Binance API Error (${response.status}): ${JSON.stringify(data)}`);
                }

                console.log(`[BinanceClient] Response Success:`, JSON.stringify(data));
                return data;
            } catch (error) {
                console.error(`[BinanceClient] Request failed (${attempt}/${maxRetries}):`, error);
                if (attempt >= maxRetries) {
                    console.error(`[BinanceClient] Max retries reached. Throwing error.`);
                    throw error;
                }
                const backoff = 1000 * attempt;
                console.log(`[BinanceClient] Retrying in ${backoff}ms...`);
                await new Promise(r => setTimeout(r, backoff)); // Exponential backoff simulation
            }
        }
    }

    private async publicRequest(endpoint: string, queryParams: Record<string, any> = {}) {
        console.log(`[BinanceClient] HTTP GET PUBLIC ${endpoint} - Params:`, JSON.stringify(queryParams));
        const queryString = new URLSearchParams(queryParams as any).toString();
        const url = `${this.baseUrl}${endpoint}?${queryString}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            console.error(`[BinanceClient] Public API Error:`, JSON.stringify(data));
            throw new Error(`Binance Public API Error: ${JSON.stringify(data)}`);
        }
        
        console.log(`[BinanceClient] Public API Success:`, JSON.stringify(data));
        return data;
    }

    async placeOrder(config: BinanceOrderConfig) {
        let formattedSymbol = config.symbol.toUpperCase();
        if (!formattedSymbol.endsWith('USDT')) {
            formattedSymbol += 'USDT';
        }

        const params: Record<string, any> = {
            symbol: formattedSymbol,
            side: config.side,
            type: config.type,
            quantity: config.quantity,
        };

        if (config.type === 'LIMIT' && config.price) {
            params.price = config.price;
            params.timeInForce = 'GTC';
        }

        return await this.request('/api/v3/order', 'POST', params);
    }

    async getOrderStatus(symbol: string, orderId: string) {
        let formattedSymbol = symbol.toUpperCase();
        if (!formattedSymbol.endsWith('USDT')) {
            formattedSymbol += 'USDT';
        }
        return await this.request('/api/v3/order', 'GET', {
            symbol: formattedSymbol,
            orderId
        });
    }

    async getAccountBalance() {
        const account = await this.request('/api/v3/account', 'GET');
        return account.balances;
    }

    async getTickerPrice(symbol: string): Promise<number> {
        let formattedSymbol = symbol.toUpperCase();
        if (!formattedSymbol.endsWith('USDT')) {
            formattedSymbol += 'USDT';
        }
        const data = await this.publicRequest('/api/v3/ticker/price', { symbol: formattedSymbol });
        return parseFloat(data.price);
    }
}
