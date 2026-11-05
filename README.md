<div align="center">

# 📦 S4HARA — SAP S/4HANA Logistics Interactive Simulator

### *High-fidelity Client-Side SAP ERP Simulation Engine for Supply Chain & Logistics Training*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SAP Fiori Horizon](https://img.shields.io/badge/Design_System-SAP_Fiori_Horizon_2026-0a6ed1?style=for-the-badge&logo=sap&logoColor=white)](https://experience.sap.com/fiori-design-web/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=for-the-badge)](https://conventionalcommits.org)
[![Zero Backend](https://img.shields.io/badge/Architecture-100%25_Client--Side_Reactive-107e3e?style=for-the-badge)](https://github.com/)

</div>

---

## 📋 Executive Summary & Capabilities

**S4HARA** es un simulador operativo interactivo de **SAP S/4HANA Cloud (Logistics Management Release 2026)** diseñado con fines educativos y de entrenamiento profesional para estudiantes y graduados de la **Licenciatura en Logística**.

El proyecto replica la experiencia operativa de un centro de distribución industrial real sin requerir costosas suscripciones de servidor, licencias SAP NetWeaver o configuraciones complejas de backend. Todo el motor corre de forma 100% reactiva en el cliente, persistiendo el estado en `localStorage` con aislamiento seguro de datos.

### Capacidades Destacadas

- **Doble Paradigma de Interfaz:** Interfaz moderna **SAP Fiori Horizon Launchpad** con barra de búsqueda global por códigos de transacción clásicos (`MMBE`, `MIGO`, `ME21N`, `VL01N`, `EWM`, `CASOS`).
- **Procure-to-Pay (P2P):** Recepción de camiones de proveedores contra pedidos de compra abiertos (PO), control de tolerancias, remitos y contabilización de Documentos de Material mediante movimiento `101`.
- **Gestión de Stock Multicentro (`MMBE`):** Desglose jerárquico de inventarios por Mandante $\rightarrow$ Centro (Planta 1010 / 1020) $\rightarrow$ Almacén (0001 General, 0002 Calidad, 0003 Expedición) $\rightarrow$ Lotes, con separación contable de Libre Utilización, Inspección y Bloqueado.
- **Traspasos Internos (`MIGO 311`):** Aislamiento de material no conforme a cuarentena en un solo paso.
- **Order-to-Cash (O2C) & Expedición (`VL01N / VL02N`):** Monitoreo de entregas salientes de clientes, ejecución de Picking y Contabilización de Salida de Mercancías (**PGI - Post Goods Issue / Movimiento 601**).
- **Visor 2D de Racks y Ubicaciones (EWM Lite):** Mapa interactivo de pasillos A, B, C y control de sobrecarga por estantería (`kg` vs capacidad estructural).
- **Misiones Guiadas para Entrevistas Laborales:** Casos de negocio reales con feedback paso a paso y consejos específicos para responder preguntas de reclutadores y líderes de logística.
- **Copiloto Joule AI Integrado:** Asistente conversacional con base de conocimiento técnico de logística en SAP.

---

## 🏛️ Visual Architecture & Data Flow

### 1. Ingestion & Transaction Data Flow (`flowchart TD`)

```mermaid
flowchart TD
    User["👤 Usuario / Estudiante de Logística"]
    Shell["🖥️ Fiori Launchpad Shell (Header & Command Bar)"]
    Router["🧭 Client Router / T-Code Dispatcher"]
    
    subgraph Apps["Módulos Operativos SAP"]
        MMBE["📦 MMBE (Resumen de Stock)"]
        MIGO["📥 MIGO (Entrada 101 / Traspaso 311)"]
        ME21N["🛒 ME21N (Pedidos de Compra)"]
        VL01N["🚚 VL01N (Entregas & PGI 601)"]
        EWM["🏗️ EWM (Racks & Ubicaciones)"]
        CASES["🎓 Misiones de Entrenamiento"]
    end

    subgraph StateEngine["Reactive Core State Engine"]
        Context["⚡ SAPContext (In-Memory React State)"]
        Validation["🛡️ Logistics Business Rule Validator"]
        DocGenerator["📄 Material Document Generator (500000xxxx / 490000xxxx)"]
    end

    subgraph StorageLayer["Persistence Layer"]
        Local["💾 LocalStorage Browser Engine"]
    end

    User -->|Comando T-Code o Click| Shell
    Shell --> Router
    Router --> Apps
    Apps -->|Transacción| Validation
    Validation --> Context
    Context --> DocGenerator
    Context --> Local
    DocGenerator --> Shell
```

### 2. Concurrency & Transactional Handshake (`sequenceDiagram`)

```mermaid
sequenceDiagram
    autonumber
    actor Alumno as Estudiante de Logística
    participant UI as MIGO Interface (Component)
    participant Engine as SAPContext Engine
    participant Validator as Business Rule Engine
    participant Storage as LocalStorage Persistence
    participant Toaster as SAP Fiori Toast Notification

    Alumno->>UI: Selecciona PO-4500000101, valida bultos y marca 'Posición OK'
    Alumno->>UI: Clic en 'Contabilizar Entrada (Post)'
    UI->>Engine: postGoodsReceiptPO(poId, itemsToReceive)
    Engine->>Validator: Validar (qty <= remaining, almacén != null, lote != empty)
    alt Validación Fallida
        Validator-->>Toaster: Emite Alerta de Error (H5/H9 Heurística)
        Toaster-->>Alumno: Muestra mensaje de discrepancia
    else Validación Exitosa
        Validator->>Engine: Aprobado
        Engine->>Engine: Incrementa stock en Almacén receptor
        Engine->>Engine: Reduce saldo pendiente de la Orden de Compra
        Engine->>Engine: Genera Documento de Material #500000xxxx (Mov. 101)
        Engine->>Storage: Sincroniza estado JSON en Storage
        Engine-->>Toaster: Toast de Éxito 'Documento de material 500000xxxx contabilizado'
        Toaster-->>Alumno: Confirmación visual con enlace cruzado a MMBE
    end
```

---

## 🔌 Data Structures & Protocol Specifications

### Documento de Material (Material Document Schema)

Formato del payload generado al contabilizar cualquier movimiento (`MIGO` o `VL01N`):

```json
{
  "docNumber": "5000001201",
  "postingDate": "2026-11-05",
  "docDate": "2026-11-05",
  "movementType": "101",
  "movementDescription": "Entrada de mercancías para pedido en almacén (101)",
  "headerText": "Remito Prov. Ref: Plásticos Industriales Austral S.A.",
  "createdBy": "LIC_LOGISTICA",
  "items": [
    {
      "itemNumber": 10,
      "materialId": "MAT-1001",
      "quantity": 100,
      "unit": "PAL",
      "plantId": "1010",
      "storageLocationId": "0001",
      "batch": "LOT-2026-A1",
      "referenceDoc": "PO-4500000101"
    }
  ]
}
```

### Registro de Stock Multicentro (Stock Record Schema)

Estructura de inventario en tiempo real utilizada para el balance contable en `MMBE`:

```json
{
  "id": "1010-0001-MAT-1001-LOT-2026-A1",
  "plantId": "1010",
  "storageLocationId": "0001",
  "materialId": "MAT-1001",
  "batch": "LOT-2026-A1",
  "unrestricted": 320,
  "qualityInspection": 0,
  "blocked": 0,
  "inTransit": 0,
  "reserved": 40,
  "lastMovementDate": "2026-11-05"
}
```

---

## 🚀 Reproducible Runbook: Build, Run & Deploy

### Requisitos Previos

- **Node.js:** $\ge$ v20.x o v24.x
- **npm:** $\ge$ v10.x
- **Git:** $\ge$ v2.40+

### 1. Clonar el Repositorio

```bash
git clone https://github.com/user/s4hara.git
cd s4hara
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Ejecutar Servidor de Desarrollo Local

```bash
npm run dev
```
Abre tu navegador en `http://localhost:5173`.

### 4. Compilar para Producción

```bash
npm run build
```
Los artefactos optimizados y listos para distribución se compilan en la carpeta `dist/`.

---

## 📜 Licencia y Propósito Educativo

Este software es un desarrollo independiente con propósitos formativos, didácticos y de entrenamiento para graduados en logística. No utiliza código fuente privativo ni binarios de SAP SE. Las marcas y nomenclaturas referenciadas pertenecen a sus respectivos titulares.
