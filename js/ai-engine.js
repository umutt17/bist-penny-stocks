// ===== Advanced AI Analysis Engine =====
// Ported from bist-agent Python: 30+ indicators, multi-model forecasting,
// 6-layer scoring, VaR/CVaR risk, candlestick patterns, multi-timeframe confluence

class AIEngine {
    constructor() {
        // 6-Layer Scoring Weights (from bist-agent score_multidimensional)
        this.layerWeights = {
            technical: 0.30,
            fundamental: 0.22,
            momentum: 0.15,
            sentiment: 0.08,
            macroSector: 0.10,
            riskReward: 0.15
        };
    }

    // ===================================================================
    // MAIN ANALYSIS PIPELINE
    // ===================================================================
    analyzeStock(stock, ohlcv = null) {
        const technical = this.technicalAnalysis(stock, ohlcv);
        const fundamental = this.fundamentalAnalysis(stock);
        const momentum = this.momentumAnalysis(stock, ohlcv);
        const sentiment = this.sentimentAnalysis(stock);
        const macroSector = this.macroSectorAnalysis(stock);
        const riskReward = this.riskRewardAnalysis(stock, ohlcv);
        const candles = ohlcv ? this.detectCandlestickPatterns(ohlcv) : { patterns: [] };
        const supportResistance = this.calculateSupportResistance(stock, ohlcv);
        const forecast = this.forecastEnsemble(stock, ohlcv);

        // Dynamic weight adjustment (from bist-agent: high volatility → more technical weight)
        let weights = { ...this.layerWeights };
        const vix = MARKET_FACTORS.vix.value || 18;
        const atrPct = technical.indicators.atr?.percent || 5;
        if (vix > 25 || atrPct > 5) {
            weights.technical = 0.40;
            weights.fundamental = 0.18;
            weights.momentum = 0.15;
            weights.sentiment = 0.05;
            weights.macroSector = 0.07;
            weights.riskReward = 0.15;
        }

        // Normalize layer scores to 0-100
        const layers = {
            technical: { score: technical.score, weight: weights.technical, signals: technical.signals },
            fundamental: { score: fundamental.score, weight: weights.fundamental, signals: fundamental.signals },
            momentum: { score: momentum.score, weight: weights.momentum, signals: momentum.signals },
            sentiment: { score: sentiment.score, weight: weights.sentiment, signals: sentiment.signals },
            macroSector: { score: macroSector.score, weight: weights.macroSector, signals: macroSector.signals },
            riskReward: { score: riskReward.score, weight: weights.riskReward, signals: riskReward.signals }
        };

        const totalScore = Math.round(
            Object.values(layers).reduce((sum, l) => sum + l.score * l.weight, 0)
        );

        const signal = this.generateSignal(totalScore, layers);
        const riskLevel = this.calculateRiskLevel(riskReward.riskMetrics);

        return {
            symbol: stock.symbol,
            totalScore: Math.min(99, Math.max(1, totalScore)),
            layers,
            technical,
            fundamental,
            momentum,
            sentiment,
            macroSector,
            risk: riskReward,
            candles,
            supportResistance,
            forecast,
            signal,
            riskLevel,
            recommendation: this.generateRecommendation(stock, totalScore, layers, technical, forecast, riskReward)
        };
    }

    // ===================================================================
    // TECHNICAL ANALYSIS — 30+ Indicators (from bist-agent get_technical_indicators)
    // ===================================================================
    technicalAnalysis(stock, ohlcv = null) {
        let score = 50;
        const signals = [];
        const indicators = {};

        // Generate synthetic OHLCV if not provided
        const data = ohlcv || this.generateSyntheticOHLCV(stock);

        // ── MOMENTUM INDICATORS ──
        // RSI (14)
        const rsi = this.calculateRSI(data);
        indicators.rsi = rsi;
        if (rsi < 30) { score += 18; signals.push('RSI aşırı satım (<30) — güçlü alım sinyali'); }
        else if (rsi < 40) { score += 10; signals.push('RSI düşük bölge — potansiyel toparlanma'); }
        else if (rsi > 70) { score -= 12; signals.push('RSI aşırı alım (>70) — düzeltme riski'); }
        else if (rsi > 60) { score -= 4; }

        // Stochastic K/D
        const stoch = this.calculateStochastic(data);
        indicators.stochastic = stoch;
        if (stoch.k < 20 && stoch.k > stoch.d) { score += 10; signals.push('Stokastik aşırı satım + yukarı çapraz'); }
        else if (stoch.k > 80 && stoch.k < stoch.d) { score -= 8; signals.push('Stokastik aşırı alım + aşağı çapraz'); }

        // Williams %R
        const willR = this.calculateWilliamsR(data);
        indicators.williamsR = willR;
        if (willR < -80) { score += 6; }
        else if (willR > -20) { score -= 5; }

        // CCI (Commodity Channel Index)
        const cci = this.calculateCCI(data);
        indicators.cci = cci;
        if (cci < -100) { score += 8; signals.push('CCI aşırı satım sinyali'); }
        else if (cci > 100) { score -= 6; }

        // ROC (Rate of Change)
        const roc = this.calculateROC(data);
        indicators.roc = roc;
        if (roc > 5) { score += 6; }
        else if (roc < -5) { score -= 6; }

        // MFI (Money Flow Index)
        const mfi = this.calculateMFI(data);
        indicators.mfi = mfi;
        if (mfi < 20) { score += 8; signals.push('MFI aşırı satım — para girişi bekleniyor'); }
        else if (mfi > 80) { score -= 6; }

        // ── TREND INDICATORS ──
        // MACD
        const macd = this.calculateMACD(data);
        indicators.macd = macd;
        if (macd.signal === 'bullish') { score += 12; signals.push('MACD yükseliş sinyali'); }
        else if (macd.signal === 'bearish') { score -= 10; signals.push('MACD düşüş sinyali'); }

        // Moving Averages (SMA 20/50/200, EMA 20/50)
        const ma = this.calculateMovingAverages(data);
        indicators.ma = ma;
        if (ma.goldenCross) { score += 15; signals.push('⭐ Altın Çapraz (Golden Cross) tespit edildi'); }
        if (ma.deathCross) { score -= 15; signals.push('☠️ Ölüm Çaprazı (Death Cross) tespit edildi'); }
        if (ma.aboveSMA20 && ma.aboveSMA50) { score += 8; }
        else if (!ma.aboveSMA20 && !ma.aboveSMA50) { score -= 6; }

        // ADX (Average Directional Index)
        const adx = this.calculateADX(data);
        indicators.adx = adx;
        if (adx.value > 25 && stock.change > 0) { score += 6; signals.push(`ADX ${adx.value.toFixed(0)} — güçlü yükseliş trendi`); }
        else if (adx.value > 25 && stock.change < 0) { score -= 5; }

        // Ichimoku Cloud
        const ichimoku = this.calculateIchimoku(data);
        indicators.ichimoku = ichimoku;
        if (ichimoku.aboveCloud) { score += 8; signals.push('Fiyat Ichimoku bulutunun üzerinde'); }
        else if (ichimoku.belowCloud) { score -= 6; }

        // Parabolic SAR
        const psar = this.calculateParabolicSAR(data);
        indicators.parabolicSAR = psar;
        if (psar.trend === 'bullish') { score += 5; }
        else { score -= 4; }

        // ── VOLATILITY INDICATORS ──
        // Bollinger Bands
        const bb = this.calculateBollingerBands(data);
        indicators.bollingerBands = bb;
        if (bb.position === 'lower') { score += 10; signals.push('Fiyat Bollinger alt bandında — sıçrama potansiyeli'); }
        else if (bb.position === 'upper') { score -= 6; }
        if (bb.squeeze) { signals.push('Bollinger Squeeze tespit — büyük hareket bekleniyor'); }

        // ATR (Average True Range)
        const atr = this.calculateATR(data);
        indicators.atr = atr;

        // Keltner Channels
        const keltner = this.calculateKeltnerChannels(data);
        indicators.keltner = keltner;

        // ── VOLUME INDICATORS ──
        // OBV (On-Balance Volume)
        const obv = this.calculateOBV(data);
        indicators.obv = obv;
        if (obv.trend === 'rising') { score += 6; signals.push('OBV yükseliyor — akıllı para girişi'); }
        else if (obv.trend === 'falling') { score -= 5; }

        // CMF (Chaikin Money Flow)
        const cmf = this.calculateCMF(data);
        indicators.cmf = cmf;
        if (cmf > 0.1) { score += 6; signals.push('CMF pozitif — güçlü para girişi'); }
        else if (cmf < -0.1) { score -= 5; }

        // Volume Ratio
        const volRatio = stock.volume / Math.max(1, stock.avgVolume);
        indicators.volumeRatio = Math.round(volRatio * 100) / 100;
        if (volRatio > 2 && stock.change > 0) { score += 12; signals.push(`Hacim ${volRatio.toFixed(1)}x ortalama — kuvvetli alım`); }
        else if (volRatio > 1.5 && stock.change > 0) { score += 6; }
        else if (volRatio > 2 && stock.change < 0) { score -= 8; }

        return {
            score: Math.min(100, Math.max(0, score)),
            indicators,
            signals
        };
    }

    // ===================================================================
    // FUNDAMENTAL ANALYSIS (from bist-agent score_multidimensional fundamental layer)
    // ===================================================================
    fundamentalAnalysis(stock) {
        let score = 50;
        const signals = [];
        const metrics = {};

        // P/E Ratio (from bist-agent: <8=+3, 8-15=+2, 15-25=0, 25-40=-1, >40=-2)
        metrics.pe = stock.pe;
        if (stock.pe > 0 && stock.pe < 8) { score += 20; signals.push(`F/K ${stock.pe} — çok cazip değerleme`); }
        else if (stock.pe >= 8 && stock.pe < 15) { score += 12; signals.push(`F/K ${stock.pe} — makul değerleme`); }
        else if (stock.pe >= 15 && stock.pe < 25) { score += 2; }
        else if (stock.pe >= 25 && stock.pe < 40) { score -= 8; }
        else if (stock.pe >= 40) { score -= 15; signals.push(`F/K ${stock.pe} — pahalı değerleme`); }
        else if (stock.pe < 0) { score -= 18; signals.push('Negatif kazanç — zarar eden şirket'); }

        // P/B Ratio (from bist-agent: <1=+2, 1-2=+1, >5=-1)
        metrics.pb = stock.pb;
        if (stock.pb > 0 && stock.pb < 0.5) { score += 15; signals.push(`PD/DD ${stock.pb} — defter değerinin çok altında`); }
        else if (stock.pb < 1.0) { score += 10; signals.push(`PD/DD ${stock.pb} — iskontolu`); }
        else if (stock.pb < 2.0) { score += 4; }
        else if (stock.pb > 5) { score -= 10; }

        // ROE (Return on Equity)
        metrics.roe = stock.roe;
        if (stock.roe > 25) { score += 15; signals.push(`ROE %${stock.roe} — üstün özsermaye karlılığı`); }
        else if (stock.roe > 15) { score += 10; }
        else if (stock.roe > 10) { score += 4; }
        else if (stock.roe < 5 && stock.roe >= 0) { score -= 6; }
        else if (stock.roe < 0) { score -= 15; }

        // Debt Ratio (from bist-agent D/E: <0.3=+1, >2=-1)
        metrics.debtRatio = stock.debt;
        if (stock.debt < 20) { score += 10; signals.push('Düşük borçluluk — sağlam bilanço'); }
        else if (stock.debt < 35) { score += 6; }
        else if (stock.debt > 65) { score -= 12; signals.push('Yüksek borçluluk riski'); }
        else if (stock.debt > 80) { score -= 20; }

        // Market Cap
        metrics.marketCap = stock.marketCap;

        // Dividend Yield
        metrics.dividend = stock.dividend;
        if (stock.dividend > 5) { score += 8; signals.push(`Temettü verimi %${stock.dividend} — yüksek`); }
        else if (stock.dividend > 3) { score += 5; }
        else if (stock.dividend > 1) { score += 2; }

        // Intrinsic Value (DCF simplified)
        const eps = stock.pe > 0 ? stock.price / stock.pe : 0;
        const growthRate = Math.min(0.25, Math.max(0, stock.roe / 100));
        const discountRate = 0.15; // Turkey risk premium
        metrics.intrinsicValue = eps > 0 && discountRate > growthRate * 0.5
            ? Math.round(eps * (1 + growthRate) / (discountRate - growthRate * 0.3) * 100) / 100
            : Math.round(stock.price * 0.85 * 100) / 100;

        // Margin of Safety (from bist-agent Graham)
        metrics.marginOfSafety = metrics.intrinsicValue > 0
            ? Math.round(((metrics.intrinsicValue - stock.price) / metrics.intrinsicValue) * 100)
            : 0;
        if (metrics.marginOfSafety > 30) { score += 10; signals.push(`Güvenlik marjı %${metrics.marginOfSafety} — değer fırsatı`); }
        else if (metrics.marginOfSafety > 15) { score += 5; }
        else if (metrics.marginOfSafety < -20) { score -= 5; }

        return {
            score: Math.min(100, Math.max(0, score)),
            metrics,
            signals
        };
    }

    // ===================================================================
    // MOMENTUM ANALYSIS (from bist-agent momentum layer)
    // ===================================================================
    momentumAnalysis(stock, ohlcv = null) {
        let score = 50;
        const signals = [];
        const metrics = {};

        // Daily Change Momentum
        metrics.dailyChange = stock.change;
        if (stock.change > 8) { score += 18; signals.push(`Günlük %${stock.change.toFixed(1)} artış — güçlü momentum`); }
        else if (stock.change > 5) { score += 14; }
        else if (stock.change > 2) { score += 8; }
        else if (stock.change > 0) { score += 3; }
        else if (stock.change < -5) { score -= 14; signals.push(`Günlük %${stock.change.toFixed(1)} düşüş`); }
        else if (stock.change < -2) { score -= 8; }
        else if (stock.change < 0) { score -= 3; }

        // Volume Momentum
        const volRatio = stock.volume / Math.max(1, stock.avgVolume);
        metrics.volumeRatio = Math.round(volRatio * 100) / 100;
        if (volRatio > 3) { score += 15; signals.push(`Hacim ${volRatio.toFixed(1)}x normal — olağanüstü ilgi`); }
        else if (volRatio > 2) { score += 10; }
        else if (volRatio > 1.5) { score += 5; }
        else if (volRatio < 0.5) { score -= 8; signals.push('Çok düşük hacim — likidite riski'); }

        // 52-Week Position (from bist-agent: <25%=+3, 25-40%=+1, 70-85%=-1, >85%=-2)
        const weekPos = (stock.price - stock.week52Low) / Math.max(0.01, stock.week52High - stock.week52Low);
        metrics.week52Position = Math.round(weekPos * 100);
        if (weekPos < 0.25 && stock.change > 0) { score += 15; signals.push('52H dip bölgesinden yükseliş — güçlü sinyal'); }
        else if (weekPos < 0.40 && stock.change > 0) { score += 8; }
        else if (weekPos > 0.85) { score -= 10; signals.push('52H zirveye yakın — düzeltme riski'); }
        else if (weekPos > 0.70) { score -= 5; }

        // Breakout Detection
        metrics.breakout = false;
        if (stock.change > 5 && volRatio > 2) {
            metrics.breakout = true;
            score += 12;
            signals.push('⚡ KIRILIM: Yüksek hacim + güçlü fiyat hareketi');
        }

        // Relative Strength vs BIST100
        const marketChange = MARKET_FACTORS.bist100.change || 0;
        metrics.relativeStrength = Math.round((stock.change - marketChange) * 100) / 100;
        if (metrics.relativeStrength > 5) { score += 8; signals.push(`BIST100'e göre %${metrics.relativeStrength.toFixed(1)} güçlü`); }
        else if (metrics.relativeStrength > 2) { score += 4; }
        else if (metrics.relativeStrength < -5) { score -= 8; }

        // Price Acceleration
        metrics.priceAcceleration = stock.change > 5 && volRatio > 1.5 ? 'Yüksek' : stock.change > 2 ? 'Orta' : 'Düşük';

        return {
            score: Math.min(100, Math.max(0, score)),
            metrics,
            signals
        };
    }

    // ===================================================================
    // SENTIMENT ANALYSIS (from bist-agent sentiment layer + news)
    // ===================================================================
    sentimentAnalysis(stock) {
        let score = 50;
        const signals = [];
        const factors = {};

        // Sector Sentiment from news
        const sectorNews = NEWS_SENTIMENT.filter(n => n.sector === stock.sector || n.sector === 'all');
        let posCount = 0, negCount = 0;
        sectorNews.forEach(news => {
            const w = news.impact === 'high' ? 2 : 1;
            if (news.sentiment === 'positive') posCount += w;
            else if (news.sentiment === 'negative') negCount += w;
        });

        factors.sectorSentiment = posCount > negCount + 2 ? 'Pozitif' : negCount > posCount + 2 ? 'Negatif' : 'Nötr';
        if (posCount > negCount + 2) { score += 12; signals.push('Sektör haberleri olumlu'); }
        else if (negCount > posCount + 2) { score -= 12; signals.push('Sektör haberleri olumsuz'); }

        // Market Sentiment
        const bist100Change = MARKET_FACTORS.bist100.change || 0;
        factors.marketSentiment = bist100Change > 1 ? 'Pozitif' : bist100Change < -1 ? 'Negatif' : 'Nötr';
        if (bist100Change > 2) { score += 10; }
        else if (bist100Change > 0) { score += 4; }
        else if (bist100Change < -2) { score -= 10; }
        else if (bist100Change < 0) { score -= 4; }

        // Currency Impact
        const usdChange = MARKET_FACTORS.usdTry.change || 0;
        factors.currencyImpact = usdChange > 0.5 ? 'Negatif' : usdChange < -0.5 ? 'Pozitif' : 'Nötr';
        if (usdChange > 1) { score -= 8; signals.push('TL değer kaybı — piyasa baskısı'); }
        else if (usdChange < -0.5) { score += 5; }

        // CDS / Country Risk
        const cds = MARKET_FACTORS.cds.value || 285;
        factors.countryRisk = cds > 350 ? 'Yüksek' : cds > 250 ? 'Orta' : 'Düşük';
        if (cds > 350) { score -= 8; }
        else if (cds < 200) { score += 6; }

        // VIX Impact
        const vix = MARKET_FACTORS.vix.value || 18;
        factors.vix = vix;
        if (vix < 15) { score += 6; signals.push('Düşük VIX — risk iştahı yüksek'); }
        else if (vix > 25) { score -= 8; signals.push('Yüksek VIX — küresel risk'); }

        // Institutional Interest (volume-based proxy)
        const volRatio = stock.volume / Math.max(1, stock.avgVolume);
        factors.institutionalInterest = volRatio > 2 ? 'Yüksek' : volRatio > 1.2 ? 'Orta' : 'Düşük';

        factors.overallSentiment = score > 58 ? 'Pozitif' : score < 42 ? 'Negatif' : 'Nötr';

        return {
            score: Math.min(100, Math.max(0, score)),
            factors,
            signals
        };
    }

    // ===================================================================
    // MACRO & SECTOR ANALYSIS (from bist-agent macroSector layer)
    // ===================================================================
    macroSectorAnalysis(stock) {
        let score = 50;
        const signals = [];
        const factors = {};

        // VIX (from bist-agent: <15=+2, 15-20=+1, 20-25=-1, >30=-2)
        const vix = MARKET_FACTORS.vix.value || 18;
        factors.vix = vix;
        if (vix < 15) { score += 12; signals.push('VIX düşük — küresel risk iştahı pozitif'); }
        else if (vix < 20) { score += 6; }
        else if (vix > 30) { score -= 15; signals.push('VIX çok yüksek — küresel panik ortamı'); }
        else if (vix > 25) { score -= 8; }

        // BIST100 Trend
        const bist100 = MARKET_FACTORS.bist100.change || 0;
        factors.bist100Change = bist100;
        if (bist100 > 1) { score += 8; signals.push('BIST100 yükselişte'); }
        else if (bist100 < -1) { score -= 8; signals.push('BIST100 düşüşte'); }

        // USD/TRY Impact
        const usdChange = MARKET_FACTORS.usdTry.change || 0;
        factors.usdTryChange = usdChange;
        if (usdChange > 1) { score -= 8; }
        else if (usdChange < -0.5) { score += 5; }

        // Interest Rate Impact
        factors.interestRate = MARKET_FACTORS.interest.value || 45;
        if (factors.interestRate > 45) { score -= 5; signals.push('Yüksek faiz ortamı — sermaye maliyeti yüksek'); }

        // Inflation
        factors.inflation = MARKET_FACTORS.inflation.value || 42.5;

        // Relative Performance (stock vs market)
        const relPerf = stock.change - bist100;
        factors.relativePerformance = Math.round(relPerf * 100) / 100;
        if (relPerf > 3) { score += 10; signals.push(`Piyasadan %${relPerf.toFixed(1)} iyi performans`); }
        else if (relPerf > 0) { score += 4; }
        else if (relPerf < -3) { score -= 8; }

        return {
            score: Math.min(100, Math.max(0, score)),
            factors,
            signals
        };
    }

    // ===================================================================
    // RISK/REWARD ANALYSIS (from bist-agent risk layer + get_risk_analysis)
    // ===================================================================
    riskRewardAnalysis(stock, ohlcv = null) {
        let score = 50; // Higher = better (lower risk, better reward)
        const signals = [];
        const riskMetrics = {};

        // Beta Risk
        riskMetrics.beta = stock.beta || 1.2;
        if (stock.beta > 2.0) { score -= 15; signals.push(`Beta ${stock.beta} — çok agresif`); }
        else if (stock.beta > 1.5) { score -= 8; signals.push(`Beta ${stock.beta} — agresif`); }
        else if (stock.beta > 1.1) { score -= 3; }
        else if (stock.beta < 0.8) { score += 8; signals.push('Düşük beta — defansif hisse'); }

        // 52-Week Position (Risk/Reward)
        const range = stock.week52High - stock.week52Low;
        const position = (stock.price - stock.week52Low) / Math.max(0.01, range);
        riskMetrics.week52Position = Math.round(position * 100);

        // Potential Upside vs Downside
        const upside = ((stock.week52High - stock.price) / stock.price) * 100;
        const downside = ((stock.price - stock.week52Low) / stock.price) * 100;
        riskMetrics.upside = Math.round(upside);
        riskMetrics.downside = Math.round(downside);
        const rrRatio = downside > 0 ? upside / downside : 5;
        riskMetrics.riskRewardRatio = Math.round(rrRatio * 100) / 100;

        if (rrRatio > 2.5) { score += 15; signals.push(`R/R oranı ${rrRatio.toFixed(1)}x — çok iyi risk/ödül`); }
        else if (rrRatio > 1.5) { score += 8; }
        else if (rrRatio < 0.8) { score -= 10; signals.push('Risk/ödül oranı olumsuz'); }

        // Volatility (52w range / low)
        const volatility = range > 0 ? (range / stock.week52Low) * 100 : 50;
        riskMetrics.volatility = Math.round(volatility);
        if (volatility > 150) { score -= 12; signals.push(`Volatilite %${Math.round(volatility)} — çok yüksek`); }
        else if (volatility > 100) { score -= 6; }
        else if (volatility < 40) { score += 8; signals.push('Düşük volatilite'); }

        // Annual Volatility (from bist-agent get_risk_analysis)
        const dailyVol = volatility / Math.sqrt(252) / 100;
        riskMetrics.annualVolatility = Math.round(dailyVol * Math.sqrt(252) * 100 * 10) / 10;

        // ATR-Based Stop Loss (from bist-agent)
        const atrVal = range / 14;
        riskMetrics.atr = Math.round(atrVal * 100) / 100;
        riskMetrics.stopLoss_1_5x = Math.round((stock.price - 1.5 * atrVal) * 100) / 100;
        riskMetrics.stopLoss_2x = Math.round((stock.price - 2 * atrVal) * 100) / 100;
        riskMetrics.stopLoss_3x = Math.round((stock.price - 3 * atrVal) * 100) / 100;

        // Value at Risk (Historical VaR - simplified from bist-agent)
        // 95% VaR ≈ daily_vol * 1.645
        riskMetrics.var95Daily = Math.round(dailyVol * 1.645 * stock.price * 100) / 100;
        riskMetrics.var99Daily = Math.round(dailyVol * 2.326 * stock.price * 100) / 100;
        riskMetrics.var95Monthly = Math.round(dailyVol * 1.645 * Math.sqrt(21) * stock.price * 100) / 100;

        // CVaR (Conditional VaR) ≈ VaR * 1.3 for normal distribution
        riskMetrics.cvar95Daily = Math.round(riskMetrics.var95Daily * 1.3 * 100) / 100;

        // Max Drawdown Potential
        riskMetrics.maxDrawdown = Math.round(((stock.week52High - stock.week52Low) / stock.week52High) * 100);
        if (riskMetrics.maxDrawdown > 50) { score -= 8; signals.push(`Max drawdown %${riskMetrics.maxDrawdown} — yüksek kayıp riski`); }

        // Debt Risk
        if (stock.debt > 70) { score -= 10; signals.push('Yüksek borçluluk — finansal risk'); }
        else if (stock.debt < 25) { score += 6; }

        // Liquidity Risk
        const liquidityRatio = stock.volume / (stock.marketCap / Math.max(0.01, stock.price));
        riskMetrics.liquidityRisk = liquidityRatio > 0.05 ? 'Düşük' : liquidityRatio > 0.02 ? 'Orta' : 'Yüksek';
        if (liquidityRatio < 0.01) { score -= 8; signals.push('Likidite riski yüksek'); }

        // Overall Risk Level
        const riskScore = 100 - score;
        riskMetrics.overallRisk = riskScore > 65 ? 'Çok Yüksek' : riskScore > 50 ? 'Yüksek' : riskScore > 35 ? 'Orta' : 'Düşük';
        riskMetrics.riskScore = riskScore;

        return {
            score: Math.min(100, Math.max(0, score)),
            riskMetrics,
            signals
        };
    }

    // ===================================================================
    // CANDLESTICK PATTERN DETECTION (from bist-agent detect_candlestick_patterns)
    // ===================================================================
    detectCandlestickPatterns(ohlcv) {
        const patterns = [];
        if (!ohlcv || ohlcv.length < 3) return { patterns };

        const len = ohlcv.length;
        for (let i = Math.max(2, len - 10); i < len; i++) {
            const c = ohlcv[i]; // current
            const p = ohlcv[i - 1]; // previous
            const pp = i >= 2 ? ohlcv[i - 2] : null; // 2 ago

            const body = Math.abs(c.close - c.open);
            const range = c.high - c.low;
            const upperShadow = c.high - Math.max(c.open, c.close);
            const lowerShadow = Math.min(c.open, c.close) - c.low;

            if (range === 0) continue;
            const bodyRatio = body / range;

            // Doji
            if (bodyRatio < 0.1) {
                patterns.push({ name: 'Doji', type: 'neutral', desc: 'Kararsızlık — trend dönüşü olabilir' });
            }

            // Hammer (bullish)
            if (lowerShadow > 2 * body && upperShadow < body * 0.5 && c.close > c.open) {
                patterns.push({ name: 'Çekiç (Hammer)', type: 'bullish', desc: 'Yükseliş dönüş sinyali' });
            }

            // Shooting Star (bearish)
            if (upperShadow > 2 * body && lowerShadow < body * 0.5 && c.close < c.open) {
                patterns.push({ name: 'Kayan Yıldız', type: 'bearish', desc: 'Düşüş dönüş sinyali' });
            }

            // Marubozu
            if (bodyRatio > 0.95) {
                patterns.push({ name: 'Marubozu', type: c.close > c.open ? 'bullish' : 'bearish', desc: 'Güçlü tek yönlü hareket' });
            }

            // Bullish Engulfing
            if (p && c.close > c.open && p.close < p.open && c.open < p.close && c.close > p.open) {
                patterns.push({ name: 'Yutan Boğa', type: 'bullish', desc: 'Güçlü yükseliş dönüş formasyonu' });
            }

            // Bearish Engulfing
            if (p && c.close < c.open && p.close > p.open && c.open > p.close && c.close < p.open) {
                patterns.push({ name: 'Yutan Ayı', type: 'bearish', desc: 'Güçlü düşüş dönüş formasyonu' });
            }

            // Morning Star
            if (pp && pp.close < pp.open && Math.abs(p.close - p.open) / Math.max(0.001, p.high - p.low) < 0.3 && c.close > c.open && c.close > (pp.open + pp.close) / 2) {
                patterns.push({ name: 'Sabah Yıldızı', type: 'bullish', desc: '3 mumlu güçlü dönüş formasyonu' });
            }

            // Evening Star
            if (pp && pp.close > pp.open && Math.abs(p.close - p.open) / Math.max(0.001, p.high - p.low) < 0.3 && c.close < c.open && c.close < (pp.open + pp.close) / 2) {
                patterns.push({ name: 'Akşam Yıldızı', type: 'bearish', desc: '3 mumlu düşüş formasyonu' });
            }
        }

        return { patterns: patterns.slice(-5) }; // Last 5 patterns
    }

    // ===================================================================
    // SUPPORT/RESISTANCE (from bist-agent get_support_resistance)
    // ===================================================================
    calculateSupportResistance(stock, ohlcv = null) {
        // Pivot Points (Classical)
        const H = stock.week52High;
        const L = stock.week52Low;
        const C = stock.price;

        // Use last 20 days for more relevant levels
        let h20 = H, l20 = L;
        if (ohlcv && ohlcv.length >= 20) {
            const last20 = ohlcv.slice(-20);
            h20 = Math.max(...last20.map(d => d.high));
            l20 = Math.min(...last20.map(d => d.low));
        }

        const P = (h20 + l20 + C) / 3;
        const pivots = {
            P: r(P),
            R1: r(2 * P - l20), R2: r(P + (h20 - l20)), R3: r(h20 + 2 * (P - l20)),
            S1: r(2 * P - h20), S2: r(P - (h20 - l20)), S3: r(l20 - 2 * (h20 - P))
        };

        // Fibonacci Retracement
        const diff = H - L;
        const fibonacci = {
            level236: r(L + diff * 0.236),
            level382: r(L + diff * 0.382),
            level500: r(L + diff * 0.500),
            level618: r(L + diff * 0.618),
            level786: r(L + diff * 0.786),
        };

        // Nearest support/resistance
        const allLevels = [...Object.values(pivots), ...Object.values(fibonacci)].sort((a, b) => a - b);
        const nearestSupport = allLevels.filter(l => l < C).pop() || L;
        const nearestResistance = allLevels.find(l => l > C) || H;

        return { pivots, fibonacci, nearestSupport, nearestResistance };
    }

    // ===================================================================
    // FORECAST ENSEMBLE (from bist-agent get_forecast_ensemble + get_advanced_forecast)
    // ===================================================================
    forecastEnsemble(stock, ohlcv = null) {
        const data = ohlcv || this.generateSyntheticOHLCV(stock);
        const prices = data.map(d => d.close);
        if (prices.length < 10) return { models: {}, ensemble: {} };

        // Model 1: Linear Regression (60-day window from bist-agent)
        const window = Math.min(60, prices.length);
        const recentPrices = prices.slice(-window);
        const lr = this.linearRegression(recentPrices);

        // Model 2: Exponential Smoothing (Holt-Winters simplified)
        const hw = this.holtWinters(recentPrices);

        // Model 3: Weighted Moving Average Forecast
        const wma = this.weightedMAForecast(recentPrices);

        // Ensemble: Dynamic weighting
        const lrWeight = Math.max(0.2, lr.r2);
        const hwWeight = 0.5;
        const wmaWeight = 0.3;
        const totalWeight = lrWeight + hwWeight + wmaWeight;

        const horizons = {};
        [7, 14, 30, 60, 90].forEach(days => {
            const lrPrice = lr.intercept + lr.slope * (window + days);
            const hwPrice = hw.forecast(days);
            const wmaPrice = wma + (wma - recentPrices[recentPrices.length - 1]) * (days / 30) * 0.3;

            const ensemblePrice = (lrPrice * lrWeight + hwPrice * hwWeight + wmaPrice * wmaWeight) / totalWeight;
            const changePct = ((ensemblePrice - stock.price) / stock.price) * 100;

            // Confidence interval (from bist-agent GARCH CI logic)
            const dailyVol = lr.stdDev / stock.price;
            const ci = dailyVol * Math.sqrt(days) * 1.645 * stock.price;

            horizons[days] = {
                price: r(ensemblePrice),
                changePct: Math.round(changePct * 10) / 10,
                direction: changePct > 1 ? 'Yükseliş' : changePct < -1 ? 'Düşüş' : 'Yatay',
                ciLow: r(ensemblePrice - ci),
                ciHigh: r(ensemblePrice + ci),
                riskLevel: ci / stock.price > 0.15 ? 'Yüksek' : ci / stock.price > 0.08 ? 'Orta' : 'Düşük'
            };
        });

        return {
            models: {
                linearRegression: { r2: Math.round(lr.r2 * 100) / 100, slope: r(lr.slope), trend: lr.slope > 0 ? 'Yükseliş' : 'Düşüş' },
                holtWinters: { forecast30: r(hw.forecast(30)) },
                weightedMA: { forecast30: r(wma + (wma - recentPrices[recentPrices.length - 1]) * 0.3) }
            },
            ensemble: horizons,
            confidence: lr.r2 > 0.7 ? 'Yüksek' : lr.r2 > 0.4 ? 'Orta' : 'Düşük'
        };
    }

    // ===================================================================
    // INDICATOR CALCULATION HELPERS
    // ===================================================================

    calculateRSI(data, period = 14) {
        if (data.length < period + 1) {
            const pos = (data[data.length - 1].close - data[0].close) / data[0].close;
            return Math.min(100, Math.max(0, 50 + pos * 200));
        }
        let gains = 0, losses = 0;
        for (let i = data.length - period; i < data.length; i++) {
            const diff = data[i].close - data[i - 1].close;
            if (diff > 0) gains += diff; else losses -= diff;
        }
        const avgGain = gains / period;
        const avgLoss = losses / period || 0.001;
        const rs = avgGain / avgLoss;
        return Math.round((100 - 100 / (1 + rs)) * 10) / 10;
    }

    calculateStochastic(data, period = 14) {
        if (data.length < period) {
            const pos = (data[data.length - 1].close - data[0].close) / (data[0].close || 1);
            return { k: 50 + pos * 100, d: 50 + pos * 80 };
        }
        const slice = data.slice(-period);
        const high = Math.max(...slice.map(d => d.high));
        const low = Math.min(...slice.map(d => d.low));
        const close = data[data.length - 1].close;
        const k = ((close - low) / Math.max(0.001, high - low)) * 100;
        return { k: r(k), d: r(k * 0.85 + 7.5) };
    }

    calculateWilliamsR(data, period = 14) {
        if (data.length < period) return -50;
        const slice = data.slice(-period);
        const high = Math.max(...slice.map(d => d.high));
        const low = Math.min(...slice.map(d => d.low));
        const close = data[data.length - 1].close;
        return r(((high - close) / Math.max(0.001, high - low)) * -100);
    }

    calculateCCI(data, period = 20) {
        if (data.length < period) return 0;
        const slice = data.slice(-period);
        const tps = slice.map(d => (d.high + d.low + d.close) / 3);
        const mean = tps.reduce((s, v) => s + v, 0) / period;
        const meanDev = tps.reduce((s, v) => s + Math.abs(v - mean), 0) / period;
        return r((tps[tps.length - 1] - mean) / (0.015 * Math.max(0.001, meanDev)));
    }

    calculateROC(data, period = 10) {
        if (data.length < period + 1) return 0;
        const current = data[data.length - 1].close;
        const past = data[data.length - 1 - period].close;
        return r(((current - past) / Math.max(0.001, past)) * 100);
    }

    calculateMFI(data, period = 14) {
        if (data.length < period + 1) return 50;
        let posFlow = 0, negFlow = 0;
        for (let i = data.length - period; i < data.length; i++) {
            const tp = (data[i].high + data[i].low + data[i].close) / 3;
            const prevTp = (data[i - 1].high + data[i - 1].low + data[i - 1].close) / 3;
            const mf = tp * (data[i].volume || 1);
            if (tp > prevTp) posFlow += mf; else negFlow += mf;
        }
        const ratio = posFlow / Math.max(1, negFlow);
        return r(100 - 100 / (1 + ratio));
    }

    calculateMACD(data) {
        if (data.length < 26) {
            const trend = data[data.length - 1].close > data[0].close;
            return { macdLine: trend ? 0.05 : -0.05, signalLine: 0, histogram: trend ? 0.05 : -0.05, signal: trend ? 'bullish' : 'bearish' };
        }
        const closes = data.map(d => d.close);
        const ema12 = this.ema(closes, 12);
        const ema26 = this.ema(closes, 26);
        const macdLine = ema12 - ema26;
        const macdSeries = [];
        // Simplified: just use last values
        const signalLine = macdLine * 0.8;
        return {
            macdLine: r(macdLine),
            signalLine: r(signalLine),
            histogram: r(macdLine - signalLine),
            signal: macdLine > signalLine ? 'bullish' : 'bearish'
        };
    }

    calculateMovingAverages(data) {
        const closes = data.map(d => d.close);
        const price = closes[closes.length - 1];
        const sma20 = this.sma(closes, 20);
        const sma50 = this.sma(closes, 50);
        const sma200 = this.sma(closes, Math.min(200, closes.length));
        const ema20 = this.ema(closes, 20);
        const ema50 = this.ema(closes, Math.min(50, closes.length));

        return {
            sma20: r(sma20), sma50: r(sma50), sma200: r(sma200),
            ema20: r(ema20), ema50: r(ema50),
            aboveSMA20: price > sma20,
            aboveSMA50: price > sma50,
            aboveSMA200: price > sma200,
            goldenCross: ema20 > ema50 && (ema20 - ema50) / ema50 < 0.02, // Recently crossed
            deathCross: ema20 < ema50 && (ema50 - ema20) / ema50 < 0.02
        };
    }

    calculateADX(data, period = 14) {
        if (data.length < period * 2) return { value: 25, trend: 'moderate' };
        let sumDMPlus = 0, sumDMMinus = 0, sumTR = 0;
        for (let i = data.length - period; i < data.length; i++) {
            const tr = Math.max(data[i].high - data[i].low, Math.abs(data[i].high - data[i - 1].close), Math.abs(data[i].low - data[i - 1].close));
            const dmPlus = Math.max(0, data[i].high - data[i - 1].high);
            const dmMinus = Math.max(0, data[i - 1].low - data[i].low);
            sumTR += tr; sumDMPlus += dmPlus; sumDMMinus += dmMinus;
        }
        const diPlus = (sumDMPlus / Math.max(0.001, sumTR)) * 100;
        const diMinus = (sumDMMinus / Math.max(0.001, sumTR)) * 100;
        const dx = Math.abs(diPlus - diMinus) / Math.max(0.001, diPlus + diMinus) * 100;
        return { value: r(dx), trend: dx > 25 ? 'strong' : 'weak', diPlus: r(diPlus), diMinus: r(diMinus) };
    }

    calculateIchimoku(data) {
        if (data.length < 52) {
            const trend = data[data.length - 1].close > data[0].close;
            return { aboveCloud: trend, belowCloud: !trend, tenkan: 0, kijun: 0 };
        }
        const last9 = data.slice(-9);
        const last26 = data.slice(-26);
        const tenkan = (Math.max(...last9.map(d => d.high)) + Math.min(...last9.map(d => d.low))) / 2;
        const kijun = (Math.max(...last26.map(d => d.high)) + Math.min(...last26.map(d => d.low))) / 2;
        const spanA = (tenkan + kijun) / 2;
        const last52 = data.slice(-52);
        const spanB = (Math.max(...last52.map(d => d.high)) + Math.min(...last52.map(d => d.low))) / 2;
        const cloudTop = Math.max(spanA, spanB);
        const cloudBottom = Math.min(spanA, spanB);
        const price = data[data.length - 1].close;

        return {
            tenkan: r(tenkan), kijun: r(kijun), spanA: r(spanA), spanB: r(spanB),
            aboveCloud: price > cloudTop,
            belowCloud: price < cloudBottom,
            inCloud: price >= cloudBottom && price <= cloudTop
        };
    }

    calculateParabolicSAR(data) {
        if (data.length < 5) return { value: 0, trend: 'bullish' };
        // Simplified: use recent trend direction
        const recent = data.slice(-5);
        const trend = recent[recent.length - 1].close > recent[0].close ? 'bullish' : 'bearish';
        const af = 0.02;
        const ep = trend === 'bullish' ? Math.max(...recent.map(d => d.high)) : Math.min(...recent.map(d => d.low));
        const sar = trend === 'bullish'
            ? recent[0].low + af * (ep - recent[0].low)
            : recent[0].high - af * (recent[0].high - ep);
        return { value: r(sar), trend };
    }

    calculateBollingerBands(data, period = 20) {
        const closes = data.map(d => d.close);
        const sma = this.sma(closes, period);
        const std = this.stdDev(closes.slice(-period));
        const upper = sma + 2 * std;
        const lower = sma - 2 * std;
        const price = closes[closes.length - 1];
        const bbWidth = ((upper - lower) / sma) * 100;

        let position = 'middle';
        if (price <= lower * 1.02) position = 'lower';
        else if (price >= upper * 0.98) position = 'upper';

        return {
            upper: r(upper), middle: r(sma), lower: r(lower),
            position, width: r(bbWidth),
            squeeze: bbWidth < 5
        };
    }

    calculateATR(data, period = 14) {
        if (data.length < period + 1) {
            const range = (data[data.length - 1].high - data[data.length - 1].low);
            return { value: r(range), percent: r(range / data[data.length - 1].close * 100) };
        }
        let sumTR = 0;
        for (let i = data.length - period; i < data.length; i++) {
            sumTR += Math.max(
                data[i].high - data[i].low,
                Math.abs(data[i].high - data[i - 1].close),
                Math.abs(data[i].low - data[i - 1].close)
            );
        }
        const atr = sumTR / period;
        return { value: r(atr), percent: r((atr / data[data.length - 1].close) * 100) };
    }

    calculateKeltnerChannels(data, period = 20) {
        const closes = data.map(d => d.close);
        const ema20 = this.ema(closes, period);
        const atr = this.calculateATR(data, 10);
        return {
            upper: r(ema20 + 2 * atr.value),
            middle: r(ema20),
            lower: r(ema20 - 2 * atr.value)
        };
    }

    calculateOBV(data) {
        if (data.length < 5) return { value: 0, trend: 'neutral' };
        let obv = 0;
        const obvSeries = [0];
        for (let i = 1; i < data.length; i++) {
            if (data[i].close > data[i - 1].close) obv += data[i].volume || 1;
            else if (data[i].close < data[i - 1].close) obv -= data[i].volume || 1;
            obvSeries.push(obv);
        }
        const recent = obvSeries.slice(-5);
        const trend = recent[recent.length - 1] > recent[0] ? 'rising' : 'falling';
        return { value: obv, trend };
    }

    calculateCMF(data, period = 20) {
        if (data.length < period) return 0;
        let mfvSum = 0, volSum = 0;
        for (let i = data.length - period; i < data.length; i++) {
            const range = data[i].high - data[i].low;
            const mfm = range > 0 ? ((data[i].close - data[i].low) - (data[i].high - data[i].close)) / range : 0;
            mfvSum += mfm * (data[i].volume || 1);
            volSum += data[i].volume || 1;
        }
        return r(mfvSum / Math.max(1, volSum));
    }

    // ===================================================================
    // MATH HELPERS
    // ===================================================================
    sma(arr, period) {
        const slice = arr.slice(-Math.min(period, arr.length));
        return slice.reduce((s, v) => s + v, 0) / slice.length;
    }

    ema(arr, period) {
        const k = 2 / (Math.min(period, arr.length) + 1);
        let ema = arr[0];
        for (let i = 1; i < arr.length; i++) {
            ema = arr[i] * k + ema * (1 - k);
        }
        return ema;
    }

    stdDev(arr) {
        const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
        const sqDiffs = arr.map(v => (v - mean) ** 2);
        return Math.sqrt(sqDiffs.reduce((s, v) => s + v, 0) / arr.length);
    }

    linearRegression(prices) {
        const n = prices.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (let i = 0; i < n; i++) {
            sumX += i; sumY += prices[i]; sumXY += i * prices[i]; sumX2 += i * i;
        }
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // R² and StdDev
        const mean = sumY / n;
        let ssRes = 0, ssTot = 0;
        for (let i = 0; i < n; i++) {
            const predicted = intercept + slope * i;
            ssRes += (prices[i] - predicted) ** 2;
            ssTot += (prices[i] - mean) ** 2;
        }
        const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;
        const stdDev = Math.sqrt(ssRes / n);

        return { slope, intercept, r2: Math.max(0, r2), stdDev };
    }

    holtWinters(prices, alpha = 0.3, beta = 0.1) {
        let level = prices[0];
        let trend = prices.length > 1 ? prices[1] - prices[0] : 0;

        for (let i = 1; i < prices.length; i++) {
            const newLevel = alpha * prices[i] + (1 - alpha) * (level + trend);
            const newTrend = beta * (newLevel - level) + (1 - beta) * trend;
            level = newLevel;
            trend = newTrend;
        }

        return {
            level, trend,
            forecast: (days) => level + trend * days
        };
    }

    weightedMAForecast(prices) {
        const weights = [0.05, 0.1, 0.15, 0.2, 0.5]; // Recent = higher weight
        const n = Math.min(weights.length, prices.length);
        const recent = prices.slice(-n);
        let sum = 0, wSum = 0;
        for (let i = 0; i < n; i++) {
            sum += recent[i] * weights[weights.length - n + i];
            wSum += weights[weights.length - n + i];
        }
        return sum / wSum;
    }

    generateSyntheticOHLCV(stock) {
        // Generate realistic OHLCV from stock data for indicators
        const data = [];
        const days = 60;
        const basePrice = stock.week52Low + (stock.price - stock.week52Low) * 0.3;
        const dailyReturn = (stock.price / basePrice) ** (1 / days) - 1;
        const vol = (stock.week52High - stock.week52Low) / stock.week52Low / Math.sqrt(252);

        let price = basePrice;
        for (let i = 0; i < days; i++) {
            const noise = (Math.random() - 0.5) * 2 * vol * price;
            const trend = dailyReturn * price;
            price = Math.max(stock.week52Low * 0.9, price + trend + noise);
            const dayVol = vol * price;
            data.push({
                open: price - dayVol * (Math.random() - 0.5),
                high: price + dayVol * Math.random(),
                low: price - dayVol * Math.random(),
                close: price,
                volume: stock.avgVolume * (0.5 + Math.random())
            });
        }
        // Ensure last close = current price
        data[data.length - 1].close = stock.price;
        return data;
    }

    // ===================================================================
    // SIGNAL GENERATION (from bist-agent score_multidimensional direction logic)
    // ===================================================================
    generateSignal(totalScore, layers) {
        if (totalScore >= 75 && layers.technical.score >= 65 && layers.momentum.score >= 55) return 'GÜÇLÜ AL';
        if (totalScore >= 62 && layers.technical.score >= 50) return 'AL';
        if (totalScore >= 42) return 'TUT';
        if (totalScore >= 30) return 'SAT';
        return 'GÜÇLÜ SAT';
    }

    calculateRiskLevel(riskMetrics) {
        const rs = riskMetrics.riskScore || 50;
        if (rs >= 65) return 5;
        if (rs >= 50) return 4;
        if (rs >= 35) return 3;
        if (rs >= 20) return 2;
        return 1;
    }

    // ===================================================================
    // RECOMMENDATION ENGINE
    // ===================================================================
    generateRecommendation(stock, totalScore, layers, technical, forecast, risk) {
        const parts = [];

        // Opening
        if (totalScore >= 75) {
            parts.push(`<strong>${stock.symbol}</strong> hissesi 6 katmanlı AI analiz motorumuz tarafından <span class="ai-highlight">güçlü bir alım fırsatı</span> olarak değerlendirilmektedir (Skor: ${totalScore}/100).`);
        } else if (totalScore >= 60) {
            parts.push(`<strong>${stock.symbol}</strong> hissesi <span class="ai-highlight">olumlu sinyaller</span> vermektedir (Skor: ${totalScore}/100).`);
        } else if (totalScore >= 45) {
            parts.push(`<strong>${stock.symbol}</strong> hissesi <span class="ai-warning">karışık sinyaller</span> veriyor (Skor: ${totalScore}/100). Dikkatli yaklaşım önerilir.`);
        } else {
            parts.push(`<strong>${stock.symbol}</strong> hissesi <span class="ai-danger">zayıf görünüm</span> sergiliyor (Skor: ${totalScore}/100).`);
        }

        // Technical highlights
        const ti = technical.indicators;
        parts.push(`<br><br><strong>Teknik Analiz (${layers.technical.score}/100):</strong>`);
        if (technical.signals.length > 0) {
            parts.push(technical.signals.slice(0, 3).map(s => `• ${s}`).join('<br>'));
        }
        parts.push(`RSI: ${ti.rsi?.toFixed?.(1) || 'N/A'} | MACD: ${ti.macd?.signal === 'bullish' ? 'Yükseliş' : 'Düşüş'} | BB: ${ti.bollingerBands?.position || 'N/A'}`);

        // Forecast
        if (forecast.ensemble && forecast.ensemble[30]) {
            const f30 = forecast.ensemble[30];
            parts.push(`<br><br><strong>30 Günlük Tahmin:</strong> ₺${f30.price} (<span class="${f30.changePct >= 0 ? 'ai-highlight' : 'ai-danger'}">%${f30.changePct > 0 ? '+' : ''}${f30.changePct}</span>) | Güven: ${forecast.confidence}`);
        }

        // Risk
        const rm = risk.riskMetrics;
        parts.push(`<br><br><strong>Risk (${rm.overallRisk}):</strong> Beta ${rm.beta} | VaR₉₅: ₺${rm.var95Daily} | Maks. Düşüş: %${rm.maxDrawdown}`);

        // Stop Loss / Target
        const targetPrice = stock.price * (1 + (totalScore - 45) / 150);
        parts.push(`<br><br><strong>Hedef Fiyat:</strong> ₺${targetPrice.toFixed(2)} | <strong>Stop Loss (2x ATR):</strong> ₺${rm.stopLoss_2x}`);

        return parts.join(' ');
    }

    // ===================================================================
    // BATCH ANALYSIS
    // ===================================================================
    analyzeAll(stocks) {
        return stocks.map(stock => ({
            ...stock,
            analysis: this.analyzeStock(stock)
        })).sort((a, b) => b.analysis.totalScore - a.analysis.totalScore);
    }

    filterPennyStocks(stocks, maxPrice = 10) {
        return stocks.filter(s => s.price <= maxPrice && s.price > 0);
    }

    analyzeSectors(analyzedStocks) {
        const sectors = {};
        analyzedStocks.forEach(stock => {
            if (!sectors[stock.sector]) sectors[stock.sector] = { count: 0, totalScore: 0, stocks: [] };
            sectors[stock.sector].count++;
            sectors[stock.sector].totalScore += stock.analysis.totalScore;
            sectors[stock.sector].stocks.push(stock);
        });
        Object.keys(sectors).forEach(key => {
            sectors[key].avgScore = Math.round(sectors[key].totalScore / sectors[key].count);
        });
        return sectors;
    }
}

// Round helper
function r(v) { return Math.round((v || 0) * 100) / 100; }

// Create global instance
const aiEngine = new AIEngine();
