/**
 * Dashboard Admin Statistics
 * Logic for fetching data and rendering Chart.js charts with dark mode support.
 */

document.addEventListener('DOMContentLoaded', () => {
    const adminStats = new AdminStatsManager();
    adminStats.init();
});

class AdminStatsManager {
    constructor() {
        this.charts = {};
        this.data = null;
        this.currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        
        // Colores base para gráficas
        this.chartColors = {
            primary: '#10b981', // green-500
            secondary: '#3b82f6', // blue-500
            info: '#06b6d4', // cyan-500
            warning: '#f59e0b', // amber-500
            danger: '#ef4444', // red-500
            accent: '#84cc16', // lime-500
            pink: '#ec4899', // pink-500
            gray: '#6b7280', // gray-500
            indigo: '#6366f1' // indigo-500
        };
    }

    async init() {
        this.setupEventListeners();
        this.setupTabs();
        await this.fetchData();
        this.renderDefaultTab();
    }

    setupEventListeners() {
        window.addEventListener('themeChanged', (e) => {
            this.currentTheme = e.detail.theme;
            this.updateChartsTheme();
        });
    }

    setupTabs() {
        const tabLinks = document.querySelectorAll('.tab-link');
        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = link.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
    }

    switchTab(tabId) {
        // UI logic for tabs
        document.querySelectorAll('.tab-link').forEach(tab => {
            tab.classList.remove('!text-[#8bc34a]', '!border-b-4', '!border-[#88ff002f]');
        });
        const activeLink = document.querySelector(`.tab-link[data-tab="${tabId}"]`);
        if (activeLink) activeLink.classList.add('!text-[#8bc34a]', '!border-b-4', '!border-[#88ff002f]');

        document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
        const activeContent = document.getElementById(`tab-${tabId}`);
        if (activeContent) {
            activeContent.classList.remove('hidden');
            this.renderTabCharts(tabId);
        }
    }

    async fetchData() {
        try {
            const response = await fetch('/api/stats/dashboard/admin');
            if (!response.ok) throw new Error('Failed to fetch stats');
            const result = await response.json();
            this.data = result.adminStats;
            this.updateStaticStats();
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            // Fallback to mock data if needed or show error
        }
    }

    updateStaticStats() {
        if (!this.data) return;
        
        // Productos
        const totalProducts = Object.values(this.data.categoryCount || {}).reduce((a, b) => a + b, 0);
        this.safeSetText('totalProducts', totalProducts);
        this.safeSetText('unitsCount', Object.keys(this.data.unitCount || {}).length);
        this.safeSetText('categoriesCount', Object.keys(this.data.categoryCount || {}).length);
        this.safeSetText('activeProducts', totalProducts); // Simplificación

        // Usuarios
        const totalUsers = Object.values(this.data.rolesCount || {}).reduce((a, b) => a + b, 0);
        this.safeSetText('totalUsers', totalUsers);
        this.safeSetText('adminCount', this.data.rolesCount['Administrador'] || 0);
        this.safeSetText('clientCount', this.data.rolesCount['Cliente'] || 0);
        this.safeSetText('genderCount', Object.values(this.data.genderCount || {}).reduce((a, b) => a + b, 0));

        // Ventas
        const totalSalesRevenue = Object.values(this.data.monthlySales || {}).reduce((a, b) => a + Number(b), 0);
        this.safeSetText('totalVentas', Object.values(this.data.topProducts || {}).reduce((a, b) => a + b, 0));
        this.safeSetText('ingresosTotales', `$${totalSalesRevenue.toLocaleString()}`);
        this.safeSetText('productosVendidos', Object.values(this.data.topProducts || {}).reduce((a, b) => a + b, 0));
        this.safeSetText('clientesActivos', this.data.rolesCount['Cliente'] || 0);
    }

    safeSetText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    renderDefaultTab() {
        this.switchTab('productos');
    }

    renderTabCharts(tabId) {
        if (!this.data) return;

        switch(tabId) {
            case 'productos':
                this.renderProductCharts();
                break;
            case 'usuarios':
                this.renderUserCharts();
                break;
            case 'ventas':
                this.renderSalesCharts();
                break;
        }
    }

    getChartOptions(title) {
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
                },
                title: {
                    display: false
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

    renderProductCharts() {
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
                    this.chartColors.info, this.chartColors.accent
                ],
                borderWidth: 0
            }]
        }, { scales: { x: { display: false }, y: { display: false } } });

        // Precios - Line (Simulado con revenue trends por ahora o vacío)
        this.createChart('pricesChart', 'line', {
            labels: (this.data.revenueTrends || []).map(r => r.month),
            datasets: [{
                label: 'Referencia de Precios',
                data: (this.data.revenueTrends || []).map(r => r.revenue),
                borderColor: this.chartColors.primary,
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(16, 185, 129, 0.1)'
            }]
        });
    }

    renderUserCharts() {
        // Roles - Doughnut
        this.createChart('rolesChart', 'doughnut', {
            labels: Object.keys(this.data.rolesCount || {}),
            datasets: [{
                data: Object.values(this.data.rolesCount || {}),
                backgroundColor: [this.chartColors.primary, this.chartColors.secondary, this.chartColors.accent],
                borderWidth: 0
            }]
        }, { scales: { x: { display: false }, y: { display: false } } });

        // Género - Pie
        this.createChart('genderChart', 'pie', {
            labels: Object.keys(this.data.genderCount || {}),
            datasets: [{
                data: Object.values(this.data.genderCount || {}),
                backgroundColor: [this.chartColors.secondary, this.chartColors.pink, this.chartColors.gray],
                borderWidth: 0
            }]
        }, { scales: { x: { display: false }, y: { display: false } } });

        // Edad - Bar
        this.createChart('ageChart', 'bar', {
            labels: Object.keys(this.data.ageRangeCount || {}),
            datasets: [{
                label: 'Usuarios',
                data: Object.values(this.data.ageRangeCount || {}),
                backgroundColor: this.chartColors.indigo,
                borderRadius: 6
            }]
        });

        // Actividad - Line
        this.createChart('activityChart', 'line', {
            labels: Object.keys(this.data.monthlyUserRegistrations || {}),
            datasets: [{
                label: 'Nuevos Usuarios',
                data: Object.values(this.data.monthlyUserRegistrations || {}),
                borderColor: this.chartColors.secondary,
                tension: 0.4
            }]
        });
    }

    renderSalesCharts() {
        // Ventas por Mes - Bar
        this.createChart('ventasMesChart', 'bar', {
            labels: Object.keys(this.data.monthlySales || {}),
            datasets: [{
                label: 'Ventas ($)',
                data: Object.values(this.data.monthlySales || {}),
                backgroundColor: this.chartColors.warning,
                borderRadius: 6
            }]
        });

        // Top Productos - Doughnut
        this.createChart('topProductosChart', 'doughnut', {
            labels: Object.keys(this.data.topProducts || {}),
            datasets: [{
                data: Object.values(this.data.topProducts || {}),
                backgroundColor: [
                    this.chartColors.danger, this.chartColors.primary, 
                    this.chartColors.secondary, this.chartColors.warning, 
                    this.chartColors.pink
                ],
                borderWidth: 0
            }]
        }, { scales: { x: { display: false }, y: { display: false } } });

        // Tendencia Ingresos - Line
        this.createChart('tendenciaIngresosChart', 'line', {
            labels: (this.data.revenueTrends || []).map(r => r.month),
            datasets: [{
                label: 'Ingresos ($)',
                data: (this.data.revenueTrends || []).map(r => r.revenue),
                borderColor: this.chartColors.danger,
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(239, 68, 68, 0.1)'
            }]
        });
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
