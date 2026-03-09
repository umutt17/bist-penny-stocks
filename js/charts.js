// ===== Chart Manager =====

class ChartManager {
    constructor() {
        this.charts = {};
        this.isDark = true;
    }

    getColors() {
        return {
            text: this.isDark ? '#94a3b8' : '#475569',
            grid: this.isDark ? '#1e293b' : '#e2e8f0',
            bg: this.isDark ? '#1a2235' : '#ffffff'
        };
    }

    // Top Stocks Bar Chart
    createTopStocksChart(data) {
        const ctx = document.getElementById('topStocksChart');
        if (!ctx) return;

        if (this.charts.topStocks) this.charts.topStocks.destroy();

        const top10 = data.slice(0, 10);
        const colors = this.getColors();

        this.charts.topStocks = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: top10.map(s => s.symbol),
                datasets: [{
                    label: 'AI Skor',
                    data: top10.map(s => s.analysis.totalScore),
                    backgroundColor: top10.map(s => {
                        const score = s.analysis.totalScore;
                        if (score >= 80) return 'rgba(16, 185, 129, 0.8)';
                        if (score >= 65) return 'rgba(59, 130, 246, 0.8)';
                        if (score >= 50) return 'rgba(245, 158, 11, 0.8)';
                        return 'rgba(239, 68, 68, 0.8)';
                    }),
                    borderRadius: 8,
                    borderSkipped: false,
                    barThickness: 32,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        titleColor: '#f0f4f8',
                        bodyColor: '#94a3b8',
                        borderColor: '#2a3550',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            afterBody: function(items) {
                                const stock = top10[items[0].dataIndex];
                                return [
                                    `Fiyat: ₺${stock.price}`,
                                    `Değişim: %${stock.change}`,
                                    `Sinyal: ${stock.analysis.signal}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: colors.grid, drawBorder: false },
                        ticks: { color: colors.text, font: { size: 11 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: colors.text, font: { size: 11, weight: 600 } }
                    }
                }
            }
        });
    }

    // Sector Doughnut Chart
    createSectorChart(sectorData) {
        const ctx = document.getElementById('sectorChart');
        if (!ctx) return;

        if (this.charts.sector) this.charts.sector.destroy();

        const labels = Object.keys(sectorData);
        const data = labels.map(l => sectorData[l].count);
        const bgColors = labels.map(l => SECTOR_COLORS[l] || '#6b7280');

        this.charts.sector = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: bgColors.map(c => c + 'cc'),
                    borderColor: bgColors,
                    borderWidth: 2,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: this.getColors().text,
                            font: { size: 11 },
                            padding: 12,
                            usePointStyle: true,
                            pointStyleWidth: 10
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        titleColor: '#f0f4f8',
                        bodyColor: '#94a3b8',
                        borderColor: '#2a3550',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            afterBody: function(items) {
                                const sector = labels[items[0].dataIndex];
                                return [`Ort. Skor: ${sectorData[sector].avgScore}`];
                            }
                        }
                    }
                }
            }
        });
    }

    updateTheme(isDark) {
        this.isDark = isDark;
    }

    destroyAll() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
}

const chartManager = new ChartManager();
