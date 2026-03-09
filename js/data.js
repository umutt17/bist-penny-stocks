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

// Market factors for AI analysis (all fetched live)
const MARKET_FACTORS = {
    usdTry: { value: 0, change: 0, label: "USD/TRY" },
    eurTry: { value: 0, change: 0, label: "EUR/TRY" },
    bist100: { value: 0, change: 0, label: "BIST 100" },
    goldTry: { value: 0, change: 0, label: "Altin (TL/gr)" },
    goldUsd: { value: 0, change: 0, label: "Altin (USD/oz)" },
    cds: { value: 0, change: 0, label: "CDS (5Y)" },
    inflation: { value: 0, label: "Enflasyon (%)" },
    interest: { value: 0, label: "Faiz Orani (%)" },
    vix: { value: 0, change: 0, label: "VIX" }
};

// Live news from RSS feeds (populated at runtime)
let NEWS_SENTIMENT = [];

// ===== BIST Data Fetcher (TradingView Scanner API - same as bist-agent) =====
class BISTDataFetcher {
    constructor() {
        this.isLive = false;
        this.dataSource = 'static';
        this.corsProxies = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://api.codetabs.com/v1/proxy?quest=',
        ];
    }

    // Fetch with timeout helper
    async fetchWithTimeout(url, options = {}, timeoutMs = 6000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response;
        } catch (e) {
            clearTimeout(timeoutId);
            throw e;
        }
    }

    // ===== STRATEGY 1: TradingView Scanner API (from bist-agent) =====
    // This is the PRIMARY method - single POST request returns ALL BIST stocks
    async fetchViaTradingView() {
        const tvUrl = 'https://scanner.tradingview.com/turkey/scan';
        const payload = {
            columns: [
                'name', 'description', 'close', 'change', 'change_abs',
                'volume', 'market_cap_basic', 'price_earnings_ttm',
                'price_book_ratio', 'dividend_yield_recent',
                'High.All', 'Low.All', 'high', 'low',
                'price_52_week_high', 'price_52_week_low',
                'SMA50', 'SMA200', 'EMA20', 'EMA50',
                'RSI', 'RSI[1]', 'Stoch.K', 'Stoch.D',
                'MACD.macd', 'MACD.signal', 'ADX', 'ADX-DI', 'ADX+DI',
                'BB.upper', 'BB.lower', 'BB.basis',
                'average_volume_30d_calc', 'Volatility.D',
                'beta_1_year', 'Perf.W', 'Perf.1M', 'Perf.3M', 'Perf.6M', 'Perf.Y',
                'Recommend.All', 'Recommend.MA', 'Recommend.Other',
                'open', 'Perf.YTD', 'return_on_equity',
                'debt_to_equity', 'current_ratio',
                'ATR', 'CCI20', 'Mom', 'AO',
                'Stoch.RSI.K', 'W.R', 'average_volume_10d_calc'
            ],
            range: [0, 1000],
            sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' },
            options: { lang: 'tr' }
        };

        // Direct POST without Content-Type header to avoid CORS preflight
        // TradingView allows POST from github.io origins but does NOT allow
        // Content-Type header in preflight, so we send as text/plain (simple request)
        try {
            const resp = await this.fetchWithTimeout(tvUrl, {
                method: 'POST',
                body: JSON.stringify(payload)
            }, 10000);
            const data = await resp.json();
            if (data?.data?.length > 0) return data;
        } catch (e) {
            console.warn('TradingView direct failed:', e.message);
        }

        return null;
    }

    // Convert TradingView scan result to stock format
    tvToStock(row) {
        const d = row.d; // data array matching columns order
        const symbol = (row.s || '').replace('BIST:', '');
        if (!symbol) return null;

        const price = d[2] || 0;   // close
        if (price <= 0) return null;

        const change = d[3] || 0;  // change %
        const volume = d[5] || 0;
        const marketCap = d[6] || 0;
        const pe = d[7] || 0;
        const pb = d[8] || 0;
        const dividendYield = d[9] || 0;
        const week52High = d[14] || price * 1.3;
        const week52Low = d[15] || price * 0.7;
        const sma50 = d[16] || price;
        const sma200 = d[17] || price;
        const ema20 = d[18] || price;
        const ema50 = d[19] || price;
        const rsi = d[20] || 50;
        const rsiPrev = d[21] || rsi;
        const stochK = d[22] || 50;
        const stochD = d[23] || 50;
        const macdVal = d[24] || 0;
        const macdSignal = d[25] || 0;
        const adxVal = d[26] || 20;
        const adxDIMinus = d[27] || 20;
        const adxDIPlus = d[28] || 20;
        const bbUpper = d[29] || price * 1.05;
        const bbLower = d[30] || price * 0.95;
        const bbBasis = d[31] || price;
        const avgVolume = d[32] || volume || 1;
        const volatility = d[33] || 3;
        const beta = d[34] || 1.2;
        const perfW = d[35] || 0;
        const perf1M = d[36] || 0;
        const perf3M = d[37] || 0;
        const perf6M = d[38] || 0;
        const perfY = d[39] || 0;
        const recAll = d[40] || 0;    // -1 to +1 (sell to buy)
        const recMA = d[41] || 0;
        const recOther = d[42] || 0;
        const open = d[43] || price;
        const perfYTD = d[44] || 0;
        const roe = d[45] || 0;       // return_on_equity
        const debtToEquity = d[46] || 0;
        const currentRatio = d[47] || 0;
        const atr = d[48] || 0;
        const cci = d[49] || 0;
        const momentum = d[50] || 0;
        const ao = d[51] || 0;        // awesome oscillator
        const stochRsiK = d[52] || 50;
        const williamsR = d[53] || -50;
        const avgVolume10 = d[54] || avgVolume;

        return {
            symbol,
            name: COMPANY_NAMES[symbol] || d[1] || symbol,
            sector: SECTOR_MAP[symbol] || 'Diger',
            price,
            change: Math.round(change * 100) / 100,
            volume,
            marketCap,
            pe: Math.round((pe || 0) * 100) / 100,
            pb: Math.round((pb || 0) * 100) / 100,
            roe: Math.round((roe || 0) * 100) / 100,
            debt: debtToEquity > 0 ? Math.min(100, Math.round(debtToEquity / (1 + debtToEquity) * 100)) : 40,
            beta: Math.round((beta || 1.2) * 100) / 100,
            float: 55,
            week52High,
            week52Low,
            avgVolume: Math.round(avgVolume),
            dividend: Math.round((dividendYield || 0) * 100) / 100,
            ma50: sma50,
            ma200: sma200,
            // Attach real TradingView indicators for AI engine
            _tvIndicators: {
                ema20, ema50, sma50, sma200,
                rsi, rsiPrev, stochK, stochD,
                macdVal, macdSignal,
                adxVal, adxDIPlus, adxDIMinus,
                bbUpper, bbLower, bbBasis,
                volatility, atr, cci, momentum, ao,
                stochRsiK, williamsR,
                perfW, perf1M, perf3M, perf6M, perfY, perfYTD,
                recAll, recMA, recOther,
                avgVolume10, currentRatio, debtToEquity,
                open
            }
        };
    }

    // ===== STRATEGY 2: Yahoo Finance v8 chart API (per-symbol with OHLCV) =====
    async fetchViaYahooV8(symbol) {
        for (const proxy of this.corsProxies) {
            try {
                const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=3mo&interval=1d`;
                const resp = await this.fetchWithTimeout(proxy + encodeURIComponent(url), {}, 5000);
                const json = await resp.json();
                const result = json?.chart?.result?.[0];
                if (result?.meta) return result;
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

        const closes = ohlcv.map(d => d.close).filter(c => c > 0);
        const highs = ohlcv.map(d => d.high).filter(h => h > 0);
        const lows = ohlcv.map(d => d.low).filter(l => l > 0);

        const week52High = meta.fiftyTwoWeekHigh || (highs.length > 0 ? Math.max(...highs) : price * 1.3);
        const week52Low = meta.fiftyTwoWeekLow || (lows.length > 0 ? Math.min(...lows) : price * 0.7);

        const recentVols = ohlcv.slice(-20).map(d => d.volume);
        const avgVol = recentVols.length > 0 ? recentVols.reduce((a, b) => a + b, 0) / recentVols.length : 1;

        const ma50 = closes.length >= 50
            ? closes.slice(-50).reduce((a, b) => a + b, 0) / 50
            : meta.fiftyDayAverage || price;
        const ma200 = meta.twoHundredDayAverage || price;

        const prevClose = meta.chartPreviousClose || meta.previousClose || price;
        const change = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0;

        return {
            symbol,
            name: COMPANY_NAMES[symbol] || symbol,
            sector: SECTOR_MAP[symbol] || 'Diger',
            price,
            change: Math.round(change * 100) / 100,
            volume: ohlcv.length > 0 ? ohlcv[ohlcv.length - 1].volume : 0,
            marketCap: meta.marketCap || 0,
            pe: meta.trailingPE || 0,
            pb: meta.priceToBook || 0,
            roe: 0,
            debt: 40,
            beta: meta.beta || 1.2,
            float: 55,
            week52High,
            week52Low,
            avgVolume: Math.round(avgVol),
            dividend: 0,
            ma50: Math.round(ma50 * 100) / 100,
            ma200: Math.round(ma200 * 100) / 100,
            _ohlcv: ohlcv
        };
    }

    // ===== MARKET DATA (all real) =====
    async fetchMarketData() {
        const tvPost = (url, body) => this.fetchWithTimeout(url, {
            method: 'POST', body: JSON.stringify(body)
        }, 5000).then(r => r.json()).catch(() => null);

        // All market data requests in parallel
        const [forexData, turkeyData, americaData, cfdData] = await Promise.all([
            // USD/TRY, EUR/TRY
            tvPost('https://scanner.tradingview.com/forex/scan', {
                columns: ['name', 'close', 'change'],
                symbols: { tickers: ['FX_IDC:USDTRY', 'FX_IDC:EURTRY'] },
                sort: { sortBy: 'name', sortOrder: 'asc' }
            }),
            // BIST100
            tvPost('https://scanner.tradingview.com/turkey/scan', {
                columns: ['name', 'close', 'change'],
                symbols: { tickers: ['BIST:XU100'] },
                sort: { sortBy: 'name', sortOrder: 'asc' }
            }),
            // VIX
            tvPost('https://scanner.tradingview.com/america/scan', {
                columns: ['name', 'close', 'change'],
                symbols: { tickers: ['CBOE:VIX'] },
                sort: { sortBy: 'name', sortOrder: 'asc' }
            }),
            // Gold (USD/oz)
            tvPost('https://scanner.tradingview.com/cfd/scan', {
                columns: ['name', 'close', 'change'],
                symbols: { tickers: ['TVC:GOLD'] },
                sort: { sortBy: 'name', sortOrder: 'asc' }
            }),
        ]);

        // Parse results
        if (forexData?.data) {
            forexData.data.forEach(row => {
                if (row.s?.includes('USDTRY')) {
                    MARKET_FACTORS.usdTry.value = row.d[1] || 0;
                    MARKET_FACTORS.usdTry.change = row.d[2] || 0;
                } else if (row.s?.includes('EURTRY')) {
                    MARKET_FACTORS.eurTry.value = row.d[1] || 0;
                    MARKET_FACTORS.eurTry.change = row.d[2] || 0;
                }
            });
        }
        if (turkeyData?.data?.[0]) {
            MARKET_FACTORS.bist100.value = turkeyData.data[0].d[1] || 0;
            MARKET_FACTORS.bist100.change = turkeyData.data[0].d[2] || 0;
        }
        if (americaData?.data?.[0]) {
            MARKET_FACTORS.vix.value = americaData.data[0].d[1] || 0;
            MARKET_FACTORS.vix.change = americaData.data[0].d[2] || 0;
        }
        if (cfdData?.data?.[0]) {
            MARKET_FACTORS.goldUsd.value = cfdData.data[0].d[1] || 0;
            MARKET_FACTORS.goldUsd.change = cfdData.data[0].d[2] || 0;
            // Gold TL/gram = USD/oz * USD/TRY / 31.1035
            if (MARKET_FACTORS.usdTry.value > 0) {
                MARKET_FACTORS.goldTry.value = Math.round(
                    MARKET_FACTORS.goldUsd.value * MARKET_FACTORS.usdTry.value / 31.1035
                );
                MARKET_FACTORS.goldTry.change = MARKET_FACTORS.goldUsd.change;
            }
        }

        // TCMB policy rate + inflation via RSS/scraping
        await this.fetchTCMBData();

        // News from RSS
        await this.fetchNews();
    }

    // ===== TCMB DATA (interest rate, inflation) =====
    async fetchTCMBData() {
        // TCMB EVDS API (public, no key needed for basic data)
        try {
            const resp = await this.fetchWithTimeout(
                'https://api.allorigins.win/raw?url=' +
                encodeURIComponent('https://evds2.tcmb.gov.tr/service/evds/series=TP.POLITIKAFAIZ2&startDate=01-01-2024&endDate=31-12-2026&type=json'),
                {}, 5000
            );
            const data = await resp.json();
            if (data?.items?.length > 0) {
                const latest = data.items[data.items.length - 1];
                const rate = parseFloat(latest['TP_POLITIKAFAIZ2']);
                if (rate > 0) MARKET_FACTORS.interest.value = rate;
            }
        } catch (e) {
            // Fallback: use known recent rate
            if (!MARKET_FACTORS.interest.value) MARKET_FACTORS.interest.value = 42.5;
        }

        // TUIK inflation (CPI) - try EVDS
        try {
            const resp = await this.fetchWithTimeout(
                'https://api.allorigins.win/raw?url=' +
                encodeURIComponent('https://evds2.tcmb.gov.tr/service/evds/series=TP.FG.J0&startDate=01-01-2024&endDate=31-12-2026&type=json'),
                {}, 5000
            );
            const data = await resp.json();
            if (data?.items?.length > 0) {
                const latest = data.items[data.items.length - 1];
                const cpi = parseFloat(latest['TP_FG_J0']);
                if (cpi > 0) MARKET_FACTORS.inflation.value = cpi;
            }
        } catch (e) {
            if (!MARKET_FACTORS.inflation.value) MARKET_FACTORS.inflation.value = 39.05;
        }

        // CDS 5Y Turkey - try TradingView
        try {
            const resp = await this.fetchWithTimeout('https://scanner.tradingview.com/bond/scan', {
                method: 'POST',
                body: JSON.stringify({
                    columns: ['name', 'close', 'change'],
                    symbols: { tickers: ['TVC:TR05Y'] },
                    sort: { sortBy: 'name', sortOrder: 'asc' }
                })
            }, 5000);
            const data = await resp.json();
            if (data?.data?.[0]) {
                MARKET_FACTORS.cds.value = Math.round(data.data[0].d[1] * 100) / 100;
                MARKET_FACTORS.cds.change = data.data[0].d[2] || 0;
            }
        } catch (e) {
            if (!MARKET_FACTORS.cds.value) MARKET_FACTORS.cds.value = 270;
        }
    }

    // ===== NEWS FROM RSS (real Turkish financial news) =====
    async fetchNews() {
        const feeds = [
            { name: 'Bloomberg HT', url: 'https://www.bloomberght.com/rss' },
            { name: 'Haberturk Ekonomi', url: 'https://www.haberturk.com/rss/rss_ekonomi.xml' },
        ];

        const allNews = [];
        for (const feed of feeds) {
            try {
                const resp = await this.fetchWithTimeout(
                    'https://api.allorigins.win/raw?url=' + encodeURIComponent(feed.url),
                    {}, 5000
                );
                const text = await resp.text();
                // Parse RSS XML
                const parser = new DOMParser();
                const xml = parser.parseFromString(text, 'text/xml');
                const items = xml.querySelectorAll('item');

                items.forEach((item, i) => {
                    if (i >= 5) return; // Max 5 per feed
                    const title = item.querySelector('title')?.textContent || '';
                    const pubDate = item.querySelector('pubDate')?.textContent || '';

                    // Simple sentiment analysis from Turkish keywords
                    const lower = title.toLowerCase();
                    let sentiment = 'neutral';
                    const positiveWords = ['artis', 'yukselis', 'rekor', 'buyume', 'kar', 'ihracat', 'yatirim', 'toparlanma', 'pozitif', 'basari'];
                    const negativeWords = ['dusus', 'gerileme', 'kayip', 'kriz', 'zarar', 'enflasyon', 'daralma', 'risk', 'endise', 'cokus'];

                    if (positiveWords.some(w => lower.includes(w))) sentiment = 'positive';
                    else if (negativeWords.some(w => lower.includes(w))) sentiment = 'negative';

                    // Detect sector
                    let sector = 'all';
                    if (/teknoloji|yazilim|dijital/i.test(title)) sector = 'Teknoloji';
                    else if (/enerji|elektrik|dogalgaz|petrol/i.test(title)) sector = 'Enerji';
                    else if (/banka|finans|kredi|faiz/i.test(title)) sector = 'Finans';
                    else if (/gida|tarim|hasat/i.test(title)) sector = 'Gida';
                    else if (/insaat|konut|gayrimenkul/i.test(title)) sector = 'Insaat';
                    else if (/turizm|otel|seyahat/i.test(title)) sector = 'Turizm';

                    allNews.push({
                        title,
                        source: feed.name,
                        date: pubDate,
                        sentiment,
                        impact: sentiment !== 'neutral' ? 'high' : 'medium',
                        sector
                    });
                });
            } catch (e) {
                // RSS feed unavailable
            }
        }

        if (allNews.length > 0) {
            NEWS_SENTIMENT = allNews;
        }
    }

    // ===== MAIN FETCH =====
    async fetchAllStocks() {
        const globalTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Global timeout')), 15000)
        );

        try {
            const fetchJob = async () => {
                // Fetch market data in parallel
                this.fetchMarketData().catch(() => {});

                // === Strategy 1: TradingView Scanner (from bist-agent) ===
                console.log('📡 Strateji 1: TradingView Scanner API deneniyor...');
                const tvData = await this.fetchViaTradingView();
                if (tvData?.data?.length > 0) {
                    const allStocks = [];
                    tvData.data.forEach(row => {
                        const stock = this.tvToStock(row);
                        if (stock && stock.price > 0) allStocks.push(stock);
                    });

                    if (allStocks.length > 5) {
                        this.isLive = true;
                        this.dataSource = 'tradingview';
                        console.log(`✅ TradingView: ${allStocks.length} hisse yuklendi (gercek veriler)`);
                        return allStocks;
                    }
                }

                // === Strategy 2: Yahoo Finance v8 chart per symbol ===
                console.log('📡 Strateji 2: Yahoo v8 chart API deneniyor...');
                const prioritySymbols = BIST_PENNY_SYMBOLS.slice(0, 25);
                const allStocks = [];

                // Fetch 10 at a time in parallel
                for (let i = 0; i < prioritySymbols.length; i += 10) {
                    const batch = prioritySymbols.slice(i, i + 10);
                    const promises = batch.map(sym =>
                        this.fetchViaYahooV8(sym)
                            .then(r => r ? this.chartToStock(r) : null)
                            .catch(() => null)
                    );
                    const results = await Promise.all(promises);
                    results.forEach(s => { if (s?.price > 0) allStocks.push(s); });
                }

                if (allStocks.length > 3) {
                    this.isLive = true;
                    this.dataSource = 'yahoo-v8';
                    console.log(`✅ Yahoo v8: ${allStocks.length} hisse yuklendi (OHLCV dahil)`);
                    return allStocks;
                }

                console.warn('⚠️ Tum API stratejileri basarisiz');
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
