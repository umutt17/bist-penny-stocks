// ===== AI Analysis Engine =====
// Advanced scoring algorithms for penny stock analysis

class AIEngine {
    constructor() {
        this.weights = {
            technical: 0.25,
            fundamental: 0.25,
            momentum: 0.20,
            sentiment: 0.15,
            risk: 0.15
        };
    }

    // ===== MAIN SCORING =====
    analyzeStock(stock) {
        const technical = this.technicalScore(stock);
        const fundamental = this.fundamentalScore(stock);
        const momentum = this.momentumScore(stock);
        const sentiment = this.sentimentScore(stock);
        const riskScore = this.riskScore(stock);

        const totalScore = Math.round(
            technical.score * this.weights.technical +
            fundamental.score * this.weights.fundamental +
            momentum.score * this.weights.momentum +
            sentiment.score * this.weights.sentiment +
            (100 - riskScore.score) * this.weights.risk
        );

        const signal = this.generateSignal(totalScore, technical, momentum);
        const riskLevel = this.calculateRiskLevel(riskScore.score);

        return {
            symbol: stock.symbol,
            totalScore: Math.min(99, Math.max(1, totalScore)),
            technical,
            fundamental,
            momentum,
            sentiment,
            risk: riskScore,
            signal,
            riskLevel,
            recommendation: this.generateRecommendation(stock, totalScore, technical, fundamental, momentum, sentiment, riskScore)
        };
    }

    // ===== TECHNICAL ANALYSIS =====
    technicalScore(stock) {
        let score = 50;
        const indicators = {};

        // RSI Simulation (Relative Strength Index)
        const rsi = this.calculateRSI(stock);
        indicators.rsi = rsi;
        if (rsi < 30) score += 20; // Oversold - bullish
        else if (rsi < 40) score += 10;
        else if (rsi > 70) score -= 15; // Overbought - bearish
        else if (rsi > 60) score -= 5;

        // MACD Simulation
        const macd = this.calculateMACD(stock);
        indicators.macd = macd;
        if (macd.signal === 'bullish') score += 15;
        else if (macd.signal === 'bearish') score -= 10;

        // Moving Average Analysis
        const ma = this.calculateMA(stock);
        indicators.ma = ma;
        if (ma.aboveMA20) score += 10;
        if (ma.aboveMA50) score += 8;
        if (ma.goldenCross) score += 15;
        if (ma.deathCross) score -= 15;

        // Bollinger Bands
        const bb = this.calculateBollingerBands(stock);
        indicators.bollingerBands = bb;
        if (bb.position === 'lower') score += 12; // Near lower band - potential bounce
        else if (bb.position === 'upper') score -= 8;

        // Volume Analysis
        const volRatio = stock.volume / stock.avgVolume;
        indicators.volumeRatio = volRatio;
        if (volRatio > 2 && stock.change > 0) score += 15; // High volume + positive = strong
        else if (volRatio > 1.5 && stock.change > 0) score += 8;
        else if (volRatio > 2 && stock.change < 0) score -= 10;

        // Support/Resistance
        const sr = this.calculateSupportResistance(stock);
        indicators.support = sr.support;
        indicators.resistance = sr.resistance;
        const distToSupport = (stock.price - sr.support) / stock.price;
        if (distToSupport < 0.05) score += 10; // Near support

        // Stochastic Oscillator
        const stoch = this.calculateStochastic(stock);
        indicators.stochastic = stoch;
        if (stoch.k < 20) score += 10;
        else if (stoch.k > 80) score -= 8;

        // ATR (Average True Range) - volatility
        const atr = this.calculateATR(stock);
        indicators.atr = atr;

        // Fibonacci Levels
        indicators.fibonacci = this.calculateFibonacci(stock);

        return {
            score: Math.min(100, Math.max(0, score)),
            indicators
        };
    }

    calculateRSI(stock) {
        // Simulated RSI based on price position and change
        const pricePosition = (stock.price - stock.week52Low) / (stock.week52High - stock.week52Low);
        const changeImpact = stock.change * 2;
        let rsi = pricePosition * 60 + 20 + changeImpact;
        return Math.min(100, Math.max(0, Math.round(rsi * 10) / 10));
    }

    calculateMACD(stock) {
        const shortEMA = stock.price * (1 + stock.change / 200);
        const longEMA = stock.price * (1 - stock.change / 300);
        const macdLine = shortEMA - longEMA;
        const signalLine = macdLine * 0.8;
        return {
            macdLine: Math.round(macdLine * 100) / 100,
            signalLine: Math.round(signalLine * 100) / 100,
            histogram: Math.round((macdLine - signalLine) * 100) / 100,
            signal: macdLine > signalLine ? 'bullish' : 'bearish'
        };
    }

    calculateMA(stock) {
        const ma20 = stock.price * (1 - stock.change / 400);
        const ma50 = stock.price * (1 - stock.change / 200);
        const ma200 = (stock.week52High + stock.week52Low) / 2;
        return {
            ma20: Math.round(ma20 * 100) / 100,
            ma50: Math.round(ma50 * 100) / 100,
            ma200: Math.round(ma200 * 100) / 100,
            aboveMA20: stock.price > ma20,
            aboveMA50: stock.price > ma50,
            goldenCross: ma20 > ma50 && stock.change > 2,
            deathCross: ma20 < ma50 && stock.change < -2
        };
    }

    calculateBollingerBands(stock) {
        const middle = (stock.week52High + stock.week52Low) / 2;
        const std = (stock.week52High - stock.week52Low) / 4;
        const upper = middle + 2 * std;
        const lower = middle - 2 * std;
        let position = 'middle';
        if (stock.price <= lower * 1.05) position = 'lower';
        else if (stock.price >= upper * 0.95) position = 'upper';
        return {
            upper: Math.round(upper * 100) / 100,
            middle: Math.round(middle * 100) / 100,
            lower: Math.round(lower * 100) / 100,
            position
        };
    }

    calculateSupportResistance(stock) {
        return {
            support: Math.round((stock.week52Low + (stock.price - stock.week52Low) * 0.236) * 100) / 100,
            resistance: Math.round((stock.price + (stock.week52High - stock.price) * 0.618) * 100) / 100
        };
    }

    calculateStochastic(stock) {
        const k = ((stock.price - stock.week52Low) / (stock.week52High - stock.week52Low)) * 100;
        const d = k * 0.85 + 7.5;
        return {
            k: Math.round(k * 10) / 10,
            d: Math.round(d * 10) / 10
        };
    }

    calculateATR(stock) {
        const range = stock.week52High - stock.week52Low;
        const atr = range / 14;
        const atrPercent = (atr / stock.price) * 100;
        return {
            value: Math.round(atr * 100) / 100,
            percent: Math.round(atrPercent * 10) / 10
        };
    }

    calculateFibonacci(stock) {
        const diff = stock.week52High - stock.week52Low;
        return {
            level236: Math.round((stock.week52Low + diff * 0.236) * 100) / 100,
            level382: Math.round((stock.week52Low + diff * 0.382) * 100) / 100,
            level500: Math.round((stock.week52Low + diff * 0.500) * 100) / 100,
            level618: Math.round((stock.week52Low + diff * 0.618) * 100) / 100,
            level786: Math.round((stock.week52Low + diff * 0.786) * 100) / 100,
        };
    }

    // ===== FUNDAMENTAL ANALYSIS =====
    fundamentalScore(stock) {
        let score = 50;
        const metrics = {};

        // P/E Ratio Analysis
        metrics.pe = stock.pe;
        if (stock.pe > 0 && stock.pe < 8) score += 20;
        else if (stock.pe >= 8 && stock.pe < 12) score += 12;
        else if (stock.pe >= 12 && stock.pe < 18) score += 5;
        else if (stock.pe >= 18) score -= 5;
        else if (stock.pe < 0) score -= 15; // Negative earnings

        // P/B Ratio
        metrics.pb = stock.pb;
        if (stock.pb < 0.5) score += 15;
        else if (stock.pb < 1.0) score += 10;
        else if (stock.pb < 1.5) score += 5;
        else if (stock.pb > 3) score -= 10;

        // ROE (Return on Equity)
        metrics.roe = stock.roe;
        if (stock.roe > 20) score += 15;
        else if (stock.roe > 15) score += 10;
        else if (stock.roe > 10) score += 5;
        else if (stock.roe < 5) score -= 10;
        else if (stock.roe < 0) score -= 20;

        // Debt Ratio
        metrics.debtRatio = stock.debt;
        if (stock.debt < 20) score += 12;
        else if (stock.debt < 35) score += 8;
        else if (stock.debt < 50) score += 0;
        else if (stock.debt > 65) score -= 12;
        else if (stock.debt > 80) score -= 20;

        // Market Cap (prefer small for penny stocks)
        metrics.marketCap = stock.marketCap;
        const mcapM = stock.marketCap / 1000000;
        if (mcapM < 100) score += 5; // Micro cap - more upside potential
        else if (mcapM < 300) score += 3;

        // Dividend Yield
        metrics.dividend = stock.dividend;
        if (stock.dividend > 3) score += 8;
        else if (stock.dividend > 1) score += 4;

        // Graham Number (simplified)
        const grahamNumber = Math.sqrt(22.5 * Math.max(0, stock.pe > 0 ? stock.price / stock.pe * stock.pe : 0) * (stock.price / stock.pb));
        metrics.grahamNumber = Math.round(grahamNumber * 100) / 100;

        // Intrinsic Value (simplified DCF)
        const eps = stock.pe > 0 ? stock.price / stock.pe : 0;
        const growthRate = stock.roe / 100;
        const discountRate = 0.12;
        const intrinsicValue = eps > 0 ? eps * (1 + growthRate) / (discountRate - growthRate * 0.3) : stock.price * 0.7;
        metrics.intrinsicValue = Math.round(Math.max(0, intrinsicValue) * 100) / 100;

        // Margin of Safety
        metrics.marginOfSafety = metrics.intrinsicValue > 0
            ? Math.round(((metrics.intrinsicValue - stock.price) / metrics.intrinsicValue) * 100)
            : 0;
        if (metrics.marginOfSafety > 30) score += 12;
        else if (metrics.marginOfSafety > 15) score += 6;

        return {
            score: Math.min(100, Math.max(0, score)),
            metrics
        };
    }

    // ===== MOMENTUM ANALYSIS =====
    momentumScore(stock) {
        let score = 50;
        const metrics = {};

        // Price Change Momentum
        metrics.dailyChange = stock.change;
        if (stock.change > 8) score += 20;
        else if (stock.change > 5) score += 15;
        else if (stock.change > 2) score += 8;
        else if (stock.change > 0) score += 4;
        else if (stock.change < -5) score -= 15;
        else if (stock.change < -2) score -= 8;
        else if (stock.change < 0) score -= 3;

        // Volume Momentum
        const volRatio = stock.volume / stock.avgVolume;
        metrics.volumeRatio = Math.round(volRatio * 100) / 100;
        if (volRatio > 3) score += 18;
        else if (volRatio > 2) score += 12;
        else if (volRatio > 1.5) score += 6;
        else if (volRatio < 0.5) score -= 10;

        // 52-Week Position
        const weekPos = (stock.price - stock.week52Low) / (stock.week52High - stock.week52Low);
        metrics.week52Position = Math.round(weekPos * 100);
        // Prefer stocks in the lower half with upward momentum
        if (weekPos < 0.3 && stock.change > 0) score += 15; // Rising from bottom
        else if (weekPos < 0.5 && stock.change > 0) score += 10;
        else if (weekPos > 0.9) score -= 10; // Near 52-week high

        // Price Acceleration
        metrics.priceAcceleration = stock.change > 5 && volRatio > 1.5 ? 'High' : stock.change > 2 ? 'Medium' : 'Low';
        if (metrics.priceAcceleration === 'High') score += 10;

        // Breakout Detection
        metrics.breakout = false;
        if (stock.change > 5 && volRatio > 2) {
            metrics.breakout = true;
            score += 12;
        }

        // Relative Strength
        const marketChange = MARKET_FACTORS.bist100.change;
        metrics.relativeStrength = Math.round((stock.change - marketChange) * 100) / 100;
        if (metrics.relativeStrength > 5) score += 10;
        else if (metrics.relativeStrength > 2) score += 5;
        else if (metrics.relativeStrength < -5) score -= 10;

        // Float Turnover Rate
        metrics.floatTurnover = Math.round((stock.volume / (stock.marketCap / stock.price * stock.float / 100)) * 100) / 100;

        return {
            score: Math.min(100, Math.max(0, score)),
            metrics
        };
    }

    // ===== SENTIMENT ANALYSIS =====
    sentimentScore(stock) {
        let score = 50;
        const factors = {};

        // Sector Sentiment
        const sectorNews = NEWS_SENTIMENT.filter(n => n.sector === stock.sector || n.sector === 'all');
        let sectorSentiment = 0;
        sectorNews.forEach(news => {
            const impactWeight = news.impact === 'high' ? 2 : 1;
            if (news.sentiment === 'positive') sectorSentiment += impactWeight;
            else if (news.sentiment === 'negative') sectorSentiment -= impactWeight;
        });
        factors.sectorSentiment = sectorSentiment > 2 ? 'Pozitif' : sectorSentiment < -1 ? 'Negatif' : 'Nötr';
        score += sectorSentiment * 5;

        // Market Sentiment
        const marketSentiment = MARKET_FACTORS.bist100.change > 0 ? 'Pozitif' : 'Negatif';
        factors.marketSentiment = marketSentiment;
        if (MARKET_FACTORS.bist100.change > 1) score += 10;
        else if (MARKET_FACTORS.bist100.change < -1) score -= 10;

        // Currency Impact
        factors.currencyImpact = MARKET_FACTORS.usdTry.change > 0.5 ? 'Negatif' : MARKET_FACTORS.usdTry.change < -0.5 ? 'Pozitif' : 'Nötr';
        if (MARKET_FACTORS.usdTry.change > 1) score -= 8;
        else if (MARKET_FACTORS.usdTry.change < -0.5) score += 5;

        // CDS Risk
        factors.countryRisk = MARKET_FACTORS.cds.value > 350 ? 'Yüksek' : MARKET_FACTORS.cds.value > 250 ? 'Orta' : 'Düşük';
        if (MARKET_FACTORS.cds.value > 350) score -= 10;
        else if (MARKET_FACTORS.cds.value < 200) score += 8;

        // Inflation Impact
        factors.inflationImpact = MARKET_FACTORS.inflation.value > 50 ? 'Negatif' : MARKET_FACTORS.inflation.value > 30 ? 'Nötr' : 'Pozitif';

        // Interest Rate Impact
        factors.interestRateImpact = MARKET_FACTORS.interest.value > 40 ? 'Negatif' : 'Nötr';
        if (MARKET_FACTORS.interest.value > 40) score -= 5;

        // Social/Institutional Interest (simulated)
        const volInterest = stock.volume / stock.avgVolume;
        factors.institutionalInterest = volInterest > 2 ? 'Yüksek' : volInterest > 1.2 ? 'Orta' : 'Düşük';
        if (volInterest > 2) score += 8;

        // Overall Sentiment Score
        factors.overallSentiment = score > 60 ? 'Pozitif' : score < 40 ? 'Negatif' : 'Nötr';

        return {
            score: Math.min(100, Math.max(0, score)),
            factors
        };
    }

    // ===== RISK ANALYSIS =====
    riskScore(stock) {
        let risk = 30; // Base risk for penny stocks
        const factors = {};

        // Beta Risk
        factors.beta = stock.beta;
        if (stock.beta > 2) risk += 20;
        else if (stock.beta > 1.5) risk += 12;
        else if (stock.beta > 1) risk += 5;
        else risk -= 5;

        // Debt Risk
        factors.debtRisk = stock.debt > 60 ? 'Yüksek' : stock.debt > 40 ? 'Orta' : 'Düşük';
        if (stock.debt > 70) risk += 15;
        else if (stock.debt > 50) risk += 8;
        else if (stock.debt < 25) risk -= 5;

        // Liquidity Risk
        const liquidityRatio = stock.volume / (stock.marketCap / stock.price);
        factors.liquidityRisk = liquidityRatio > 0.05 ? 'Düşük' : liquidityRatio > 0.02 ? 'Orta' : 'Yüksek';
        if (liquidityRatio < 0.01) risk += 15;
        else if (liquidityRatio < 0.02) risk += 8;

        // Volatility Risk
        const volatility = ((stock.week52High - stock.week52Low) / stock.week52Low) * 100;
        factors.volatility = Math.round(volatility);
        if (volatility > 150) risk += 18;
        else if (volatility > 100) risk += 12;
        else if (volatility > 60) risk += 5;

        // Float Risk (high float = more volatility potential)
        factors.floatRisk = stock.float > 70 ? 'Yüksek' : stock.float > 50 ? 'Orta' : 'Düşük';
        if (stock.float > 75) risk += 8;

        // Earnings Risk
        factors.earningsRisk = stock.pe < 0 ? 'Çok Yüksek' : stock.pe > 20 ? 'Yüksek' : stock.pe > 10 ? 'Orta' : 'Düşük';
        if (stock.pe < 0) risk += 15;
        else if (stock.pe > 25) risk += 8;

        // Market Cap Risk
        const mcapM = stock.marketCap / 1000000;
        factors.sizeRisk = mcapM < 100 ? 'Yüksek' : mcapM < 300 ? 'Orta' : 'Düşük';
        if (mcapM < 80) risk += 10;
        else if (mcapM < 150) risk += 5;

        // Max Drawdown Potential
        factors.maxDrawdown = Math.round(((stock.week52High - stock.week52Low) / stock.week52High) * 100);

        // Overall Risk Assessment
        factors.overallRisk = risk > 70 ? 'Çok Yüksek' : risk > 55 ? 'Yüksek' : risk > 40 ? 'Orta' : 'Düşük';

        return {
            score: Math.min(100, Math.max(0, risk)),
            factors
        };
    }

    // ===== SIGNAL GENERATION =====
    generateSignal(totalScore, technical, momentum) {
        if (totalScore >= 80 && technical.score >= 70 && momentum.score >= 65) return 'GÜÇLÜ AL';
        if (totalScore >= 65 && technical.score >= 55) return 'AL';
        if (totalScore >= 45) return 'TUT';
        if (totalScore >= 30) return 'SAT';
        return 'GÜÇLÜ SAT';
    }

    calculateRiskLevel(riskScore) {
        if (riskScore >= 70) return 5;
        if (riskScore >= 55) return 4;
        if (riskScore >= 40) return 3;
        if (riskScore >= 25) return 2;
        return 1;
    }

    // ===== RECOMMENDATION ENGINE =====
    generateRecommendation(stock, totalScore, technical, fundamental, momentum, sentiment, risk) {
        const parts = [];

        // Opening
        if (totalScore >= 75) {
            parts.push(`<strong>${stock.symbol}</strong> hissesi AI analiz motorumuz tarafından <span class="ai-highlight">güçlü bir alım fırsatı</span> olarak değerlendirilmektedir.`);
        } else if (totalScore >= 60) {
            parts.push(`<strong>${stock.symbol}</strong> hissesi <span class="ai-highlight">olumlu sinyaller</span> vermektedir ve potansiyel taşımaktadır.`);
        } else if (totalScore >= 45) {
            parts.push(`<strong>${stock.symbol}</strong> hissesi <span class="ai-warning">karışık sinyaller</span> vermektedir, dikkatli yaklaşım önerilir.`);
        } else {
            parts.push(`<strong>${stock.symbol}</strong> hissesi şu an <span class="ai-danger">zayıf görünüm</span> sergilemektedir.`);
        }

        // Technical
        parts.push(`<br><br><strong>Teknik Analiz:</strong> RSI değeri ${technical.indicators.rsi.toFixed(1)} seviyesinde olup ${technical.indicators.rsi < 30 ? 'aşırı satım bölgesinde, potansiyel dönüş sinyali veriyor' : technical.indicators.rsi > 70 ? 'aşırı alım bölgesinde, düzeltme riski var' : 'nötr bölgede seyrediyor'}. MACD ${technical.indicators.macd.signal === 'bullish' ? 'yükseliş' : 'düşüş'} sinyali veriyor.`);

        // Fundamental
        if (stock.pe > 0) {
            parts.push(`F/K oranı ${stock.pe} ile ${stock.pe < 10 ? 'oldukça cazip' : stock.pe < 15 ? 'makul' : 'yüksek'} seviyede.`);
        }
        parts.push(`Özsermaye karlılığı %${stock.roe} ve borçluluk oranı %${stock.debt}.`);

        // Momentum
        if (momentum.metrics.breakout) {
            parts.push(`<br><br><span class="ai-highlight">⚡ KIRILIM TESPİT EDİLDİ:</span> Yüksek hacimle birlikte güçlü fiyat hareketi gözlemleniyor.`);
        }

        // Risk
        parts.push(`<br><br><strong>Risk Değerlendirmesi:</strong> ${risk.factors.overallRisk} risk seviyesinde. Beta değeri ${stock.beta}, 52 haftalık volatilite %${risk.factors.volatility}.`);

        // Target
        const targetPrice = stock.price * (1 + (totalScore - 50) / 100);
        const stopLoss = stock.price * 0.92;
        parts.push(`<br><br><strong>Hedef Fiyat:</strong> ₺${targetPrice.toFixed(2)} | <strong>Stop Loss:</strong> ₺${stopLoss.toFixed(2)}`);

        return parts.join(' ');
    }

    // ===== BATCH ANALYSIS =====
    analyzeAll(stocks) {
        return stocks.map(stock => ({
            ...stock,
            analysis: this.analyzeStock(stock)
        })).sort((a, b) => b.analysis.totalScore - a.analysis.totalScore);
    }

    // ===== PENNY STOCK FILTER =====
    filterPennyStocks(stocks, maxPrice = 10) {
        return stocks.filter(s => s.price <= maxPrice && s.price > 0);
    }

    // ===== SECTOR ANALYSIS =====
    analyzeSectors(analyzedStocks) {
        const sectors = {};
        analyzedStocks.forEach(stock => {
            if (!sectors[stock.sector]) {
                sectors[stock.sector] = { count: 0, totalScore: 0, stocks: [] };
            }
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

// Create global instance
const aiEngine = new AIEngine();
