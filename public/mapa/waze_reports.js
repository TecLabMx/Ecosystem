/* ========================================
   SISTEMA DE REPORTES Y ALERTAS ESTILO WAZE
   ======================================== */

const WazeReports = {
    reportMarkers: L.layerGroup(),
    reportTypes: {
        hazard: { icon: 'fa-triangle-exclamation', color: '#ffc107', name: 'Peligro' },
        police: { icon: 'fa-handcuffs', color: '#007bff', name: 'Policía' },
        closure: { icon: 'fa-road-barrier', color: '#dc3545', name: 'Cierre' },
        event: { icon: 'fa-calendar-day', color: '#6f42c1', name: 'Evento' }
    },

    init() {
        this.setupReportButton();
        this.reportMarkers.addTo(window.map);
        this.loadReports();
        // Cargar reportes cada 60 segundos
        setInterval(() => this.loadReports(), 60000);
        console.log('✓ Sistema de reportes Waze inicializado');
    },

    setupReportButton() {
        const reportButton = document.createElement('button');
        reportButton.className = 'waze-report-button';
        reportButton.id = 'waze-report-button';
        reportButton.innerHTML = '<i class="fas fa-bullhorn"></i> Reportar';
        reportButton.title = 'Reportar un incidente en el mapa';
        reportButton.addEventListener('click', () => this.showReportModal());
        
        // Asumiendo que existe un contenedor para botones flotantes
        const floatingContainer = document.querySelector('.floating-route-button') || document.body;
        floatingContainer.appendChild(reportButton);

        this.createReportModal();
    },

    createReportModal() {
        const modalHTML = `
            <div id="report-modal" class="waze-modal">
                <div class="waze-modal-content">
                    <span class="waze-modal-close">&times;</span>
                    <h3>Reportar Incidente</h3>
                    <p>Selecciona el tipo de incidente en tu ubicación actual:</p>
                    <div class="report-type-grid">
                        ${Object.entries(this.reportTypes).map(([key, value]) => `
                            <button class="report-type-btn" data-type="${key}">
                                <i class="fas ${value.icon}" style="color: ${value.color};"></i>
                                <span>${value.name}</span>
                            </button>
                        `).join('')}
                    </div>
                    <p id="report-status" style="margin-top: 15px;"></p>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.getElementById('report-modal');
        const closeBtn = modal.querySelector('.waze-modal-close');
        closeBtn.onclick = () => modal.style.display = 'none';
        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };

        modal.querySelectorAll('.report-type-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.currentTarget.getAttribute('data-type');
                this.submitReport(type);
            });
        });
    },

    showReportModal() {
        const modal = document.getElementById('report-modal');
        const status = document.getElementById('report-status');
        
        if (!window.lastUserCoord) {
            status.textContent = '⚠️ No se pudo obtener tu ubicación actual. Asegúrate de tener la geolocalización activada.';
            status.style.color = this.reportTypes.closure.color;
            return;
        }
        
        status.textContent = '';
        modal.style.display = 'block';
    },

    async submitReport(type) {
        const status = document.getElementById('report-status');
        status.textContent = 'Enviando reporte...';
        status.style.color = this.reportTypes.police.color;

        if (!window.lastUserCoord) {
            status.textContent = '⚠️ Error: Ubicación no disponible.';
            status.style.color = this.reportTypes.closure.color;
            return;
        }

        const [lng, lat] = window.lastUserCoord;
        const reportData = {
            type: type,
            location: [lng, lat],
            timestamp: new Date().toISOString(),
            user: 'anonymous'
        };

        try {
            const response = await fetch('/api/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reportData)
            });

            if (response.ok) {
                status.textContent = `✅ Reporte de ${this.reportTypes[type].name} enviado con éxito.`;
                status.style.color = this.reportTypes.hazard.color;
                this.loadReports(); // Recargar para ver el nuevo reporte
                setTimeout(() => document.getElementById('report-modal').style.display = 'none', 2000);
            } else {
                status.textContent = `❌ Error al enviar el reporte: ${response.statusText}`;
                status.style.color = this.reportTypes.closure.color;
            }
        } catch (error) {
            status.textContent = `❌ Error de red: ${error.message}`;
            status.style.color = this.reportTypes.closure.color;
        }
    },

    async loadReports() {
        try {
            const response = await fetch('/api/reports');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const reports = await response.json();
            this.renderReports(reports);
            console.log(`✓ ${reports.length} reportes cargados.`);
        } catch (error) {
            console.error('Error al cargar reportes:', error);
        }
    },

    renderReports(reports) {
        this.reportMarkers.clearLayers();

        reports.forEach(report => {
            const typeInfo = this.reportTypes[report.type] || this.reportTypes.hazard;
            const iconHTML = `<i class="fas ${typeInfo.icon}" style="color: ${typeInfo.color}; font-size: 20px;"></i>`;
            
            const customIcon = L.divIcon({
                className: 'waze-report-icon',
                html: `<div style="background-color: ${typeInfo.color}; border-radius: 50%; padding: 5px; box-shadow: 0 0 10px ${typeInfo.color};">${iconHTML}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -30]
            });

            const marker = L.marker([report.location[1], report.location[0]], { icon: customIcon })
                .bindPopup(`<b>Reporte:</b> ${typeInfo.name}<br><b>Hora:</b> ${new Date(report.timestamp).toLocaleTimeString()}`);
            
            this.reportMarkers.addLayer(marker);
        });
    }
};

// Sistema de reportes deshabilitado
// Para habilitar, descomentar el siguiente código:
/*
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.map) {
            WazeReports.init();
        } else {
            console.error('❌ El objeto mapa (window.map) no está disponible para inicializar WazeReports.');
        }
    }, 1000);
});
*/

window.WazeReports = WazeReports;
