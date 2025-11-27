# 📊 Resumen Ejecutivo del Sector Salud Colombia — Reto de Ingeniería de Prompting

Este repositorio documenta la **solución completa al test técnico** cuyo objetivo fue diseñar un sistema capaz de analizar noticias del sector salud colombiano y producir reportes ejecutivos de alta calidad para industria farmacéutica.

La solución se basa en **dos prompts maestros complementarios**, ejecutados en pipeline:
1. **Prompt de análisis individual de noticias**  
2. **Prompt de consolidación semanal ejecutiva**

---

## 📺 Video resumen del proyecto
🎥 Explicación funcional del flujo, arquitectura del prompting y demostración:  
👉 https://youtu.be/HwL_JFhkpVQ

---

## 📂 Ejemplos de resultados generados
📁 Carpeta con salidas reales del sistema (resúmenes individuales, consolidaciones, etc.):  
👉 https://drive.google.com/drive/folders/1-BFr1nDVIRlrThs6o_ZjoOdh80AbXXoT?usp=drive_link

---

## 📄 Google Sheet de ejecución
Toda la solución fue implementada en Google Sheets mediante Apps Script + LLM API:
📄 https://docs.google.com/spreadsheets/d/1ehgVWumsPU_ibK6IiBBCDul6mdkMOPhtkWFrDJKwEKs/edit?usp=drive_link

---

# 🧠 Arquitectura de la solución

La solución se divide en **dos niveles de prompting**:

---

## 1️⃣ Análisis individual de noticia
Cada pieza informativa pasa primero por el **PROMPT RESUMEN EJECUTIVO DE NOTICIAS DEL SECTOR SALUD**.  
Este prompt:

- Aíslan el contexto de la noticia  
- Impide inventar datos, actores o cifras
- Analiza **solo tres ejes**:
  - Flujo de recursos (ADRES, UPC, PM, giros)
  - Acceso terapéutico (INVIMA, PBS/UPC, IETS, compras centralizadas, MIPRES)
  - Regulación de precios (CNPMDM, SISMED, circulares, sanciones)

📌 El resultado es un reporte ejecutivo de una sola noticia, **con estructura rígida, profesional y accionable**.

### Características clave
- Lenguaje corporativo orientado a toma de decisiones  
- Sin interpretación fuera de evidencia  
- Semáforo de impacto con criterios claros  
- Reglas anti-alucinación explícitas  
- Prohibición del uso de `$1`, `$2`, `$3` u otros marcadores numéricos no monetarios  
- Valores monetarios escritos completos (“4,89 billones de pesos”)

---

## 2️⃣ Consolidación ejecutiva semanal
Una vez procesadas varias noticias, se genera un informe consolidado aplicando el segundo prompt:

> **Eres un analista senior del sector salud en Colombia especializado en la industria farmacéutica.  
> Tu función es condensar múltiples análisis y convertirlos en un informe ejecutivo para alta dirección.**

Este prompt:
- **NO resume noticia por noticia**
- Detecta **patrones sectoriales**
- Identifica riesgos sistémicos
- Traduce eventos en **impactos estratégicos reales** para laboratorios

### Dimensiones clave del consolidado
- Market Access  
- Tesorería y liquidez  
- Regulación y cumplimiento  
- Comercial y Forecasting  

El resultado final incluye:
- Ideas fuerza
- Impactos consolidados por eje
- Evaluación de riesgo semanal
- Recomendaciones accionables (no genéricas)
- Conclusión estratégica
- Stakeholders clave

---

# 🚦 Reglas críticas para evitar alucinaciones

Ambos prompts incluyen barreras explícitas:
- **No inventar cifras, fechas, decisiones o actores**
- **No imputar contextos regulatorios no citados**
- **Declarar “No aplica” cuando no exista evidencia**
- **No llenar vacíos con interpretación**
- Formatos estrictamente ejecutivos y legibles por C-Suite

---

# ⚙️ Flujo de trabajo

1. Recolectar noticias de fuentes verificables (ADRES, MinSalud, INVIMA, IETS, consultorsalud, SISMED, SIC, medios económicos).
2. Alimentar cada noticia en el **Prompt Individual**.
3. Acumular análisis individuales.
4. Introducirlos al **Prompt de Consolidación Semanal**.
5. Exportar resultado final a informe.

---

