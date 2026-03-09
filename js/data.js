// ===== BIST Stock Database =====
// Real BIST penny stock symbols with Yahoo Finance integration

// Real BIST penny stock candidate symbols (price typically < 10 TL)
const BIST_PENNY_SYMBOLS = [
    // Sanayi
    "BALAT.IS", "DENTA.IS", "EPLAS.IS", "GOODY.IS", "KAPLM.IS", "KARTN.IS",
    "KATMR.IS", "KLMSN.IS", "MAKTK.IS", "MEGAP.IS", "PRZMA.IS", "SILVR.IS",
    "CELHA.IS", "DYOBY.IS", "ERBOS.IS", "OSTIM.IS", "PARSN.IS", "TLMAN.IS",
    "YATAS.IS", "SAMAT.IS",
    // Teknoloji
    "DGATE.IS", "LINK.IS", "KFEIN.IS", "PKART.IS", "PCILT.IS", "SMART.IS",
    "ARENA.IS", "EDATA.IS", "FONET.IS", "HUBVC.IS", "OBASE.IS", "FORTE.IS",
    "RHEAG.IS",
    // Finans
    "GEDIK.IS", "GLRYH.IS", "NTHOL.IS", "UFUK.IS", "YESIL.IS", "TURSG.IS",
    "VAKFN.IS",
    // Enerji
    "EMKEL.IS", "SAFKR.IS", "SANEL.IS", "ULUSE.IS", "YAYLA.IS", "ZEDUR.IS",
    "GWIND.IS", "BMELK.IS", "MAGEN.IS",
    // Gıda
    "ERSU.IS", "KNFRT.IS", "KRVGD.IS", "PENGD.IS", "PINSU.IS", "SELGD.IS",
    "ULUUN.IS", "VANGD.IS", "YAPRK.IS", "DARDL.IS",
    // İnşaat / GYO
    "DAGHL.IS", "OZGYO.IS", "RYGYO.IS", "SEGYO.IS", "SRVGY.IS", "YGYO.IS",
    "CMENT.IS", "KUYAS.IS",
    // Tekstil
    "MNDRS.IS", "OSMEN.IS", "RODRG.IS", "ROYAL.IS", "YUNSA.IS", "BRMEN.IS",
    "ISMEN.IS",
    // Madencilik
    "PRKME.IS", "TUCLK.IS", "KRDMA.IS",
    // Turizm
    "IZFAS.IS", "MERIT.IS", "MNDTR.IS", "TEKTU.IS",
    // Diğer
    "HURGZ.IS", "INTEM.IS", "TKNSA.IS", "GENIL.IS",
];

// Sector mapping for BIST stocks
const SECTOR_MAP = {
    "BALAT": "Sanayi", "DENTA": "Sanayi", "EPLAS": "Sanayi", "GOODY": "Sanayi",
    "KAPLM": "Sanayi", "KARTN": "Sanayi", "KATMR": "Sanayi", "KLMSN": "Sanayi",
    "MAKTK": "Sanayi", "MEGAP": "Sanayi", "PRZMA": "Sanayi", "SILVR": "Sanayi",
    "CELHA": "Sanayi", "DYOBY": "Sanayi", "ERBOS": "Sanayi", "OSTIM": "Sanayi",
    "PARSN": "Sanayi", "TLMAN": "Sanayi", "YATAS": "Sanayi", "SAMAT": "Sanayi",
    "DGATE": "Teknoloji", "LINK": "Teknoloji", "KFEIN": "Teknoloji", "PKART": "Teknoloji",
    "PCILT": "Teknoloji", "SMART": "Teknoloji", "ARENA": "Teknoloji", "EDATA": "Teknoloji",
    "FONET": "Teknoloji", "HUBVC": "Teknoloji", "OBASE": "Teknoloji", "FORTE": "Teknoloji",
    "RHEAG": "Teknoloji",
    "GEDIK": "Finans", "GLRYH": "Finans", "NTHOL": "Finans", "UFUK": "Finans",
    "YESIL": "Finans", "TURSG": "Finans", "VAKFN": "Finans",
    "EMKEL": "Enerji", "SAFKR": "Enerji", "SANEL": "Enerji", "ULUSE": "Enerji",
    "YAYLA": "Enerji", "ZEDUR": "Enerji", "GWIND": "Enerji", "BMELK": "Enerji",
    "MAGEN": "Enerji",
    "ERSU": "Gıda", "KNFRT": "Gıda", "KRVGD": "Gıda", "PENGD": "Gıda",
    "PINSU": "Gıda", "SELGD": "Gıda", "ULUUN": "Gıda", "VANGD": "Gıda",
    "YAPRK": "Gıda", "DARDL": "Gıda",
    "DAGHL": "İnşaat", "OZGYO": "İnşaat", "RYGYO": "İnşaat", "SEGYO": "İnşaat",
    "SRVGY": "İnşaat", "YGYO": "İnşaat", "CMENT": "İnşaat", "KUYAS": "İnşaat",
    "MNDRS": "Tekstil", "OSMEN": "Tekstil", "RODRG": "Tekstil", "ROYAL": "Tekstil",
    "YUNSA": "Tekstil", "BRMEN": "Tekstil", "ISMEN": "Tekstil",
    "PRKME": "Madencilik", "TUCLK": "Madencilik", "KRDMA": "Madencilik",
    "IZFAS": "Turizm", "MERIT": "Turizm", "MNDTR": "Turizm", "TEKTU": "Turizm",
    "HURGZ": "Medya", "INTEM": "Perakende", "TKNSA": "Perakende", "GENIL": "Sağlık",
};

// Company name mapping
const COMPANY_NAMES = {
    "BALAT": "Balatacilar Balatacılık", "DENTA": "Dentas Ambalaj", "EPLAS": "Egeplast Plastik",
    "GOODY": "Goodyear Lastik", "KAPLM": "Kaplamin Ambalaj", "KARTN": "Kartonsan",
    "KATMR": "Katmerciler", "KLMSN": "Klimasan Klima", "MAKTK": "Makina Takım",
    "MEGAP": "Mega Polietilen", "PRZMA": "Prizma Pres", "SILVR": "Silverline Endüstri",
    "CELHA": "Çelik Halat", "DYOBY": "DYO Boya", "ERBOS": "Erbosan Erciyas Boru",
    "OSTIM": "Ostim Endüstriyel", "PARSN": "Parsan Makina", "TLMAN": "Tilman Kimya",
    "YATAS": "Yataş Yatak", "SAMAT": "Saray Matbaacılık",
    "DGATE": "D-Gate Elektronik", "LINK": "Link Bilgisayar", "KFEIN": "Kafein Yazılım",
    "PKART": "Plastikkart", "PCILT": "PC İletişim", "SMART": "SmartIKS Teknoloji",
    "ARENA": "Arena Bilgisayar", "EDATA": "E-Data Teknoloji", "FONET": "Fonet Bilgi Teknolojileri",
    "HUBVC": "Hub Girişim", "OBASE": "Obase Bilgisayar", "FORTE": "Forte Bilgi İletişim",
    "RHEAG": "RHEA Girişim",
    "GEDIK": "Gedik Yatırım", "GLRYH": "Güler Yatırım Holding", "NTHOL": "Net Holding",
    "UFUK": "Ufuk Yatırım", "YESIL": "Yeşil Yatırım", "TURSG": "Türkiye Sigorta",
    "VAKFN": "Vakıf Fin. Kiralama",
    "EMKEL": "Emek Elektrik", "SAFKR": "Safkar Ege Elektrik", "SANEL": "Sanel Elektrik",
    "ULUSE": "Ulusoy Elektrik", "YAYLA": "Yayla Enerji", "ZEDUR": "Zedur Enerji",
    "GWIND": "Galata Wind Enerji", "BMELK": "BIM Elektrik", "MAGEN": "MA Güneş Enerji",
    "ERSU": "Ersu Meyve", "KNFRT": "Konfrut Gıda", "KRVGD": "Kervan Gıda",
    "PENGD": "Penguen Gıda", "PINSU": "Pınar Su", "SELGD": "Selçuk Gıda",
    "ULUUN": "Ulusoy Un", "VANGD": "Vanet Gıda", "YAPRK": "Yaprak Süt",
    "DARDL": "Dardanel Önentaş",
    "DAGHL": "Dağ Hafriyat", "OZGYO": "Özak GYO", "RYGYO": "Reysaş GYO",
    "SEGYO": "Seker GYO", "SRVGY": "Servet GYO", "YGYO": "Yeşil GYO",
    "CMENT": "Çimentaş", "KUYAS": "Kuyumcukent Gayrimenkul",
    "MNDRS": "Menderes Tekstil", "OSMEN": "Osmanli Mensucat", "RODRG": "Rodrigo Tekstil",
    "ROYAL": "Royal Halı", "YUNSA": "Yünsa Yünlü", "BRMEN": "Birlik Mensucat",
    "ISMEN": "İş Mensucat",
    "PRKME": "Park Elektrik Madencilik", "TUCLK": "Tuğçelik Alüminyum", "KRDMA": "Kardemir A",
    "IZFAS": "İzmir Fuar", "MERIT": "Merit Turizm", "MNDTR": "Mendoba Turizm",
    "TEKTU": "Tek-Art Turizm",
    "HURGZ": "Hürriyet Gazetecilik", "INTEM": "İntem Mağazacılık", "TKNSA": "Teknosa",
    "GENIL": "Genişletilmiş İlaç",
};

// Sector color mapping
const SECTOR_COLORS = {
    'Teknoloji': '#3b82f6',
    'Sanayi': '#10b981',
    'Finans': '#8b5cf6',
    'Enerji': '#f59e0b',
    'Madencilik': '#ef4444',
    'Gıda': '#06b6d4',
    'Tekstil': '#ec4899',
    'İnşaat': '#14b8a6',
    'Ulaştırma': '#6366f1',
    'Turizm': '#f97316',
    'Medya': '#a855f7',
    'Perakende': '#84cc16',
    'Sağlık': '#22d3ee',
};

// Market factors for AI analysis
const MARKET_FACTORS = {
    usdTry: { value: 0, change: 0, label: "USD/TRY" },
    eurTry: { value: 0, change: 0, label: "EUR/TRY" },
    bist100: { value: 0, change: 0, label: "BIST 100" },
    goldTry: { value: 0, change: 0, label: "Altın (TL/gr)" },
    cds: { value: 285, change: -5, label: "CDS (5Y)" },
    inflation: { value: 42.5, label: "Enflasyon (%)" },
    interest: { value: 45.0, label: "Faiz Oranı (%)" },
    vix: { value: 0, change: 0, label: "VIX" }
};

// News/Sentiment data
const NEWS_SENTIMENT = [
    { title: "Merkez Bankası faiz kararını açıkladı", sentiment: "neutral", impact: "high", sector: "all" },
    { title: "Teknoloji sektöründe yeni yatırım dalgası", sentiment: "positive", impact: "high", sector: "Teknoloji" },
    { title: "İnşaat sektöründe konut satışları artıyor", sentiment: "positive", impact: "medium", sector: "İnşaat" },
    { title: "Enerji fiyatlarında düşüş trendi devam ediyor", sentiment: "negative", impact: "medium", sector: "Enerji" },
    { title: "Gıda sektöründe ihracat rekoru", sentiment: "positive", impact: "high", sector: "Gıda" },
    { title: "Tekstil sektöründe sipariş artışı", sentiment: "positive", impact: "medium", sector: "Tekstil" },
    { title: "Madencilik sektöründe yeni maden ruhsatları", sentiment: "positive", impact: "medium", sector: "Madencilik" },
    { title: "Turizm gelirlerinde yüzde 25 artış", sentiment: "positive", impact: "high", sector: "Turizm" },
    { title: "Küresel resesyon endişeleri artıyor", sentiment: "negative", impact: "high", sector: "all" },
    { title: "Yabancı yatırımcı BIST'e geri dönüyor", sentiment: "positive", impact: "high", sector: "all" }
];

// ===== Multi-Strategy Data Fetcher =====
class BISTDataFetcher {
    constructor() {
        this.isLive = false;
        this.dataSource = 'static';
    }

    // Fetch with timeout helper
    async fetchWithTimeout(url, timeoutMs = 5000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response;
        } catch (e) {
            clearTimeout(timeoutId);
            throw e;
        }
    }

    // Strategy 1: Yahoo Finance v8 chart API (per-symbol, but reliable)
    async fetchViaYahooV8(symbol) {
        const proxies = [
            `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=3mo&interval=1d`)}`,
            `https://corsproxy.io/?${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=3mo&interval=1d`)}`,
        ];

        for (const proxyUrl of proxies) {
            try {
                const resp = await this.fetchWithTimeout(proxyUrl, 4000);
                const json = await resp.json();
                const result = json?.chart?.result?.[0];
                if (result && result.meta) return result;
            } catch (e) {
                continue;
            }
        }
        return null;
    }

    // Strategy 2: Yahoo Finance v7 quote API (batch, but may need crumb)
    async fetchViaYahooV7(symbols) {
        const symbolStr = symbols.join(',');
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolStr}&fields=symbol,shortName,longName,regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,averageDailyVolume3Month,marketCap,trailingPE,priceToBook,fiftyTwoWeekHigh,fiftyTwoWeekLow,fiftyDayAverage,twoHundredDayAverage,trailingAnnualDividendYield,beta`;

        const proxies = [
            `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
            `https://corsproxy.io/?${encodeURIComponent(url)}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
        ];

        for (const proxyUrl of proxies) {
            try {
                const resp = await this.fetchWithTimeout(proxyUrl, 5000);
                const data = await resp.json();
                if (data?.quoteResponse?.result?.length > 0) {
                    return data.quoteResponse.result;
                }
            } catch (e) {
                continue;
            }
        }
        return null;
    }

    // Strategy 3: Yahoo Finance v6 quote API (alternative endpoint)
    async fetchViaYahooV6(symbols) {
        const symbolStr = symbols.join(',');
        const url = `https://query2.finance.yahoo.com/v6/finance/quote?symbols=${symbolStr}`;

        const proxies = [
            `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
            `https://corsproxy.io/?${encodeURIComponent(url)}`,
        ];

        for (const proxyUrl of proxies) {
            try {
                const resp = await this.fetchWithTimeout(proxyUrl, 5000);
                const data = await resp.json();
                if (data?.quoteResponse?.result?.length > 0) {
                    return data.quoteResponse.result;
                }
            } catch (e) {
                continue;
            }
        }
        return null;
    }

    // Convert v8 chart result to stock format
    chartToStock(result) {
        const meta = result.meta;
        const symbol = (meta.symbol || '').replace('.IS', '');
        const price = meta.regularMarketPrice || 0;
        const quotes = result.indicators?.quote?.[0] || {};
        const timestamps = result.timestamp || [];

        // Extract OHLCV data for technical analysis
        const ohlcv = [];
        for (let i = 0; i < timestamps.length; i++) {
            if (quotes.close?.[i] != null) {
                ohlcv.push({
                    open: quotes.open?.[i] || quotes.close[i],
                    high: quotes.high?.[i] || quotes.close[i],
                    low: quotes.low?.[i] || quotes.close[i],
                    close: quotes.close[i],
                    volume: quotes.volume?.[i] || 0
                });
            }
        }

        // Calculate 52-week high/low from data
        const closes = ohlcv.map(d => d.close).filter(c => c > 0);
        const highs = ohlcv.map(d => d.high).filter(h => h > 0);
        const lows = ohlcv.map(d => d.low).filter(l => l > 0);

        const week52High = meta.fiftyTwoWeekHigh || (highs.length > 0 ? Math.max(...highs) : price * 1.3);
        const week52Low = meta.fiftyTwoWeekLow || (lows.length > 0 ? Math.min(...lows) : price * 0.7);

        // Calculate averages from data
        const recentVols = ohlcv.slice(-20).map(d => d.volume);
        const avgVol = recentVols.length > 0 ? recentVols.reduce((a, b) => a + b, 0) / recentVols.length : 1;

        // SMA 50 and SMA 200
        const ma50 = closes.length >= 50
            ? closes.slice(-50).reduce((a, b) => a + b, 0) / 50
            : meta.fiftyDayAverage || price;
        const ma200 = closes.length >= 200
            ? closes.slice(-200).reduce((a, b) => a + b, 0) / 200
            : meta.twoHundredDayAverage || price;

        const prevClose = meta.chartPreviousClose || meta.previousClose || price;
        const change = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0;

        return {
            symbol,
            name: COMPANY_NAMES[symbol] || symbol,
            sector: SECTOR_MAP[symbol] || 'Diğer',
            price,
            change: Math.round(change * 100) / 100,
            volume: ohlcv.length > 0 ? ohlcv[ohlcv.length - 1].volume : 0,
            marketCap: meta.marketCap || 0,
            pe: meta.trailingPE || 0,
            pb: meta.priceToBook || 0,
            roe: (meta.trailingPE > 0 && meta.priceToBook > 0)
                ? Math.round((meta.priceToBook / meta.trailingPE) * 100 * 10) / 10 : 0,
            debt: 40,
            beta: meta.beta || 1.2,
            float: 55,
            week52High,
            week52Low,
            avgVolume: Math.round(avgVol),
            dividend: 0,
            ma50: Math.round(ma50 * 100) / 100,
            ma200: Math.round(ma200 * 100) / 100,
            _ohlcv: ohlcv // Attach real OHLCV for AI engine!
        };
    }

    // Convert v7 quote result to stock format
    quoteToStock(quote) {
        const symbol = quote.symbol.replace('.IS', '');
        const price = quote.regularMarketPrice || 0;
        const week52High = quote.fiftyTwoWeekHigh || price * 1.3;
        const week52Low = quote.fiftyTwoWeekLow || price * 0.7;

        return {
            symbol,
            name: COMPANY_NAMES[symbol] || quote.shortName || quote.longName || symbol,
            sector: SECTOR_MAP[symbol] || 'Diğer',
            price,
            change: quote.regularMarketChangePercent || 0,
            volume: quote.regularMarketVolume || 0,
            marketCap: quote.marketCap || 0,
            pe: quote.trailingPE || 0,
            pb: quote.priceToBook || 0,
            roe: quote.trailingPE > 0 && quote.priceToBook > 0
                ? Math.round((quote.priceToBook / quote.trailingPE) * 100 * 10) / 10 : 0,
            debt: 40,
            beta: quote.beta || 1.2,
            float: 55,
            week52High,
            week52Low,
            avgVolume: quote.averageDailyVolume3Month || quote.regularMarketVolume || 1,
            dividend: (quote.trailingAnnualDividendYield || 0) * 100,
            ma50: quote.fiftyDayAverage || price,
            ma200: quote.twoHundredDayAverage || price,
        };
    }

    // Fetch market data (USD/TRY, BIST100, Gold, VIX)
    async fetchMarketData() {
        try {
            // Try v7 batch first for market indicators
            const symbols = ['USDTRY=X', 'EURTRY=X', 'XU100.IS', 'GC=F', '^VIX'];
            const results = await this.fetchViaYahooV7(symbols);
            if (results) {
                results.forEach(q => {
                    if (q.symbol === 'USDTRY=X') {
                        MARKET_FACTORS.usdTry.value = q.regularMarketPrice || 0;
                        MARKET_FACTORS.usdTry.change = q.regularMarketChangePercent || 0;
                    } else if (q.symbol === 'EURTRY=X') {
                        MARKET_FACTORS.eurTry.value = q.regularMarketPrice || 0;
                        MARKET_FACTORS.eurTry.change = q.regularMarketChangePercent || 0;
                    } else if (q.symbol === 'XU100.IS') {
                        MARKET_FACTORS.bist100.value = q.regularMarketPrice || 0;
                        MARKET_FACTORS.bist100.change = q.regularMarketChangePercent || 0;
                    } else if (q.symbol === 'GC=F') {
                        const goldUsd = q.regularMarketPrice || 0;
                        MARKET_FACTORS.goldTry.value = Math.round(goldUsd * (MARKET_FACTORS.usdTry.value || 38) / 31.1035);
                        MARKET_FACTORS.goldTry.change = q.regularMarketChangePercent || 0;
                    } else if (q.symbol === '^VIX') {
                        MARKET_FACTORS.vix.value = q.regularMarketPrice || 0;
                        MARKET_FACTORS.vix.change = q.regularMarketChangePercent || 0;
                    }
                });
                return true;
            }

            // Fallback: fetch key market data via v8 chart
            const marketSymbols = { 'USDTRY=X': 'usdTry', 'XU100.IS': 'bist100' };
            for (const [sym, key] of Object.entries(marketSymbols)) {
                const result = await this.fetchViaYahooV8(sym);
                if (result?.meta) {
                    MARKET_FACTORS[key].value = result.meta.regularMarketPrice || 0;
                    MARKET_FACTORS[key].change = result.meta.regularMarketDayHigh && result.meta.chartPreviousClose
                        ? ((result.meta.regularMarketPrice - result.meta.chartPreviousClose) / result.meta.chartPreviousClose * 100) : 0;
                }
            }
        } catch (e) {
            console.warn('Market data fetch failed:', e.message);
        }
    }

    // Main fetch - try multiple strategies with global timeout
    async fetchAllStocks() {
        const globalTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Global timeout')), 15000)
        );

        try {
            const fetchJob = async () => {
                // Fetch market data (non-blocking, best effort)
                await this.fetchMarketData().catch(() => {});

                let allStocks = [];

                // === Strategy 1: Try v7 batch API first (fastest if it works) ===
                console.log('📡 Strateji 1: Yahoo v7 batch API deneniyor...');
                const batchSize = 40;
                for (let i = 0; i < BIST_PENNY_SYMBOLS.length; i += batchSize) {
                    const batch = BIST_PENNY_SYMBOLS.slice(i, i + batchSize);
                    const results = await this.fetchViaYahooV7(batch);
                    if (results) {
                        results.forEach(q => {
                            if (q.regularMarketPrice > 0) allStocks.push(this.quoteToStock(q));
                        });
                    }
                }

                if (allStocks.length > 5) {
                    this.isLive = true;
                    this.dataSource = 'yahoo-v7';
                    console.log(`✅ v7 API: ${allStocks.length} hisse yüklendi`);
                    return allStocks;
                }

                // === Strategy 2: Try v6 batch API ===
                console.log('📡 Strateji 2: Yahoo v6 API deneniyor...');
                allStocks = [];
                for (let i = 0; i < BIST_PENNY_SYMBOLS.length; i += batchSize) {
                    const batch = BIST_PENNY_SYMBOLS.slice(i, i + batchSize);
                    const results = await this.fetchViaYahooV6(batch);
                    if (results) {
                        results.forEach(q => {
                            if (q.regularMarketPrice > 0) allStocks.push(this.quoteToStock(q));
                        });
                    }
                }

                if (allStocks.length > 5) {
                    this.isLive = true;
                    this.dataSource = 'yahoo-v6';
                    console.log(`✅ v6 API: ${allStocks.length} hisse yüklendi`);
                    return allStocks;
                }

                // === Strategy 3: v8 chart API per symbol (slower but most reliable) ===
                console.log('📡 Strateji 3: Yahoo v8 chart API deneniyor...');
                allStocks = [];
                // Only fetch a subset to avoid very long load times
                const prioritySymbols = BIST_PENNY_SYMBOLS.slice(0, 30);
                const promises = prioritySymbols.map(sym =>
                    this.fetchViaYahooV8(sym)
                        .then(result => result ? this.chartToStock(result) : null)
                        .catch(() => null)
                );

                // Fetch 10 at a time to avoid overwhelming
                for (let i = 0; i < promises.length; i += 10) {
                    const batch = promises.slice(i, i + 10);
                    const results = await Promise.all(batch);
                    results.forEach(stock => {
                        if (stock && stock.price > 0) allStocks.push(stock);
                    });
                }

                if (allStocks.length > 3) {
                    this.isLive = true;
                    this.dataSource = 'yahoo-v8';
                    console.log(`✅ v8 chart API: ${allStocks.length} hisse yüklendi (gerçek OHLCV dahil)`);
                    return allStocks;
                }

                console.warn('⚠️ Tüm API stratejileri başarısız');
                return [];
            };

            return await Promise.race([fetchJob(), globalTimeout]);
        } catch (e) {
            console.warn('fetchAllStocks timeout or error:', e.message);
            return [];
        }
    }
}

// Fallback static data (used when API is unavailable)
const FALLBACK_STOCKS = [
    { symbol: "BALAT", name: "Balatacilar Balatacılık", sector: "Sanayi", price: 1.87, change: 4.47, volume: 12500000, marketCap: 85000000, pe: 8.2, pb: 0.7, roe: 9.1, debt: 45, beta: 1.8, float: 65, week52High: 3.10, week52Low: 1.20, avgVolume: 8000000, dividend: 0 },
    { symbol: "DENTA", name: "Dentas Ambalaj", sector: "Sanayi", price: 3.56, change: 7.23, volume: 18900000, marketCap: 250000000, pe: 6.8, pb: 0.9, roe: 13.2, debt: 30, beta: 1.3, float: 55, week52High: 5.20, week52Low: 2.10, avgVolume: 10000000, dividend: 2.1 },
    { symbol: "DGATE", name: "D-Gate Elektronik", sector: "Teknoloji", price: 4.12, change: 2.89, volume: 9800000, marketCap: 180000000, pe: 15.3, pb: 2.1, roe: 14.5, debt: 25, beta: 1.6, float: 60, week52High: 6.80, week52Low: 2.50, avgVolume: 7000000, dividend: 0 },
    { symbol: "EPLAS", name: "Egeplast Plastik", sector: "Sanayi", price: 5.23, change: 1.56, volume: 7600000, marketCap: 310000000, pe: 7.2, pb: 1.3, roe: 18.0, debt: 20, beta: 1.1, float: 50, week52High: 7.40, week52Low: 3.80, avgVolume: 5500000, dividend: 3.2 },
    { symbol: "ERSU", name: "Ersu Meyve", sector: "Gıda", price: 3.89, change: 5.67, volume: 14200000, marketCap: 145000000, pe: 8.9, pb: 1.0, roe: 11.2, debt: 35, beta: 1.2, float: 62, week52High: 5.60, week52Low: 2.40, avgVolume: 9000000, dividend: 2.5 },
    { symbol: "GEDIK", name: "Gedik Yatırım", sector: "Finans", price: 1.45, change: 9.85, volume: 32000000, marketCap: 220000000, pe: 5.5, pb: 0.6, roe: 10.9, debt: 40, beta: 2.0, float: 75, week52High: 2.80, week52Low: 0.95, avgVolume: 20000000, dividend: 4.5 },
    { symbol: "GOODY", name: "Goodyear Lastik", sector: "Sanayi", price: 4.78, change: 2.14, volume: 6800000, marketCap: 420000000, pe: 7.8, pb: 1.2, roe: 15.4, debt: 28, beta: 1.0, float: 45, week52High: 6.90, week52Low: 3.50, avgVolume: 5000000, dividend: 3.8 },
    { symbol: "KAPLM", name: "Kaplamin Ambalaj", sector: "Sanayi", price: 2.91, change: 6.20, volume: 11300000, marketCap: 135000000, pe: 6.4, pb: 0.8, roe: 12.5, debt: 38, beta: 1.4, float: 65, week52High: 4.80, week52Low: 1.90, avgVolume: 8500000, dividend: 1.2 },
    { symbol: "KATMR", name: "Katmerciler", sector: "Sanayi", price: 8.45, change: 1.23, volume: 5600000, marketCap: 680000000, pe: 9.5, pb: 1.8, roe: 19.0, debt: 32, beta: 1.2, float: 42, week52High: 12.50, week52Low: 6.20, avgVolume: 4200000, dividend: 2.0 },
    { symbol: "KFEIN", name: "Kafein Yazılım", sector: "Teknoloji", price: 9.12, change: 4.56, volume: 8900000, marketCap: 450000000, pe: 18.5, pb: 3.2, roe: 17.3, debt: 15, beta: 1.7, float: 55, week52High: 14.80, week52Low: 6.50, avgVolume: 6500000, dividend: 0 },
    { symbol: "KNFRT", name: "Konfrut Gıda", sector: "Gıda", price: 3.67, change: 8.55, volume: 16700000, marketCap: 175000000, pe: 6.2, pb: 0.9, roe: 14.5, debt: 28, beta: 1.3, float: 60, week52High: 5.80, week52Low: 2.30, avgVolume: 11000000, dividend: 2.8 },
    { symbol: "KUYAS", name: "Kuyumcukent Gayrimenkul", sector: "İnşaat", price: 1.98, change: 12.50, volume: 28000000, marketCap: 98000000, pe: 4.5, pb: 0.5, roe: 11.1, debt: 55, beta: 2.1, float: 78, week52High: 3.50, week52Low: 1.10, avgVolume: 18000000, dividend: 0 },
    { symbol: "LINK", name: "Link Bilgisayar", sector: "Teknoloji", price: 6.78, change: 3.89, volume: 9200000, marketCap: 380000000, pe: 12.3, pb: 2.0, roe: 16.3, debt: 20, beta: 1.5, float: 52, week52High: 10.20, week52Low: 4.80, avgVolume: 6800000, dividend: 1.5 },
    { symbol: "MEGAP", name: "Mega Polietilen", sector: "Sanayi", price: 2.45, change: 5.60, volume: 13400000, marketCap: 110000000, pe: 5.8, pb: 0.7, roe: 12.1, debt: 42, beta: 1.6, float: 70, week52High: 4.20, week52Low: 1.60, avgVolume: 9000000, dividend: 1.0 },
    { symbol: "PCILT", name: "PC İletişim", sector: "Teknoloji", price: 1.78, change: 11.25, volume: 25000000, marketCap: 92000000, pe: 5.2, pb: 0.8, roe: 15.4, debt: 30, beta: 2.3, float: 72, week52High: 3.20, week52Low: 1.00, avgVolume: 16000000, dividend: 0 },
    { symbol: "PKART", name: "Plastikkart", sector: "Teknoloji", price: 3.34, change: 7.40, volume: 15600000, marketCap: 165000000, pe: 6.5, pb: 1.0, roe: 15.4, debt: 22, beta: 1.5, float: 60, week52High: 5.50, week52Low: 2.10, avgVolume: 10000000, dividend: 1.5 },
    { symbol: "PRKME", name: "Park Elektrik Madencilik", sector: "Madencilik", price: 5.90, change: 4.24, volume: 11200000, marketCap: 380000000, pe: 6.8, pb: 1.2, roe: 17.6, debt: 30, beta: 1.4, float: 55, week52High: 9.20, week52Low: 4.00, avgVolume: 8000000, dividend: 2.5 },
    { symbol: "PRZMA", name: "Prizma Pres", sector: "Sanayi", price: 2.56, change: 6.67, volume: 9800000, marketCap: 118000000, pe: 5.9, pb: 0.7, roe: 11.9, debt: 40, beta: 1.5, float: 68, week52High: 4.30, week52Low: 1.70, avgVolume: 7000000, dividend: 1.0 },
    { symbol: "SAFKR", name: "Safkar Ege Elektrik", sector: "Enerji", price: 3.12, change: 5.41, volume: 10500000, marketCap: 155000000, pe: 6.5, pb: 0.8, roe: 12.3, debt: 42, beta: 1.5, float: 65, week52High: 5.20, week52Low: 2.10, avgVolume: 7500000, dividend: 2.0 },
    { symbol: "SMART", name: "SmartIKS Teknoloji", sector: "Teknoloji", price: 8.90, change: 5.95, volume: 12300000, marketCap: 520000000, pe: 16.8, pb: 2.8, roe: 16.7, debt: 15, beta: 1.8, float: 55, week52High: 13.50, week52Low: 5.80, avgVolume: 8500000, dividend: 0 },
    { symbol: "UFUK", name: "Ufuk Yatırım", sector: "Finans", price: 1.23, change: 15.89, volume: 42000000, marketCap: 72000000, pe: 3.8, pb: 0.4, roe: 10.5, debt: 48, beta: 2.5, float: 82, week52High: 2.50, week52Low: 0.72, avgVolume: 28000000, dividend: 0 },
    { symbol: "FORTE", name: "Forte Bilgi İletişim", sector: "Teknoloji", price: 2.89, change: 9.47, volume: 21000000, marketCap: 135000000, pe: 5.5, pb: 0.9, roe: 16.4, debt: 22, beta: 1.9, float: 68, week52High: 5.00, week52Low: 1.60, avgVolume: 14000000, dividend: 0 },
    { symbol: "EDATA", name: "E-Data Teknoloji", sector: "Teknoloji", price: 1.45, change: 13.28, volume: 35000000, marketCap: 78000000, pe: 4.5, pb: 0.6, roe: 13.3, debt: 32, beta: 2.4, float: 78, week52High: 2.80, week52Low: 0.80, avgVolume: 22000000, dividend: 0 },
    { symbol: "VANGD", name: "Vanet Gıda", sector: "Gıda", price: 2.34, change: 9.35, volume: 20500000, marketCap: 115000000, pe: 5.5, pb: 0.7, roe: 12.7, debt: 40, beta: 1.7, float: 70, week52High: 4.00, week52Low: 1.50, avgVolume: 14000000, dividend: 1.0 },
    { symbol: "SAMAT", name: "Saray Matbaacılık", sector: "Sanayi", price: 1.67, change: 8.44, volume: 19500000, marketCap: 78000000, pe: 4.8, pb: 0.5, roe: 10.4, debt: 50, beta: 2.0, float: 75, week52High: 3.20, week52Low: 1.05, avgVolume: 13000000, dividend: 0 },
    { symbol: "FONET", name: "Fonet Bilgi Teknolojileri", sector: "Teknoloji", price: 6.34, change: 3.26, volume: 8900000, marketCap: 310000000, pe: 10.5, pb: 1.8, roe: 17.1, debt: 15, beta: 1.5, float: 52, week52High: 9.80, week52Low: 4.50, avgVolume: 6200000, dividend: 1.0 },
    { symbol: "MAGEN", name: "MA Güneş Enerji", sector: "Enerji", price: 4.34, change: 6.37, volume: 13500000, marketCap: 220000000, pe: 8.0, pb: 1.2, roe: 15.0, debt: 30, beta: 1.5, float: 58, week52High: 7.00, week52Low: 3.00, avgVolume: 9500000, dividend: 1.5 },
    { symbol: "KRVGD", name: "Kervan Gıda", sector: "Gıda", price: 5.89, change: 2.34, volume: 7800000, marketCap: 340000000, pe: 8.8, pb: 1.3, roe: 14.8, debt: 25, beta: 1.0, float: 48, week52High: 8.50, week52Low: 4.20, avgVolume: 5500000, dividend: 3.0 },
    { symbol: "YAYLA", name: "Yayla Enerji", sector: "Enerji", price: 5.67, change: 4.41, volume: 9800000, marketCap: 320000000, pe: 7.8, pb: 1.2, roe: 15.4, debt: 32, beta: 1.3, float: 52, week52High: 8.80, week52Low: 4.00, avgVolume: 7000000, dividend: 2.8 },
    { symbol: "OSTIM", name: "Ostim Endüstriyel", sector: "Sanayi", price: 5.67, change: 2.56, volume: 8900000, marketCap: 350000000, pe: 8.5, pb: 1.3, roe: 15.3, debt: 22, beta: 1.2, float: 50, week52High: 8.40, week52Low: 4.00, avgVolume: 6500000, dividend: 2.8 },
];

// Global fetcher instance
const dataFetcher = new BISTDataFetcher();
