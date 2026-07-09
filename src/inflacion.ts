export interface MesInflacion {
    fecha: string; // Formato yyyy-mm
    inflacionMensual: number;
}

export const HISTORIAL_INFLACION: MesInflacion[] = [
    // --- AÑO 2023 ---
    { fecha: "2023-06", inflacionMensual: 6.0 },
    { fecha: "2023-07", inflacionMensual: 6.3 },
    { fecha: "2023-08", inflacionMensual: 12.4 },
    { fecha: "2023-09", inflacionMensual: 12.7 },
    { fecha: "2023-10", inflacionMensual: 8.3 },
    { fecha: "2023-11", inflacionMensual: 12.8 },
    { fecha: "2023-12", inflacionMensual: 25.5 },

    // --- AÑO 2024 ---
    { fecha: "2024-01", inflacionMensual: 20.6 },
    { fecha: "2024-02", inflacionMensual: 13.2 },
    { fecha: "2024-03", inflacionMensual: 11.0 },
    { fecha: "2024-04", inflacionMensual: 8.8 },
    { fecha: "2024-05", inflacionMensual: 4.2 },
    { fecha: "2024-06", inflacionMensual: 4.6 },
    { fecha: "2024-07", inflacionMensual: 4.0 },
    { fecha: "2024-08", inflacionMensual: 4.2 },
    { fecha: "2024-09", inflacionMensual: 3.5 },
    { fecha: "2024-10", inflacionMensual: 2.7 },
    { fecha: "2024-11", inflacionMensual: 2.4 },
    { fecha: "2024-12", inflacionMensual: 2.7 },

    // --- AÑO 2025 ---
    { fecha: "2025-01", inflacionMensual: 2.5 },
    { fecha: "2025-02", inflacionMensual: 2.3 },
    { fecha: "2025-03", inflacionMensual: 2.7 }, // Pico estacional educativo
    { fecha: "2025-04", inflacionMensual: 2.2 },
    { fecha: "2025-05", inflacionMensual: 2.0 },
    { fecha: "2025-06", inflacionMensual: 2.1 },
    { fecha: "2025-07", inflacionMensual: 2.2 },
    { fecha: "2025-08", inflacionMensual: 2.4 },
    { fecha: "2025-09", inflacionMensual: 2.1 },
    { fecha: "2025-10", inflacionMensual: 2.0 },
    { fecha: "2025-11", inflacionMensual: 1.9 },
    { fecha: "2025-12", inflacionMensual: 2.2 },

    // --- AÑO 2026 ---
    { fecha: "2026-01", inflacionMensual: 2.9 },
    { fecha: "2026-02", inflacionMensual: 2.9 },
    { fecha: "2026-03", inflacionMensual: 3.4 },
    { fecha: "2026-04", inflacionMensual: 2.6 },
    { fecha: "2026-05", inflacionMensual: 2.1 },
    { fecha: "2026-06", inflacionMensual: 2.0 } // Estimado REM
];