<div align="center">

# S4HARA — SAP S/4HANA Logistics Interactive Simulator

### *UTN FRBB Licenciatura en Logística → SAP S/4HANA Fiori Morning Horizon Edition*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SAP Fiori Horizon](https://img.shields.io/badge/Design_System-SAP_Fiori_Morning_Horizon-0a6ed1?style=for-the-badge&logo=sap&logoColor=white)](https://experience.sap.com/fiori-design-web/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=for-the-badge)](https://conventionalcommits.org)
[![Zero Backend](https://img.shields.io/badge/Architecture-100%25_Client--Side_Reactive-107e3e?style=for-the-badge)](https://github.com/nedder3/S4HARA)

</div>

---

## Executive Summary & Curriculum Alignment

**S4HARA** es un simulador operativo 100% client-side de **SAP S/4HANA Cloud (Logistics Management)** diseñado específicamente a partir de la currícula de la **Licenciatura en Logística (UTN FRBB)**. Traduce los trabajos prácticos, fórmulas y casos de negocio de la carrera directamente a las transacciones, movimientos y tableros analíticos que operan las empresas reales sobre SAP.

### Mapeo Currícula UTN → SAP S/4HANA

| Materia / Caso UTN | Transacción / App en S4HARA | Capacidad Operativa Simulada |
| :--- | :--- | :--- |
| **Planificación y Control (TP3 MRP)** | `MD04` / `CS03` | Proyección semanal (6 semanas), Requerimientos brutos/netos, Lead Time, Lote a Lote / Lote Fijo / EOQ, evaluación de costos y explosión BOM. |
| **Gestión de Abastecimiento I (TP2 ABC)** | `MC40` / `MMBE` | Análisis ABC / Curva de Pareto interactiva por 3 criterios (*Valor de Utilización*, *Valorizado de Inventario*, *Costo Unitario*). |
| **Crisis Logística TecnoSur (PL-IV)** | `MIGO 344` + `ME21N` + `MIGO 101` | Bloqueo preventivo de stock ante inundación (`Mov. 344`), evaluación de proveedores P2/P3 (confiabilidad y plazo) y recepción de emergencia (`Mov. 101`). |
| **Expedición y Muelles (PL-IV)** | `VL02N` + **EWM Dock** | Picking, checklist obligatorio de 5 controles de carga, PGI (`Mov. 601`) y dimensionamiento de muelles $N = \frac{Q_d T_d + Q_c T_c}{H \cdot 60 \cdot U}$ (compartidos vs exclusivos). |
| **Logística Inversa (Metalúrgica del Sur)** | `MIGO 651` | Recepción obligatoria de devoluciones en Almacén `0004` (Bloqueado), inspección técnica y clasificación de unidades recuperables. |
| **Gerenciamiento y Control de Gestión** | `CMI` / `OTIF` | Tablero Fiori Overview Page en tiempo real: Exactitud, Salidas a Tiempo, OTIF, Utilización de Muelle, Tasa de Devolución y Tasa de Recuperación. |

---

## Visual Architecture & Data Flow

### 1. System Architecture Flowchart (`flowchart TD`)

```mermaid
flowchart TD
    User["Estudiante de Logistica"]
    Shell["Fiori Morning Horizon Shell (T-Code Command Bar + Joule Tutor)"]
    Router["Client Router / T-Code Dispatcher"]

    subgraph Apps["Modulos SAP S/4HANA UTN-Aligned"]
        MMBE["MMBE: Stock Multicentro + ABC"]
        MIGO["MIGO: 101 / 311 / 344 Bloqueo / 651 Devoluciones"]
        MD04["MD04 / CS03: Monitor MRP y Explosion BOM"]
        MC40["MC40: Analisis ABC / Pareto (3 Criterios)"]
        ME21N["ME21N: Compras y Proveedores P2/P3"]
        VL02N["VL02N: Expedicion 5 Controles, PGI 601 y Muelles"]
        CMI["CMI / OTIF: Tablero Analitico Fiori"]
        EWM["EWM Bins: Mapa 2D de Racks"]
        CASES["Misiones UTN-to-SAP (TecnoSur, Metalurgica del Sur)"]
    end

    subgraph Engine["Reactive Client-Side State Engine"]
        Context["SAPContext (In-Memory State)"]
        Docs["Material Document Generator (500000xxxx / 490000xxxx)"]
        Storage["LocalStorage Persistence (S4HARA_SAP_UTN_V2)"]
    end

    User -->|T-Code o Click| Shell
    Shell --> Router
    Router --> Apps
    Apps --> Context
    Context --> Docs
    Context --> Storage
```

### 2. Transactional & Reverse Logistics Sequence (`sequenceDiagram`)

```mermaid
sequenceDiagram
    autonumber
    actor Alumno as Lic. en Logistica
    participant MIGO as MIGO UI (344 / 651)
    participant Engine as SAPContext Engine
    participant MMBE as MMBE Stock & CMI KPIs
    participant Storage as LocalStorage

    Alumno->>MIGO: Registra Devolucion RET-6500001 (5 motores, Mov. 651)
    MIGO->>Engine: postCustomerReturn("RET-6500001")
    Engine->>Engine: Ingresa 5 u. en Almacen 0004 (Bloqueado, nunca Libre)
    Engine->>Engine: Genera Doc. Material #500000xxxx (Mov. 651)
    Engine->>Storage: Persiste estado JSON y actualiza unidades devueltas
    Alumno->>MIGO: Inspecciona y clasifica 2 u. recuperables
    MIGO->>Engine: resolveReturnInspection("RET-6500001", 2, "REACONDICIONAR")
    Engine->>MMBE: Traslada 2 u. a 0001 Libre y recalcula Tasa de Recuperacion en CMI
```

---

## Protocol & Data Schemas

### Documento de Material (`MaterialDocument`)

```json
{
  "docNumber": "5000004821",
  "postingDate": "2026-11-21",
  "docDate": "2026-11-21",
  "movementType": "344",
  "movementDescription": "Traspaso Libre Utilización a Stock Bloqueado (344)",
  "headerText": "Inundación Centro 1010 — Bloqueo preventivo auditoría TecnoSur",
  "createdBy": "FRANCO_LOG_UTN",
  "items": [
    {
      "itemNumber": 10,
      "materialId": "MAT-A100",
      "quantity": 17,
      "unit": "UN",
      "plantId": "1010",
      "storageLocationId": "0001",
      "batch": "LOT-TS-A1"
    }
  ]
}
```

---

## Reproducible Build Guide

### Requisitos
- Node.js $\ge$ 20.x
- npm $\ge$ 10.x

```bash
git clone git@github.com:nedder3/S4HARA.git
cd S4HARA
npm install
npm run dev
```

Compilación de producción:

```bash
npm run build
```
