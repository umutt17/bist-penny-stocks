// ===== Main Application =====

class App {
    constructor() {
        this.analyzedStocks = [];
        this.watchlist = JSON.parse(localStorage.getItem('bist-watchlist') || '[]');
        this.currentSort = { field: 'score', dir: 'desc' };
        this.isDark = localStorage.getItem('bist-theme') !== 'light';
        this.init();
    }

    async init() {
        try {
            this.startLoadingAnimation();
            await this.loadAndAnalyze();
            this.setupEventListeners();
            this.renderDashboard();
            this.runScanner();
            this.renderWatchlist();

            if (!this.isDark) {
                document.documentElement.setAttribute('data-theme', 'light');
                document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
            }
        } catch (e) {
            console.error('Init error:', e);
        } finally {
            this.hideLoading();
        }
    }

    // ===== Loading =====
    startLoadingAnimation() {
        const messages = [
            'Yapay zeka modeli yükleniyor...',
            'BIST verileri analiz ediliyor...',
            'Teknik göstergeler hesaplanıyor...',
            'Penny stock fırsatları taranıyor...',
            'Sonuçlar hazırlanıyor...'
        ];

        const statusEl = document.getElementById('loading-status');
        const progressEl = document.getElementById('progress-fill');
        let i = 0;

        this._loadingInterval = setInterval(() => {
            if (i < messages.length) {
                statusEl.textContent = messages[i];
                progressEl.style.width = ((i + 1) / messages.length * 100) + '%';
                i++;
            }
        }, 150);
    }

    hideLoading() {
        if (this._loadingInterval) clearInterval(this._loadingInterval);
        const progressEl = document.getElementById('progress-fill');
        if (progressEl) progressEl.style.width = '100%';
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
        }, 200);
    }

    // ===== Data Loading =====
    async loadAndAnalyze() {
        let stocks = [];

        try {
            // Try fetching live data from Yahoo Finance
            const liveStocks = await dataFetcher.fetchAllStocks();
            if (liveStocks && liveStocks.length > 5) {
                stocks = liveStocks;
                this.dataSource = 'live';
                console.log(`✅ Canlı veri (${dataFetcher.dataSource}): ${stocks.length} hisse yüklendi`);
            } else {
                throw new Error('Insufficient live data');
            }
        } catch (e) {
            console.warn('⚠️ Canlı veri alınamadı, statik veriler kullanılıyor:', e.message);
            stocks = FALLBACK_STOCKS;
            this.dataSource = 'static';
            // Set fallback market data
            if (!MARKET_FACTORS.bist100.value) {
                MARKET_FACTORS.usdTry.value = 38.45; MARKET_FACTORS.usdTry.change = 0.32;
                MARKET_FACTORS.eurTry.value = 41.23; MARKET_FACTORS.eurTry.change = -0.15;
                MARKET_FACTORS.bist100.value = 10245; MARKET_FACTORS.bist100.change = 1.45;
                MARKET_FACTORS.goldTry.value = 3120; MARKET_FACTORS.goldTry.change = 0.89;
                MARKET_FACTORS.vix.value = 18.5; MARKET_FACTORS.vix.change = -1.2;
            }
        }

        // Ensure all stocks have required fields
        stocks.forEach(s => {
            if (!s.ma50) s.ma50 = s.price;
            if (!s.ma200) s.ma200 = s.price;
            if (!s.week52High) s.week52High = s.price * 1.3;
            if (!s.week52Low) s.week52Low = s.price * 0.7;
            if (!s.avgVolume) s.avgVolume = s.volume || 1;
        });

        const pennyStocks = aiEngine.filterPennyStocks(stocks, 10);
        try {
            this.analyzedStocks = aiEngine.analyzeAll(pennyStocks);
        } catch (e) {
            console.error('AI analysis error:', e);
            // Minimal fallback analysis
            this.analyzedStocks = pennyStocks.map(s => ({
                ...s,
                analysis: { totalScore: 50, signal: 'TUT', layers: {}, technical: { indicators: {}, signals: [] }, fundamental: { metrics: {}, signals: [] }, momentum: { metrics: {}, signals: [] }, sentiment: { signals: [] }, macroSector: { signals: [] }, risk: { riskMetrics: {}, signals: [] }, candles: { patterns: [] }, supportResistance: {}, forecast: { ensemble: {} }, riskLevel: 3, recommendation: 'Analiz hatası' }
            }));
        }
        this.sectorData = aiEngine.analyzeSectors(this.analyzedStocks);
    }

    // ===== Event Listeners =====
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(link.dataset.section);
            });
        });

        // Mobile menu
        document.getElementById('mobile-menu-btn').addEventListener('click', () => {
            document.getElementById('mobile-menu').classList.toggle('active');
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

        // Refresh
        document.getElementById('refresh-btn').addEventListener('click', () => this.refresh());

        // Scanner
        document.getElementById('scan-btn').addEventListener('click', () => this.runScanner());
        document.getElementById('reset-filters').addEventListener('click', () => this.resetFilters());
        document.getElementById('export-btn').addEventListener('click', () => this.exportCSV());

        // Sort select
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.renderTopPicks(e.target.value);
        });

        // Table sorting
        document.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const field = th.dataset.sort;
                if (this.currentSort.field === field) {
                    this.currentSort.dir = this.currentSort.dir === 'asc' ? 'desc' : 'asc';
                } else {
                    this.currentSort.field = field;
                    this.currentSort.dir = 'desc';
                }
                this.runScanner();
            });
        });

        // Analysis search
        const searchInput = document.getElementById('analysis-search');
        searchInput.addEventListener('input', (e) => this.handleSearchInput(e.target.value));
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.length > 0) this.handleSearchInput(searchInput.value);
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-box')) {
                document.getElementById('search-suggestions').classList.remove('active');
            }
        });

        document.getElementById('analyze-btn').addEventListener('click', () => {
            const val = searchInput.value.trim().toUpperCase();
            if (val) this.runAnalysis(val);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const val = searchInput.value.trim().toUpperCase();
                if (val) this.runAnalysis(val);
            }
        });

        // Analysis tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
            });
        });

        // Modal
        document.getElementById('modal-close').addEventListener('click', () => {
            document.getElementById('stock-modal').classList.remove('active');
        });
        document.getElementById('stock-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) e.currentTarget.classList.remove('active');
        });
    }

    // ===== Navigation =====
    switchSection(section) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('[data-section]').forEach(l => l.classList.remove('active'));
        document.getElementById(section).classList.add('active');
        document.querySelectorAll(`[data-section="${section}"]`).forEach(l => l.classList.add('active'));
        document.getElementById('mobile-menu').classList.remove('active');

        if (section === 'scanner') this.runScanner();
    }

    // ===== Theme =====
    toggleTheme() {
        this.isDark = !this.isDark;
        if (this.isDark) {
            document.documentElement.removeAttribute('data-theme');
            document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
        }
        localStorage.setItem('bist-theme', this.isDark ? 'dark' : 'light');
        chartManager.updateTheme(this.isDark);
        this.renderDashboard();
    }

    // ===== Refresh =====
    async refresh() {
        const btn = document.getElementById('refresh-btn');
        btn.querySelector('i').classList.add('fa-spin');
        await this.loadAndAnalyze();
        this.renderDashboard();
        this.runScanner();
        setTimeout(() => btn.querySelector('i').classList.remove('fa-spin'), 1000);
        this.showToast('Veriler güncellendi', 'success');
    }

    // ===== Dashboard Rendering =====
    renderDashboard() {
        // Stats
        document.getElementById('total-stocks').textContent = BIST_PENNY_SYMBOLS.length;
        document.getElementById('penny-count').textContent = this.analyzedStocks.length;
        const hotPicks = this.analyzedStocks.filter(s => s.analysis.totalScore >= 75).length;
        document.getElementById('hot-picks').textContent = hotPicks;
        const avgScore = this.analyzedStocks.length > 0
            ? Math.round(this.analyzedStocks.reduce((sum, s) => sum + s.analysis.totalScore, 0) / this.analyzedStocks.length)
            : 0;
        document.getElementById('avg-score').textContent = avgScore;

        // Data source indicator
        const badge = document.getElementById('data-source-badge');
        if (badge) {
            if (this.dataSource === 'live') {
                badge.innerHTML = '<i class="fas fa-signal"></i> Canli Veri';
                badge.className = 'data-badge data-badge-live';
            } else {
                badge.innerHTML = '<i class="fas fa-database"></i> Statik Veri';
                badge.className = 'data-badge data-badge-static';
            }
        }

        // Charts
        chartManager.createTopStocksChart(this.analyzedStocks);
        chartManager.createSectorChart(this.sectorData);

        // Sentiment
        this.renderSentiment();

        // Top Picks
        this.renderTopPicks('score');
    }

    renderSentiment() {
        const grid = document.getElementById('sentiment-grid');
        const items = [
            { emoji: '📊', label: 'BIST 100', value: MARKET_FACTORS.bist100.value.toLocaleString(), cls: MARKET_FACTORS.bist100.change > 0 ? 'sentiment-positive' : 'sentiment-negative' },
            { emoji: '💵', label: 'USD/TRY', value: MARKET_FACTORS.usdTry.value.toFixed(2), cls: MARKET_FACTORS.usdTry.change > 0 ? 'sentiment-negative' : 'sentiment-positive' },
            { emoji: '🏦', label: 'CDS (5Y)', value: MARKET_FACTORS.cds.value, cls: MARKET_FACTORS.cds.value > 300 ? 'sentiment-negative' : 'sentiment-positive' },
            { emoji: '📈', label: 'Enflasyon', value: '%' + MARKET_FACTORS.inflation.value, cls: 'sentiment-negative' },
            { emoji: '🎯', label: 'VIX', value: MARKET_FACTORS.vix.value, cls: MARKET_FACTORS.vix.value > 20 ? 'sentiment-negative' : 'sentiment-positive' },
        ];

        grid.innerHTML = items.map(item => `
            <div class="sentiment-item">
                <span class="emoji">${item.emoji}</span>
                <span class="label">${item.label}</span>
                <span class="value ${item.cls}">${item.value}</span>
            </div>
        `).join('');
    }

    renderTopPicks(sortBy) {
        let sorted = [...this.analyzedStocks];
        switch (sortBy) {
            case 'momentum': sorted.sort((a, b) => b.analysis.momentum.score - a.analysis.momentum.score); break;
            case 'value': sorted.sort((a, b) => b.analysis.fundamental.score - a.analysis.fundamental.score); break;
            case 'technical': sorted.sort((a, b) => b.analysis.technical.score - a.analysis.technical.score); break;
            default: sorted.sort((a, b) => b.analysis.totalScore - a.analysis.totalScore);
        }

        const top10 = sorted.slice(0, 10);
        const tbody = document.getElementById('top-picks-body');
        tbody.innerHTML = top10.map((stock, i) => `
            <tr>
                <td><strong>${i + 1}</strong></td>
                <td>
                    <div style="display:flex;align-items:center;gap:8px">
                        <strong style="color:var(--accent-blue)">${stock.symbol}</strong>
                        <span style="font-size:0.75rem;color:var(--text-muted)">${stock.name.substring(0, 20)}</span>
                    </div>
                </td>
                <td><strong>₺${stock.price.toFixed(2)}</strong></td>
                <td class="${stock.change >= 0 ? 'change-positive' : 'change-negative'}">
                    ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%
                </td>
                <td>${this.formatVolume(stock.volume)}</td>
                <td>${this.renderScoreBadge(stock.analysis.totalScore)}</td>
                <td>${this.renderSignalBadge(stock.analysis.signal)}</td>
                <td>${this.renderRiskMeter(stock.analysis.riskLevel)}</td>
                <td>
                    <div style="display:flex;gap:4px">
                        <button class="btn-icon" onclick="app.showStockDetail('${stock.symbol}')" title="Detay">
                            <i class="fas fa-chart-line"></i>
                        </button>
                        <button class="btn-icon ${this.watchlist.includes(stock.symbol) ? 'starred' : ''}" onclick="app.toggleWatchlist('${stock.symbol}')" title="İzle">
                            <i class="fas fa-star"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // ===== Scanner =====
    runScanner() {
        const priceMin = parseFloat(document.getElementById('price-min').value) || 0;
        const priceMax = parseFloat(document.getElementById('price-max').value) || 10;
        const volumeMin = parseInt(document.getElementById('volume-filter').value) || 0;
        const scoreMin = parseInt(document.getElementById('score-filter').value) || 0;
        const sector = document.getElementById('sector-filter').value;
        const signal = document.getElementById('signal-filter').value;

        let results = this.analyzedStocks.filter(s => {
            if (s.price < priceMin || s.price > priceMax) return false;
            if (s.volume < volumeMin) return false;
            if (s.analysis.totalScore < scoreMin) return false;
            if (sector !== 'all' && s.sector !== sector) return false;
            if (signal !== 'all' && s.analysis.signal !== signal) return false;
            return true;
        });

        // Sort
        const { field, dir } = this.currentSort;
        results.sort((a, b) => {
            let va, vb;
            switch (field) {
                case 'symbol': va = a.symbol; vb = b.symbol; break;
                case 'name': va = a.name; vb = b.name; break;
                case 'sector': va = a.sector; vb = b.sector; break;
                case 'price': va = a.price; vb = b.price; break;
                case 'change': va = a.change; vb = b.change; break;
                case 'volume': va = a.volume; vb = b.volume; break;
                case 'score': va = a.analysis.totalScore; vb = b.analysis.totalScore; break;
                case 'signal':
                    const signalOrder = { 'GÜÇLÜ AL': 5, 'AL': 4, 'TUT': 3, 'SAT': 2, 'GÜÇLÜ SAT': 1 };
                    va = signalOrder[a.analysis.signal]; vb = signalOrder[b.analysis.signal]; break;
                default: va = a.analysis.totalScore; vb = b.analysis.totalScore;
            }
            if (typeof va === 'string') return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
            return dir === 'asc' ? va - vb : vb - va;
        });

        document.getElementById('result-count').textContent = `${results.length} sonuç bulundu`;

        const tbody = document.getElementById('scanner-body');
        tbody.innerHTML = results.map(stock => `
            <tr>
                <td><strong style="color:var(--accent-blue)">${stock.symbol}</strong></td>
                <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis">${stock.name}</td>
                <td><span style="color:${SECTOR_COLORS[stock.sector] || '#6b7280'};font-weight:500">${stock.sector}</span></td>
                <td><strong>₺${stock.price.toFixed(2)}</strong></td>
                <td class="${stock.change >= 0 ? 'change-positive' : 'change-negative'}">
                    ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%
                </td>
                <td>${this.formatVolume(stock.volume)}</td>
                <td>${this.renderScoreBadge(stock.analysis.totalScore)}</td>
                <td>${this.renderSignalBadge(stock.analysis.signal)}</td>
                <td>
                    <div style="display:flex;gap:4px">
                        <button class="btn-icon" onclick="app.runAnalysis('${stock.symbol}')" title="Analiz Et">
                            <i class="fas fa-brain"></i>
                        </button>
                        <button class="btn-icon ${this.watchlist.includes(stock.symbol) ? 'starred' : ''}" onclick="app.toggleWatchlist('${stock.symbol}')" title="İzle">
                            <i class="fas fa-star"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    resetFilters() {
        document.getElementById('price-min').value = 0;
        document.getElementById('price-max').value = 10;
        document.getElementById('volume-filter').value = '500000';
        document.getElementById('score-filter').value = '70';
        document.getElementById('sector-filter').value = 'all';
        document.getElementById('signal-filter').value = 'all';
        this.runScanner();
    }

    // ===== Analysis =====
    handleSearchInput(value) {
        const suggestions = document.getElementById('search-suggestions');
        if (value.length === 0) {
            suggestions.classList.remove('active');
            return;
        }
        const matches = this.analyzedStocks.filter(s =>
            s.symbol.toLowerCase().includes(value.toLowerCase()) ||
            s.name.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 8);

        if (matches.length === 0) {
            suggestions.classList.remove('active');
            return;
        }

        suggestions.innerHTML = matches.map(s => `
            <div class="suggestion-item" onclick="app.selectSuggestion('${s.symbol}')">
                <span class="symbol">${s.symbol}</span>
                <span class="name">${s.name}</span>
            </div>
        `).join('');
        suggestions.classList.add('active');
    }

    selectSuggestion(symbol) {
        document.getElementById('analysis-search').value = symbol;
        document.getElementById('search-suggestions').classList.remove('active');
        this.runAnalysis(symbol);
    }

    runAnalysis(symbol) {
        // Switch to analysis section
        this.switchSection('analysis');
        document.getElementById('analysis-search').value = symbol;

        const stock = this.analyzedStocks.find(s => s.symbol === symbol);
        if (!stock) {
            this.showToast('Hisse bulunamadı', 'error');
            return;
        }

        const analysis = stock.analysis;
        const resultEl = document.getElementById('analysis-result');
        resultEl.classList.remove('hidden');

        // Header
        document.getElementById('analysis-stock-header').innerHTML = `
            <div class="stock-header-left">
                <div class="stock-symbol-large">${stock.symbol.substring(0, 4)}</div>
                <div class="stock-name-large">
                    <h3>${stock.symbol}</h3>
                    <span>${stock.name} • ${stock.sector}</span>
                </div>
            </div>
            <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
                ${this.renderSignalBadge(analysis.signal)}
                ${this.renderScoreBadge(analysis.totalScore)}
                <button class="btn-icon ${this.watchlist.includes(stock.symbol) ? 'starred' : ''}" onclick="app.toggleWatchlist('${stock.symbol}')" title="İzle">
                    <i class="fas fa-star"></i>
                </button>
            </div>
            <div class="stock-price-large">
                <span class="price">₺${stock.price.toFixed(2)}</span>
                <span class="change ${stock.change >= 0 ? 'change-positive' : 'change-negative'}">
                    ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%
                </span>
            </div>
        `;

        // Overview Tab
        this.renderOverviewTab(stock, analysis);

        // Technical Tab
        this.renderTechnicalTab(stock, analysis);

        // Fundamental Tab
        this.renderFundamentalTab(stock, analysis);

        // Sentiment Tab
        this.renderSentimentTab(stock, analysis);

        // Risk Tab
        this.renderRiskTab(stock, analysis);

        // Reset to overview tab
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelector('.tab-btn[data-tab="overview"]').classList.add('active');
        document.getElementById('tab-overview').classList.add('active');
    }

    renderOverviewTab(stock, analysis) {
        const layers = [
            { key: 'technical', label: 'Teknik Analiz', icon: 'chart-line', color: 'blue', weight: analysis.layers.technical.weight },
            { key: 'fundamental', label: 'Temel Analiz', icon: 'balance-scale', color: 'green', weight: analysis.layers.fundamental.weight },
            { key: 'momentum', label: 'Momentum', icon: 'bolt', color: 'orange', weight: analysis.layers.momentum.weight },
            { key: 'sentiment', label: 'Duyarlılık', icon: 'heart', color: 'purple', weight: analysis.layers.sentiment.weight },
            { key: 'macroSector', label: 'Makro/Sektör', icon: 'globe', color: 'blue', weight: analysis.layers.macroSector.weight },
            { key: 'riskReward', label: 'Risk/Ödül', icon: 'shield-alt', color: 'red', weight: analysis.layers.riskReward.weight },
        ];

        const layerHTML = layers.map(l => {
            const s = analysis.layers[l.key].score;
            const topSignals = (analysis.layers[l.key].signals || []).slice(0, 2);
            return `
                <div class="detail-item" style="position:relative">
                    <span class="label"><i class="fas fa-${l.icon}" style="color:var(--accent-${l.color})"></i> ${l.label} <small style="opacity:0.6">(${Math.round(l.weight * 100)}%)</small></span>
                    <span class="value" style="color:${this.getScoreColor(s)}">${s}</span>
                    <div class="progress-indicator"><div class="fill fill-${l.color}" style="width:${s}%"></div></div>
                    ${topSignals.length ? `<small style="color:var(--text-muted);display:block;margin-top:4px;line-height:1.4">${topSignals.join('<br>')}</small>` : ''}
                </div>
            `;
        }).join('');

        // Forecast summary
        const f30 = analysis.forecast?.ensemble?.[30];
        const forecastHTML = f30 ? `
            <div style="margin-top:16px;padding:12px;background:var(--bg-secondary);border-radius:var(--radius-sm);border:1px solid var(--border-color)">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
                    <div>
                        <span style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">30 Günlük Tahmin</span>
                        <div style="font-size:1.3rem;font-weight:700;color:${f30.changePct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">₺${f30.price} <small>(${f30.changePct > 0 ? '+' : ''}${f30.changePct}%)</small></div>
                    </div>
                    <div style="text-align:right">
                        <span style="font-size:0.75rem;color:var(--text-muted)">Güven Aralığı</span>
                        <div style="font-size:0.85rem">₺${f30.ciLow} — ₺${f30.ciHigh}</div>
                    </div>
                    <div style="text-align:right">
                        <span style="font-size:0.75rem;color:var(--text-muted)">Model Güveni</span>
                        <div style="font-size:0.85rem">${analysis.forecast.confidence} (R²: ${analysis.forecast.models?.linearRegression?.r2 || 'N/A'})</div>
                    </div>
                </div>
            </div>
        ` : '';

        // Candlestick patterns
        const candleHTML = (analysis.candles?.patterns?.length > 0) ? `
            <div style="margin-top:12px">
                <span style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">Mum Formasyonları</span>
                <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">
                    ${analysis.candles.patterns.map(p => `
                        <span class="signal-badge ${p.type === 'bullish' ? 'signal-buy' : p.type === 'bearish' ? 'signal-sell' : 'signal-hold'}" title="${p.desc}">${p.name}</span>
                    `).join('')}
                </div>
            </div>
        ` : '';

        document.getElementById('overview-content').innerHTML = `
            <div class="overview-card">
                <h4><i class="fas fa-bullseye"></i> 6 Katmanlı AI Skor</h4>
                <div class="gauge-container">
                    <div style="font-size:3.5rem;font-weight:800;color:${this.getScoreColor(analysis.totalScore)}">${analysis.totalScore}</div>
                    <div class="gauge-label">/100</div>
                    <div class="progress-indicator" style="width:100%;margin-top:12px">
                        <div class="fill ${this.getScoreFillClass(analysis.totalScore)}" style="width:${analysis.totalScore}%"></div>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px">
                    ${layerHTML}
                </div>
                ${forecastHTML}
                ${candleHTML}
            </div>
            <div class="overview-card">
                <h4><i class="fas fa-robot"></i> AI Yorum</h4>
                <div class="ai-analysis-text">
                    ${analysis.recommendation}
                </div>
            </div>
        `;
    }

    renderTechnicalTab(stock, analysis) {
        const ti = analysis.technical.indicators;
        const sr = analysis.supportResistance || {};
        const fib = sr.fibonacci || {};

        // Top signals
        const signalsHTML = (analysis.technical.signals || []).length > 0 ? `
            <div style="margin-bottom:16px;padding:12px;background:var(--bg-secondary);border-radius:var(--radius-sm);border:1px solid var(--border-color)">
                <span style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">AI Teknik Sinyaller</span>
                ${analysis.technical.signals.map(s => `<div style="font-size:0.85rem;padding:4px 0;color:var(--text-primary)">• ${s}</div>`).join('')}
            </div>
        ` : '';

        document.getElementById('technical-content').innerHTML = `
            ${signalsHTML}
            <h4 style="margin-bottom:10px;font-size:0.85rem;color:var(--text-secondary)">MOMENTUM GÖSTERGELERİ</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="label">RSI (14)</span>
                    <span class="value" style="color:${ti.rsi < 30 ? 'var(--accent-green)' : ti.rsi > 70 ? 'var(--accent-red)' : 'var(--accent-blue)'}">${ti.rsi?.toFixed(1) || 'N/A'}</span>
                    <div class="progress-indicator"><div class="fill ${ti.rsi < 30 ? 'fill-green' : ti.rsi > 70 ? 'fill-red' : 'fill-blue'}" style="width:${ti.rsi || 50}%"></div></div>
                </div>
                <div class="detail-item">
                    <span class="label">Stokastik %K / %D</span>
                    <span class="value">${ti.stochastic?.k?.toFixed(1) || 0} / ${ti.stochastic?.d?.toFixed(1) || 0}</span>
                    <div class="progress-indicator"><div class="fill fill-blue" style="width:${ti.stochastic?.k || 50}%"></div></div>
                </div>
                <div class="detail-item">
                    <span class="label">Williams %R</span>
                    <span class="value" style="color:${ti.williamsR < -80 ? 'var(--accent-green)' : ti.williamsR > -20 ? 'var(--accent-red)' : 'var(--text-primary)'}">${ti.williamsR || 0}</span>
                </div>
                <div class="detail-item">
                    <span class="label">CCI</span>
                    <span class="value" style="color:${ti.cci < -100 ? 'var(--accent-green)' : ti.cci > 100 ? 'var(--accent-red)' : 'var(--text-primary)'}">${ti.cci || 0}</span>
                </div>
                <div class="detail-item">
                    <span class="label">ROC (10)</span>
                    <span class="value" style="color:${ti.roc > 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">%${ti.roc || 0}</span>
                </div>
                <div class="detail-item">
                    <span class="label">MFI</span>
                    <span class="value" style="color:${ti.mfi < 20 ? 'var(--accent-green)' : ti.mfi > 80 ? 'var(--accent-red)' : 'var(--accent-blue)'}">${ti.mfi || 50}</span>
                    <div class="progress-indicator"><div class="fill fill-blue" style="width:${ti.mfi || 50}%"></div></div>
                </div>
            </div>

            <h4 style="margin:16px 0 10px;font-size:0.85rem;color:var(--text-secondary)">TREND GÖSTERGELERİ</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="label">MACD</span>
                    <span class="value" style="color:${ti.macd?.signal === 'bullish' ? 'var(--accent-green)' : 'var(--accent-red)'}">
                        ${ti.macd?.signal === 'bullish' ? '▲ Yükseliş' : '▼ Düşüş'}
                    </span>
                    <small style="color:var(--text-muted)">Hist: ${ti.macd?.histogram || 0}</small>
                </div>
                <div class="detail-item">
                    <span class="label">SMA 20 / 50</span>
                    <span class="value">₺${ti.ma?.sma20 || 0} / ₺${ti.ma?.sma50 || 0}</span>
                    <small style="color:var(--text-muted)">${ti.ma?.goldenCross ? '⭐ Golden Cross' : ti.ma?.deathCross ? '☠️ Death Cross' : ti.ma?.aboveSMA20 ? '▲ Üzerinde' : '▼ Altında'}</small>
                </div>
                <div class="detail-item">
                    <span class="label">ADX (Trend Gücü)</span>
                    <span class="value" style="color:${ti.adx?.value > 25 ? 'var(--accent-green)' : 'var(--text-muted)'}">${ti.adx?.value?.toFixed(0) || 0}</span>
                    <small style="color:var(--text-muted)">${ti.adx?.value > 25 ? 'Güçlü trend' : 'Zayıf trend'}</small>
                </div>
                <div class="detail-item">
                    <span class="label">Ichimoku Bulut</span>
                    <span class="value">${ti.ichimoku?.aboveCloud ? '🟢 Üzerinde' : ti.ichimoku?.belowCloud ? '🔴 Altında' : '🟡 İçinde'}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Parabolic SAR</span>
                    <span class="value" style="color:${ti.parabolicSAR?.trend === 'bullish' ? 'var(--accent-green)' : 'var(--accent-red)'}">
                        ${ti.parabolicSAR?.trend === 'bullish' ? '▲ Yükseliş' : '▼ Düşüş'} (₺${ti.parabolicSAR?.value || 0})
                    </span>
                </div>
                <div class="detail-item">
                    <span class="label">Hacim Oranı</span>
                    <span class="value" style="color:${ti.volumeRatio > 1.5 ? 'var(--accent-green)' : 'var(--text-primary)'}">
                        ${ti.volumeRatio?.toFixed(2) || 0}x
                    </span>
                </div>
            </div>

            <h4 style="margin:16px 0 10px;font-size:0.85rem;color:var(--text-secondary)">VOLATİLİTE & HACİM</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="label">Bollinger Bantları</span>
                    <span class="value">${ti.bollingerBands?.position === 'lower' ? '🟢 Alt Bant' : ti.bollingerBands?.position === 'upper' ? '🔴 Üst Bant' : '🟡 Orta'}</span>
                    <small style="color:var(--text-muted)">₺${ti.bollingerBands?.lower || 0} — ₺${ti.bollingerBands?.upper || 0} ${ti.bollingerBands?.squeeze ? '⚡ SQUEEZE' : ''}</small>
                </div>
                <div class="detail-item">
                    <span class="label">ATR (14)</span>
                    <span class="value">₺${ti.atr?.value || 0} <small>(%${ti.atr?.percent || 0})</small></span>
                </div>
                <div class="detail-item">
                    <span class="label">OBV Trend</span>
                    <span class="value" style="color:${ti.obv?.trend === 'rising' ? 'var(--accent-green)' : 'var(--accent-red)'}">${ti.obv?.trend === 'rising' ? '▲ Yükseliyor' : '▼ Düşüyor'}</span>
                </div>
                <div class="detail-item">
                    <span class="label">CMF (Para Akışı)</span>
                    <span class="value" style="color:${ti.cmf > 0.05 ? 'var(--accent-green)' : ti.cmf < -0.05 ? 'var(--accent-red)' : 'var(--text-primary)'}">${ti.cmf || 0}</span>
                </div>
            </div>

            <h4 style="margin:16px 0 10px;font-size:0.85rem;color:var(--text-secondary)">DESTEK / DİRENÇ & FİBONACCİ</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="label">En Yakın Destek</span>
                    <span class="value" style="color:var(--accent-green)">₺${sr.nearestSupport || 0}</span>
                </div>
                <div class="detail-item">
                    <span class="label">En Yakın Direnç</span>
                    <span class="value" style="color:var(--accent-red)">₺${sr.nearestResistance || 0}</span>
                </div>
                <div class="detail-item"><span class="label">Pivot (P)</span><span class="value">₺${sr.pivots?.P || 0}</span></div>
                <div class="detail-item"><span class="label">R1 / R2</span><span class="value">₺${sr.pivots?.R1 || 0} / ₺${sr.pivots?.R2 || 0}</span></div>
                <div class="detail-item"><span class="label">S1 / S2</span><span class="value">₺${sr.pivots?.S1 || 0} / ₺${sr.pivots?.S2 || 0}</span></div>
                <div class="detail-item"><span class="label">Fib %38.2 / %61.8</span><span class="value">₺${fib.level382 || 0} / ₺${fib.level618 || 0}</span></div>
            </div>
        `;
    }

    renderFundamentalTab(stock, analysis) {
        const fm = analysis.fundamental.metrics;
        document.getElementById('fundamental-content').innerHTML = `
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="label">F/K Oranı</span>
                    <span class="value" style="color:${fm.pe > 0 && fm.pe < 10 ? 'var(--accent-green)' : fm.pe < 0 ? 'var(--accent-red)' : 'var(--text-primary)'}">${fm.pe}</span>
                </div>
                <div class="detail-item">
                    <span class="label">PD/DD</span>
                    <span class="value" style="color:${fm.pb < 1 ? 'var(--accent-green)' : 'var(--text-primary)'}">${fm.pb}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Özsermaye Karlılığı</span>
                    <span class="value" style="color:${fm.roe > 15 ? 'var(--accent-green)' : fm.roe < 0 ? 'var(--accent-red)' : 'var(--text-primary)'}">%${fm.roe}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Borçluluk Oranı</span>
                    <span class="value" style="color:${fm.debtRatio > 60 ? 'var(--accent-red)' : fm.debtRatio < 30 ? 'var(--accent-green)' : 'var(--accent-orange)'}">%${fm.debtRatio}</span>
                    <div class="progress-indicator"><div class="fill ${fm.debtRatio > 60 ? 'fill-red' : fm.debtRatio > 40 ? 'fill-orange' : 'fill-green'}" style="width:${fm.debtRatio}%"></div></div>
                </div>
                <div class="detail-item">
                    <span class="label">Piyasa Değeri</span>
                    <span class="value">${this.formatMarketCap(fm.marketCap)}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Temettü Verimi</span>
                    <span class="value" style="color:${fm.dividend > 3 ? 'var(--accent-green)' : 'var(--text-primary)'}">%${fm.dividend}</span>
                </div>
                <div class="detail-item">
                    <span class="label">İçsel Değer (DCF)</span>
                    <span class="value" style="color:${fm.intrinsicValue > stock.price ? 'var(--accent-green)' : 'var(--accent-red)'}">₺${fm.intrinsicValue}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Güvenlik Marjı</span>
                    <span class="value" style="color:${fm.marginOfSafety > 20 ? 'var(--accent-green)' : fm.marginOfSafety < 0 ? 'var(--accent-red)' : 'var(--accent-orange)'}">%${fm.marginOfSafety}</span>
                    <div class="progress-indicator"><div class="fill ${fm.marginOfSafety > 20 ? 'fill-green' : fm.marginOfSafety > 0 ? 'fill-orange' : 'fill-red'}" style="width:${Math.max(0, fm.marginOfSafety)}%"></div></div>
                </div>
            </div>
        `;
    }

    renderSentimentTab(stock, analysis) {
        const sf = analysis.sentiment.factors;
        document.getElementById('sentiment-content').innerHTML = `
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="label">Sektör Duyarlılığı</span>
                    <span class="value" style="color:${sf.sectorSentiment === 'Pozitif' ? 'var(--accent-green)' : sf.sectorSentiment === 'Negatif' ? 'var(--accent-red)' : 'var(--accent-orange)'}">${sf.sectorSentiment}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Piyasa Duyarlılığı</span>
                    <span class="value" style="color:${sf.marketSentiment === 'Pozitif' ? 'var(--accent-green)' : 'var(--accent-red)'}">${sf.marketSentiment}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Döviz Etkisi</span>
                    <span class="value" style="color:${sf.currencyImpact === 'Pozitif' ? 'var(--accent-green)' : sf.currencyImpact === 'Negatif' ? 'var(--accent-red)' : 'var(--accent-orange)'}">${sf.currencyImpact}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Ülke Riski</span>
                    <span class="value" style="color:${sf.countryRisk === 'Düşük' ? 'var(--accent-green)' : sf.countryRisk === 'Yüksek' ? 'var(--accent-red)' : 'var(--accent-orange)'}">${sf.countryRisk}</span>
                </div>
                <div class="detail-item">
                    <span class="label">VIX</span>
                    <span class="value" style="color:${(sf.vix || 18) > 25 ? 'var(--accent-red)' : 'var(--accent-green)'}">${sf.vix || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Genel Duyarlılık Skoru</span>
                    <span class="value">${analysis.sentiment.score}/100</span>
                </div>
                <div class="detail-item">
                    <span class="label">Kurumsal İlgi</span>
                    <span class="value" style="color:${sf.institutionalInterest === 'Yüksek' ? 'var(--accent-green)' : 'var(--text-primary)'}">${sf.institutionalInterest}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Genel Duyarlılık</span>
                    <span class="value" style="color:${sf.overallSentiment === 'Pozitif' ? 'var(--accent-green)' : sf.overallSentiment === 'Negatif' ? 'var(--accent-red)' : 'var(--accent-orange)'}; font-size:1.1rem">${sf.overallSentiment}</span>
                </div>
            </div>
            <div style="margin-top:20px">
                <h4 style="margin-bottom:12px;font-size:0.9rem"><i class="fas fa-newspaper" style="color:var(--accent-purple)"></i> İlgili Haberler</h4>
                ${NEWS_SENTIMENT.filter(n => n.sector === stock.sector || n.sector === 'all').map(n => `
                    <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border-color)">
                        <span style="font-size:1.2rem">${n.sentiment === 'positive' ? '🟢' : n.sentiment === 'negative' ? '🔴' : '🟡'}</span>
                        <span style="font-size:0.85rem">${n.title}</span>
                        <span style="margin-left:auto;font-size:0.7rem;color:var(--text-muted)">${n.impact === 'high' ? 'Yüksek Etki' : 'Orta Etki'}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderRiskTab(stock, analysis) {
        const rm = analysis.risk.riskMetrics;
        const riskSignals = analysis.risk.signals || [];

        document.getElementById('risk-content').innerHTML = `
            <div style="text-align:center;margin-bottom:20px">
                <div style="font-size:1rem;color:var(--text-secondary);margin-bottom:4px">Genel Risk Seviyesi</div>
                <div style="font-size:3rem;font-weight:800;color:${rm.riskScore > 60 ? 'var(--accent-red)' : rm.riskScore > 40 ? 'var(--accent-orange)' : 'var(--accent-green)'}">
                    ${rm.overallRisk}
                </div>
                <div style="font-size:1.5rem;color:var(--text-muted)">Risk Skoru: ${rm.riskScore}/100</div>
            </div>

            ${riskSignals.length > 0 ? `
                <div style="margin-bottom:16px;padding:12px;background:var(--bg-secondary);border-radius:var(--radius-sm);border:1px solid var(--border-color)">
                    ${riskSignals.map(s => `<div style="font-size:0.85rem;padding:3px 0;color:var(--accent-orange)">⚠ ${s}</div>`).join('')}
                </div>
            ` : ''}

            <h4 style="margin-bottom:10px;font-size:0.85rem;color:var(--text-secondary)">PİYASA RİSKİ</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="label">Beta</span>
                    <span class="value">${rm.beta}</span>
                    <div class="progress-indicator"><div class="fill ${rm.beta > 1.5 ? 'fill-red' : rm.beta > 1 ? 'fill-orange' : 'fill-green'}" style="width:${Math.min(100, rm.beta * 40)}%"></div></div>
                </div>
                <div class="detail-item">
                    <span class="label">Yıllık Volatilite</span>
                    <span class="value">%${rm.annualVolatility}</span>
                </div>
                <div class="detail-item">
                    <span class="label">52H Volatilite</span>
                    <span class="value" style="color:${rm.volatility > 100 ? 'var(--accent-red)' : 'var(--text-primary)'}">%${rm.volatility}</span>
                    <div class="progress-indicator"><div class="fill ${rm.volatility > 100 ? 'fill-red' : rm.volatility > 60 ? 'fill-orange' : 'fill-green'}" style="width:${Math.min(100, rm.volatility)}%"></div></div>
                </div>
                <div class="detail-item">
                    <span class="label">Maks. Düşüş Pot.</span>
                    <span class="value" style="color:var(--accent-red)">%${rm.maxDrawdown}</span>
                    <div class="progress-indicator"><div class="fill fill-red" style="width:${rm.maxDrawdown}%"></div></div>
                </div>
            </div>

            <h4 style="margin:16px 0 10px;font-size:0.85rem;color:var(--text-secondary)">VaR & CVaR (Riske Maruz Değer)</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="label">VaR %95 (Günlük)</span>
                    <span class="value" style="color:var(--accent-red)">₺${rm.var95Daily}</span>
                    <small style="color:var(--text-muted)">Günlük max kayıp (%95 güven)</small>
                </div>
                <div class="detail-item">
                    <span class="label">VaR %99 (Günlük)</span>
                    <span class="value" style="color:var(--accent-red)">₺${rm.var99Daily}</span>
                </div>
                <div class="detail-item">
                    <span class="label">CVaR %95 (Beklenen Kayıp)</span>
                    <span class="value" style="color:var(--accent-red)">₺${rm.cvar95Daily}</span>
                    <small style="color:var(--text-muted)">VaR aşıldığında ort. kayıp</small>
                </div>
                <div class="detail-item">
                    <span class="label">VaR %95 (Aylık)</span>
                    <span class="value" style="color:var(--accent-red)">₺${rm.var95Monthly}</span>
                </div>
            </div>

            <h4 style="margin:16px 0 10px;font-size:0.85rem;color:var(--text-secondary)">STOP LOSS SEVİYELERİ (ATR Bazlı)</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="label">ATR (14)</span>
                    <span class="value">₺${rm.atr}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Stop Loss 1.5x ATR</span>
                    <span class="value" style="color:var(--accent-orange)">₺${rm.stopLoss_1_5x}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Stop Loss 2x ATR</span>
                    <span class="value" style="color:var(--accent-red)">₺${rm.stopLoss_2x}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Stop Loss 3x ATR</span>
                    <span class="value" style="color:var(--accent-red)">₺${rm.stopLoss_3x}</span>
                </div>
            </div>

            <h4 style="margin:16px 0 10px;font-size:0.85rem;color:var(--text-secondary)">RİSK / ÖDÜL</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="label">Yükseliş Potansiyeli</span>
                    <span class="value" style="color:var(--accent-green)">%${rm.upside}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Düşüş Riski</span>
                    <span class="value" style="color:var(--accent-red)">%${rm.downside}</span>
                </div>
                <div class="detail-item">
                    <span class="label">R/R Oranı</span>
                    <span class="value" style="color:${rm.riskRewardRatio > 1.5 ? 'var(--accent-green)' : 'var(--accent-red)'}">${rm.riskRewardRatio}x</span>
                </div>
                <div class="detail-item">
                    <span class="label">Likidite Riski</span>
                    <span class="value" style="color:${rm.liquidityRisk === 'Yüksek' ? 'var(--accent-red)' : rm.liquidityRisk === 'Orta' ? 'var(--accent-orange)' : 'var(--accent-green)'}">${rm.liquidityRisk}</span>
                </div>
            </div>
        `;
    }

    // ===== Stock Detail Modal =====
    showStockDetail(symbol) {
        const stock = this.analyzedStocks.find(s => s.symbol === symbol);
        if (!stock) return;

        const a = stock.analysis;
        document.getElementById('modal-title').textContent = `${stock.symbol} - ${stock.name}`;
        document.getElementById('modal-body').innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                <div>
                    <div style="font-size:2rem;font-weight:800">₺${stock.price.toFixed(2)}</div>
                    <div class="${stock.change >= 0 ? 'change-positive' : 'change-negative'}" style="font-size:1.1rem">
                        ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%
                    </div>
                </div>
                <div style="text-align:right">
                    <div style="font-size:2.5rem;font-weight:800;color:${this.getScoreColor(a.totalScore)}">${a.totalScore}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted)">AI Skor</div>
                </div>
            </div>
            <div style="display:flex;gap:8px;margin-bottom:20px">
                ${this.renderSignalBadge(a.signal)}
                <span class="badge" style="background:rgba(139,92,246,0.15);color:var(--accent-purple)">${stock.sector}</span>
            </div>
            <div class="detail-grid" style="margin-bottom:20px">
                <div class="detail-item"><span class="label">Hacim</span><span class="value">${this.formatVolume(stock.volume)}</span></div>
                <div class="detail-item"><span class="label">Piyasa Değeri</span><span class="value">${this.formatMarketCap(stock.marketCap)}</span></div>
                <div class="detail-item"><span class="label">F/K</span><span class="value">${stock.pe}</span></div>
                <div class="detail-item"><span class="label">PD/DD</span><span class="value">${stock.pb}</span></div>
                <div class="detail-item"><span class="label">52H Yüksek</span><span class="value">₺${stock.week52High}</span></div>
                <div class="detail-item"><span class="label">52H Düşük</span><span class="value">₺${stock.week52Low}</span></div>
            </div>
            <div class="ai-analysis-text" style="font-size:0.85rem">
                ${a.recommendation}
            </div>
            <div style="margin-top:16px;display:flex;gap:8px">
                <button class="btn btn-primary" onclick="app.runAnalysis('${stock.symbol}');document.getElementById('stock-modal').classList.remove('active')">
                    <i class="fas fa-brain"></i> Detaylı Analiz
                </button>
                <button class="btn btn-secondary ${this.watchlist.includes(stock.symbol) ? 'starred' : ''}" onclick="app.toggleWatchlist('${stock.symbol}')">
                    <i class="fas fa-star"></i> ${this.watchlist.includes(stock.symbol) ? 'Listeden Çıkar' : 'İzlemeye Ekle'}
                </button>
            </div>
        `;
        document.getElementById('stock-modal').classList.add('active');
    }

    // ===== Watchlist =====
    toggleWatchlist(symbol) {
        const idx = this.watchlist.indexOf(symbol);
        if (idx > -1) {
            this.watchlist.splice(idx, 1);
            this.showToast(`${symbol} izleme listesinden çıkarıldı`, 'info');
        } else {
            this.watchlist.push(symbol);
            this.showToast(`${symbol} izleme listesine eklendi`, 'success');
        }
        localStorage.setItem('bist-watchlist', JSON.stringify(this.watchlist));
        this.renderWatchlist();
    }

    renderWatchlist() {
        const emptyEl = document.getElementById('watchlist-empty');
        const gridEl = document.getElementById('watchlist-grid');

        if (this.watchlist.length === 0) {
            emptyEl.style.display = 'block';
            gridEl.innerHTML = '';
            return;
        }

        emptyEl.style.display = 'none';
        gridEl.innerHTML = this.watchlist.map(symbol => {
            const stock = this.analyzedStocks.find(s => s.symbol === symbol);
            if (!stock) return '';
            const a = stock.analysis;
            return `
                <div class="watchlist-item" onclick="app.runAnalysis('${stock.symbol}')">
                    <div class="watchlist-item-header">
                        <div>
                            <div class="watchlist-item-symbol">${stock.symbol}</div>
                            <div class="watchlist-item-name">${stock.name}</div>
                        </div>
                        <div class="watchlist-item-score" style="color:${this.getScoreColor(a.totalScore)}">${a.totalScore}</div>
                    </div>
                    <div class="watchlist-item-details">
                        <span><strong>₺${stock.price.toFixed(2)}</strong></span>
                        <span class="${stock.change >= 0 ? 'change-positive' : 'change-negative'}">
                            ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%
                        </span>
                        ${this.renderSignalBadge(a.signal)}
                    </div>
                    <div style="margin-top:8px;display:flex;justify-content:flex-end">
                        <button class="btn-icon starred" onclick="event.stopPropagation();app.toggleWatchlist('${stock.symbol}')" title="Çıkar">
                            <i class="fas fa-star"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ===== Export =====
    exportCSV() {
        const rows = [['Hisse', 'Şirket', 'Sektör', 'Fiyat', 'Değişim%', 'Hacim', 'AI Skor', 'Sinyal', 'F/K', 'PD/DD', 'ROE', 'Risk']];
        this.analyzedStocks.forEach(s => {
            rows.push([
                s.symbol, s.name, s.sector, s.price, s.change, s.volume,
                s.analysis.totalScore, s.analysis.signal, s.pe, s.pb, s.roe,
                s.analysis.risk.factors.overallRisk
            ]);
        });
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `bist_penny_stocks_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        this.showToast('CSV dosyası indirildi', 'success');
    }

    // ===== Helpers =====
    formatVolume(vol) {
        if (vol >= 1000000) return (vol / 1000000).toFixed(1) + 'M';
        if (vol >= 1000) return (vol / 1000).toFixed(0) + 'K';
        return vol.toString();
    }

    formatMarketCap(cap) {
        if (cap >= 1000000000) return '₺' + (cap / 1000000000).toFixed(2) + 'B';
        if (cap >= 1000000) return '₺' + (cap / 1000000).toFixed(0) + 'M';
        return '₺' + cap.toLocaleString();
    }

    getScoreColor(score) {
        if (score >= 75) return 'var(--accent-green)';
        if (score >= 55) return 'var(--accent-blue)';
        if (score >= 40) return 'var(--accent-orange)';
        return 'var(--accent-red)';
    }

    getScoreFillClass(score) {
        if (score >= 75) return 'fill-green';
        if (score >= 55) return 'fill-blue';
        if (score >= 40) return 'fill-orange';
        return 'fill-red';
    }

    renderScoreBadge(score) {
        const cls = score >= 75 ? 'score-high' : score >= 50 ? 'score-mid' : 'score-low';
        return `<span class="score-badge ${cls}">${score}</span>`;
    }

    renderSignalBadge(signal) {
        const clsMap = {
            'GÜÇLÜ AL': 'signal-strong-buy',
            'AL': 'signal-buy',
            'TUT': 'signal-hold',
            'SAT': 'signal-sell',
            'GÜÇLÜ SAT': 'signal-sell'
        };
        return `<span class="signal-badge ${clsMap[signal] || 'signal-hold'}">${signal}</span>`;
    }

    renderRiskMeter(level) {
        const dots = [];
        for (let i = 1; i <= 5; i++) {
            let cls = '';
            if (i <= level) {
                if (level <= 2) cls = 'active-green';
                else if (level <= 3) cls = 'active-yellow';
                else cls = 'active-red';
            }
            dots.push(`<div class="risk-dot ${cls}"></div>`);
        }
        return `<div class="risk-meter"><div class="risk-dots">${dots.join('')}</div></div>`;
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const icons = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle' };
        toast.innerHTML = `<i class="fas fa-${icons[type]}"></i> ${message}`;
        toast.className = `toast ${type} active`;
        setTimeout(() => toast.classList.remove('active'), 3000);
    }
}

// Initialize
const app = new App();
