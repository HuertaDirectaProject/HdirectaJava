/**
 * Dashboard Client Statistics
 * Logic for fetching data and rendering Chart.js charts with dark mode support.
 */

document.addEventListener('DOMContentLoaded', () => {
    const clientStats = new ClientStatsManager();
    clientStats.init();
});

class ClientStatsManager {
    constructor() {
        this.charts = {};
        this.data = null;
        this.currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        
        // Colores base para gráficas
        this.chartColors = {
            primary: '#10b981', // green-500
            secondary: '#3b82f6', // blue-500
            warning: '#f59e0b', // amber-500
            danger: '#ef4444', // red-500
            accent: '#84cc16', // lime-500
            gray: '#6b7280' // gray-500
        };
    }

    async init() {
        this.setupEventListeners();
        await this.fetchData();
        this.renderCharts();
    }

    setupEventListeners() {
        window.addEventListener('themeChanged', (e) => {
            this.currentTheme = e.detail.theme;
            this.updateChartsTheme();
        });
    }

    async fetchData() {
        try {
            const response = await fetch('/api/stats/dashboard/client');
            if (response.status === 401) {
                window.location.href = "/login?error=session&message=Debe+iniciar+sesion";
                return;
            }
            if (!response.ok) throw new Error('Failed to fetch stats');
            const result = await response.json();
            this.data = result.clientStats;
            this.updateStaticStats();
        } catch (error) {
            console.error('Error fetching client stats:', error);
            this.mostrarMensajeSinProductos();
        }
    }

    updateStaticStats() {
        if (!this.data) return;
        
        const totalProducts = Object.values(this.data.categoryCount || {}).reduce((a, b) => a + b, 0);
        
        if (totalProducts === 0) {
            this.mostrarMensajeSinProductos();
            return;
        }

        this.safeSetText('totalProducts', totalProducts);
        this.safeSetText('unitsCount', Object.keys(this.data.unitCount || {}).length);
        this.safeSetText('categoriesCount', Object.keys(this.data.categoryCount || {}).length);
        this.safeSetText('activeProducts', totalProducts); // Simplificación
    }

    safeSetText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    mostrarMensajeSinProductos() {
        const container = document.querySelector('.charts-grid');
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-box-open text-6xl text-gray-400 mb-4"></i>
                    <p class="text-xl text-gray-600 font-semibold mb-2">No tienes productos registrados</p>
                    <p class="text-gray-500 mb-4">Comienza agregando tus primeros productos para ver las estadísticas</p>
                    <a href="/agregar_producto" class="inline-block bg-[#8bc34a] text-white text-lg px-12 py-2 rounded-2xl hover:bg-[#496826] transition-colors">
                        <i class="fas fa-plus mr-2"></i>Agregar Producto
                    </a>
                </div>
            `;
        }
    }

    renderCharts() {
        if (!this.data || Object.keys(this.data.categoryCount || {}).length === 0) return;

        // Categorías - Bar
        this.createChart('categoriesChart', 'bar', {
            labels: Object.keys(this.data.categoryCount || {}),
            datasets: [{
                label: 'Productos',
                data: Object.values(this.data.categoryCount || {}),
                backgroundColor: this.chartColors.primary,
                borderRadius: 6
            }]
        });

        // Unidades - Doughnut
        this.createChart('unitsChart', 'doughnut', {
            labels: Object.keys(this.data.unitCount || {}),
            datasets: [{
                data: Object.values(this.data.unitCount || {}),
                backgroundColor: [
                    this.chartColors.primary, this.chartColors.secondary, 
                    this.chartColors.warning, this.chartColors.danger, 
                    this.chartColors.accent, this.chartColors.gray
                ],
                borderWidth: 0
            }]
        }, { scales: { x: { display: false }, y: { display: false } } });

        // Precios - Line (Simulado con revenue trends si hubiera, pero usaremos promedios si el API los diera)
        // Por ahora mantenemos la estructura de precios si existe en el API original o simulamos
        const prices = [10, 20, 30]; // Placeholder si el nuevo API no trae promedios específicos
        this.createChart('pricesChart', 'line', {
            labels: ['Mínimo', 'Promedio', 'Máximo'],
            datasets: [{
                label: 'Referencia de Precios ($)',
                data: prices,
                borderColor: this.chartColors.primary,
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(16, 185, 129, 0.1)'
            }]
        });
    }

    getChartOptions() {
        const isDark = this.currentTheme === 'dark';
        const textColor = isDark ? '#e2e8f0' : '#475569';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: textColor, font: { family: 'Inter', size: 12 } }
                }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: gridColor },
                    ticks: { color: textColor }
                }
            }
        };
    }

    createChart(canvasId, type, data, extraOptions = {}) {
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const options = { ...this.getChartOptions(), ...extraOptions };
        
        this.charts[canvasId] = new Chart(ctx, {
            type: type,
            data: data,
            options: options
        });
    }

    updateChartsTheme() {
        Object.values(this.charts).forEach(chart => {
            const options = this.getChartOptions();
            chart.options.plugins.legend.labels.color = options.plugins.legend.labels.color;
            if (chart.options.scales.x) {
                chart.options.scales.x.ticks.color = options.scales.x.ticks.color;
                chart.options.scales.x.grid.color = options.scales.x.grid.color;
            }
            if (chart.options.scales.y) {
                chart.options.scales.y.ticks.color = options.scales.y.ticks.color;
                chart.options.scales.y.grid.color = options.scales.y.grid.color;
            }
            chart.update();
        });
    }
}