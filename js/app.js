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
        const pennyStocks = aiEngine.filterPennyStocks(BIST_STOCKS, 10);
        this.analyzedStocks = aiEngine.analyzeAll(pennyStocks);
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
        document.getElementById('total-stocks').textContent = BIST_STOCKS.length;
        document.getElementById('penny-count').textContent = this.analyzedStocks.length;
        const hotPicks = this.analyzedStocks.filter(s => s.analysis.totalScore >= 75).length;
        document.getElementById('hot-picks').textContent = hotPicks;
        const avgScore = Math.round(this.analyzedStocks.reduce((sum, s) => sum + s.analysis.totalScore, 0) / this.analyzedStocks.length);
        document.getElementById('avg-score').textContent = avgScore;

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
        document.getElementById('overview-content').innerHTML = `
            <div class="overview-card">
                <h4><i class="fas fa-bullseye"></i> AI Genel Skor</h4>
                <div class="gauge-container">
                    <div style="font-size:3.5rem;font-weight:800;color:${this.getScoreColor(analysis.totalScore)}">${analysis.totalScore}</div>
                    <div class="gauge-label">/100</div>
                    <div class="progress-indicator" style="width:100%;margin-top:12px">
                        <div class="fill ${this.getScoreFillClass(analysis.totalScore)}" style="width:${analysis.totalScore}%"></div>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px">
                    <div class="detail-item">
                        <span class="label">Teknik</span>
                        <span class="value" style="color:${this.getScoreColor(analysis.technical.score)}">${analysis.technical.score}</span>
                        <div class="progress-indicator"><div class="fill fill-blue" style="width:${analysis.technical.score}%"></div></div>
                    </div>
                    <div class="detail-item">
                        <span class="label">Temel</span>
                        <span class="value" style="color:${this.getScoreColor(analysis.fundamental.score)}">${analysis.fundamental.score}</span>
                        <div class="progress-indicator"><div class="fill fill-green" style="width:${analysis.fundamental.score}%"></div></div>
                    </div>
                    <div class="detail-item">
                        <span class="label">Momentum</span>
                        <span class="value" style="color:${this.getScoreColor(analysis.momentum.score)}">${analysis.momentum.score}</span>
                        <div class="progress-indicator"><div class="fill fill-orange" style="width:${analysis.momentum.score}%"></div></div>
                    </div>
                    <div class="detail-item">
                        <span class="label">Duyarlılık</span>
                        <span class="value" style="color:${this.getScoreColor(analysis.sentiment.score)}">${analysis.sentiment.score}</span>
                        <div class="progress-indicator"><div class="fill fill-purple" style="width:${analysis.sentiment.score}%"></div></div>
                    </div>
                </div>
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
        document.getElementById('technical-content').innerHTML = `
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="label">RSI (14)</span>
                    <span class="value" style="color:${ti.rsi < 30 ? 'var(--accent-green)' : ti.rsi > 70 ? 'var(--accent-red)' : 'var(--accent-blue)'}">${ti.rsi.toFixed(1)}</span>
                    <div class="progress-indicator"><div class="fill ${ti.rsi < 30 ? 'fill-green' : ti.rsi > 70 ? 'fill-red' : 'fill-blue'}" style="width:${ti.rsi}%"></div></div>
                </div>
                <div class="detail-item">
                    <span class="label">MACD Sinyal</span>
                    <span class="value" style="color:${ti.macd.signal === 'bullish' ? 'var(--accent-green)' : 'var(--accent-red)'}">
                        ${ti.macd.signal === 'bullish' ? '▲ Yükseliş' : '▼ Düşüş'}
                    </span>
                    <small style="color:var(--text-muted)">MACD: ${ti.macd.macdLine} | Signal: ${ti.macd.signalLine}</small>
                </div>
                <div class="detail-item">
                    <span class="label">Stokastik %K</span>
                    <span class="value">${ti.stochastic.k.toFixed(1)}</span>
                    <div class="progress-indicator"><div class="fill fill-blue" style="width:${ti.stochastic.k}%"></div></div>
                </div>
                <div class="detail-item">
                    <span class="label">Hacim Oranı</span>
                    <span class="value" style="color:${ti.volumeRatio > 1.5 ? 'var(--accent-green)' : 'var(--text-primary)'}">
                        ${ti.volumeRatio.toFixed(2)}x
                    </span>
                </div>
                <div class="detail-item">
                    <span class="label">MA20</span>
                    <span class="value">₺${ti.ma.ma20} ${ti.ma.aboveMA20 ? '<span style="color:var(--accent-green)">▲</span>' : '<span style="color:var(--accent-red)">▼</span>'}</span>
                </div>
                <div class="detail-item">
                    <span class="label">MA50</span>
                    <span class="value">₺${ti.ma.ma50} ${ti.ma.aboveMA50 ? '<span style="color:var(--accent-green)">▲</span>' : '<span style="color:var(--accent-red)">▼</span>'}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Bollinger Alt</span>
                    <span class="value">₺${ti.bollingerBands.lower}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Bollinger Üst</span>
                    <span class="value">₺${ti.bollingerBands.upper}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Destek</span>
                    <span class="value" style="color:var(--accent-green)">₺${ti.support}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Direnç</span>
                    <span class="value" style="color:var(--accent-red)">₺${ti.resistance}</span>
                </div>
                <div class="detail-item">
                    <span class="label">ATR</span>
                    <span class="value">₺${ti.atr.value} (%${ti.atr.percent})</span>
                </div>
                <div class="detail-item">
                    <span class="label">BB Pozisyon</span>
                    <span class="value">${ti.bollingerBands.position === 'lower' ? '🟢 Alt Bant' : ti.bollingerBands.position === 'upper' ? '🔴 Üst Bant' : '🟡 Orta'}</span>
                </div>
            </div>
            <div style="margin-top:16px">
                <h4 style="margin-bottom:12px;font-size:0.9rem"><i class="fas fa-wave-square" style="color:var(--accent-purple)"></i> Fibonacci Seviyeleri</h4>
                <div class="detail-grid">
                    <div class="detail-item"><span class="label">%23.6</span><span class="value">₺${ti.fibonacci.level236}</span></div>
                    <div class="detail-item"><span class="label">%38.2</span><span class="value">₺${ti.fibonacci.level382}</span></div>
                    <div class="detail-item"><span class="label">%50.0</span><span class="value">₺${ti.fibonacci.level500}</span></div>
                    <div class="detail-item"><span class="label">%61.8</span><span class="value">₺${ti.fibonacci.level618}</span></div>
                </div>
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
                    <span class="label">Enflasyon Etkisi</span>
                    <span class="value">${sf.inflationImpact}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Faiz Etkisi</span>
                    <span class="value">${sf.interestRateImpact}</span>
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
        const rf = analysis.risk.factors;
        document.getElementById('risk-content').innerHTML = `
            <div style="text-align:center;margin-bottom:20px">
                <div style="font-size:1rem;color:var(--text-secondary);margin-bottom:4px">Genel Risk Seviyesi</div>
                <div style="font-size:3rem;font-weight:800;color:${analysis.risk.score > 60 ? 'var(--accent-red)' : analysis.risk.score > 40 ? 'var(--accent-orange)' : 'var(--accent-green)'}">
                    ${rf.overallRisk}
                </div>
                <div style="font-size:1.5rem;color:var(--text-muted)">${analysis.risk.score}/100</div>
            </div>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="label">Beta</span>
                    <span class="value">${rf.beta}</span>
                    <div class="progress-indicator"><div class="fill ${rf.beta > 1.5 ? 'fill-red' : rf.beta > 1 ? 'fill-orange' : 'fill-green'}" style="width:${rf.beta * 40}%"></div></div>
                </div>
                <div class="detail-item">
                    <span class="label">Borç Riski</span>
                    <span class="value" style="color:${rf.debtRisk === 'Yüksek' ? 'var(--accent-red)' : rf.debtRisk === 'Orta' ? 'var(--accent-orange)' : 'var(--accent-green)'}">${rf.debtRisk}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Likidite Riski</span>
                    <span class="value" style="color:${rf.liquidityRisk === 'Yüksek' ? 'var(--accent-red)' : rf.liquidityRisk === 'Orta' ? 'var(--accent-orange)' : 'var(--accent-green)'}">${rf.liquidityRisk}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Volatilite</span>
                    <span class="value">%${rf.volatility}</span>
                    <div class="progress-indicator"><div class="fill ${rf.volatility > 100 ? 'fill-red' : rf.volatility > 60 ? 'fill-orange' : 'fill-green'}" style="width:${Math.min(100, rf.volatility)}%"></div></div>
                </div>
                <div class="detail-item">
                    <span class="label">Float Riski</span>
                    <span class="value">${rf.floatRisk}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Kazanç Riski</span>
                    <span class="value" style="color:${rf.earningsRisk === 'Çok Yüksek' || rf.earningsRisk === 'Yüksek' ? 'var(--accent-red)' : rf.earningsRisk === 'Orta' ? 'var(--accent-orange)' : 'var(--accent-green)'}">${rf.earningsRisk}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Büyüklük Riski</span>
                    <span class="value">${rf.sizeRisk}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Maks. Düşüş Potansiyeli</span>
                    <span class="value" style="color:var(--accent-red)">%${rf.maxDrawdown}</span>
                    <div class="progress-indicator"><div class="fill fill-red" style="width:${rf.maxDrawdown}%"></div></div>
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
