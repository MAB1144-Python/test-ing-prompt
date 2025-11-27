// Configuración de la API de Groq
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Crea el menú personalizado al abrir el documento
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🤖 Groq LLM')
    .addItem('📝 Configurar Prompt', 'configurarPrompt')
    .addItem('▶️ Ejecutar Prompt en Selección', 'ejecutarEnCelda')
    .addToUi();
}

/**
 * Muestra el panel lateral para interactuar con el LLM
 */
function mostrarPanel() {
  const html = HtmlService.createHtmlOutputFromFile('Panel')
    .setTitle('Groq LLM Assistant')
    .setWidth(400);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Configura la API Key de Groq
 */
function configurarAPIKey() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Configurar API Key de Groq',
    'Ingresa tu API Key de Groq:',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() == ui.Button.OK) {
    const apiKey = response.getResponseText();
    PropertiesService.getScriptProperties().setProperty('key-groq', apiKey);
    ui.alert('✅ API Key configurada correctamente');
  }
}

/**
 * Obtiene la API Key almacenada desde las propiedades del script
 */
function obtenerAPIKey() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('key-groq');
  if (!apiKey) {
    throw new Error('❌ No se encontró la API Key. Por favor configúrala en: Groq LLM → Configurar API Key');
  }
  return apiKey;
}

/**
 * Configura el prompt prediseñado
 */
function configurarPrompt() {
  const ui = SpreadsheetApp.getUi();
  const promptActual = PropertiesService.getScriptProperties().getProperty('prompt-prediseñado') || obtenerPromptPorDefecto();
  
  const htmlTemplate = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
    <head>
      <base target="_top">
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        textarea { width: 100%; height: 400px; font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
        .buttons { margin-top: 15px; display: flex; gap: 10px; }
        button { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
        .btn-primary { background: #1a73e8; color: white; }
        .btn-secondary { background: #5f6368; color: white; }
        .btn-default { background: #e8eaed; color: #202124; }
        button:hover { opacity: 0.9; }
        .info { background: #e8f0fe; padding: 10px; border-radius: 4px; margin-bottom: 15px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="info">
        <strong>Instrucciones:</strong><br>
        • Usa <code>{valor}</code> donde quieras insertar el contenido de cada celda<br>
        • El prompt se aplicará a todas las celdas seleccionadas<br>
        • Puedes usar el prompt por defecto o personalizarlo
      </div>
      <textarea id="promptText">${promptActual.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
      <div class="buttons">
        <button class="btn-primary" onclick="guardar()">💾 Guardar</button>
        <button class="btn-default" onclick="restaurarDefecto()">🔄 Restaurar por defecto</button>
        <button class="btn-secondary" onclick="google.script.host.close()">Cancelar</button>
      </div>
      <script>
        function guardar() {
          const texto = document.getElementById('promptText').value;
          if (texto.trim() === '') {
            alert('⚠️ El prompt no puede estar vacío');
            return;
          }
          if (!texto.includes('{valor}')) {
            alert('⚠️ El prompt debe incluir {valor} para insertar el contenido de las celdas');
            return;
          }
          google.script.run.withSuccessHandler(function() {
            alert('✅ Prompt configurado correctamente');
            google.script.host.close();
          }).guardarPrompt(texto);
        }
        
        function restaurarDefecto() {
          if (confirm('¿Restaurar el prompt por defecto?')) {
            google.script.run.withSuccessHandler(function(defecto) {
              document.getElementById('promptText').value = defecto;
            }).obtenerPromptPorDefecto();
          }
        }
      </script>
    </body>
    </html>
  `).setWidth(700).setHeight(600);
  
  ui.showModalDialog(htmlTemplate, '📝 Configurar Prompt');
}

/**
 * Obtiene el prompt por defecto para el sector salud
 */
function obtenerPromptPorDefecto() {
  return `# 🧠 PROMPT RESUMEN EJECUTIVO DE NOTICIAS DEL SECTOR SALUD

**Rol del modelo:**  
Actúa como **analista experto del sistema de salud colombiano**, con enfoque en **industria farmacéutica, acceso al mercado, regulación y finanzas sectoriales**.  
Tu análisis debe basarse **exclusivamente en la noticia proporcionada** y en conceptos regulatorios generales (ADRES, UPC, INVIMA, IETS, CNPMDM, PBS, SISMED, MIPRES).  
**Evita alucinaciones, inferencias sin evidencia o suposiciones.**

---

## 📄 Tarea
Analiza la siguiente **noticia del sector salud en Colombia**, correspondiente a la **última semana**, y construye un **resumen ejecutivo formal** enfocado en su impacto para la **industria farmacéutica**.

**NOTICIA:**
{valor}

---

## 📊 Lineamientos de análisis (NO describas elementos que no aparecen)

### 1️⃣ FLUJO DE RECURSOS FINANCIEROS
Evalúa únicamente si la noticia menciona hechos verificables relacionados con:
- ADRES (giro directo, UPC, reservas, transferencias)
- Presupuestos máximos
- Cambios regulatorios o fiscales sobre financiación
- Impacto en flujo de caja de EPS
- Efectos en tesorería de proveedores o laboratorios  
> Si no hay evidencia explícita → **“No aplica. La noticia no presenta datos relacionados.”**

### 2️⃣ ACCESO A NUEVAS TERAPIAS
Analiza solo si la noticia incluye:
- Registros sanitarios INVIMA
- Inclusiones o exclusiones al PBS/UPC
- Evaluaciones del IETS
- Compras centralizadas / acuerdos de suministro
- Emisiones MIPRES  
> Si no hay evidencia → **“No se identifican efectos sobre acceso terapéutico.”**

### 3️⃣ REGULACIÓN DE PRECIOS
Evalúa únicamente si hay información directa sobre:
- Decisiones CNPMDM
- Reportes o deberes SISMED
- Circulares de control de precios
- Sanciones o procedimientos regulatorios  
> Si no hay evidencia → **“No se identifican acciones regulatorias en precios.”**

---

## 📦 FORMATO DE SALIDA OBLIGATORIO

Genera un documento ejecutivo profesional siguiendo ESTRICTAMENTE esta estructura:

---

# RESUMEN EJECUTIVO — [TÍTULO DESCRIPTIVO DE LA NOTICIA]

**Periodo de análisis:** [Fecha de la noticia]  
**Analista:** Msg Brayan Andru Montenegro Embus

---

## SÍNTESIS EJECUTIVA

[Párrafo de 3-4 líneas que resuma el impacto principal para la industria farmacéutica de manera formal y directa, sin viñetas ni listas. Lenguaje corporativo y orientado a toma de decisiones. Máximo 60 palabras.]

---

## ANÁLISIS DE IMPACTO

### 1. Flujo de Recursos Financieros

**Situación identificada:**
[Párrafo descriptivo del cambio o situación identificada basado en hechos verificables de la noticia]

**Impacto para la industria farmacéutica:**
[Párrafo que explique las consecuencias directas sobre liquidez, pagos, cartera, tesorería, etc.]

**Factores operativos relevantes:**
• [Factor operativo 1]
• [Factor operativo 2]
• [Factor operativo 3]

---

### 2. Acceso a Nuevas Terapias

**Situación identificada:**
[Párrafo descriptivo del movimiento del mercado o cambios en acceso]

**Impacto para la industria farmacéutica:**
[Párrafo que explique las implicaciones comerciales, clínicas o de adopción terapéutica]

**Factores clave:**
• [Factor 1]
• [Factor 2]

> Si no aplica: "No se identifican cambios relevantes en acceso a terapias según la información disponible."

---

### 3. Regulación de Precios

**Situación identificada:**
[Párrafo descriptivo de los cambios regulatorios o acciones de control de precios]

**Impacto para la industria farmacéutica:**
[Párrafo que explique los efectos en pricing, márgenes y cumplimiento normativo]

> Si no aplica: "No se identifican acciones regulatorias relacionadas con precios en esta noticia."

---

## EVALUACIÓN DE RIESGO

**Nivel de impacto:** [Selecciona SOLO UNO: 🔴 Crítico  O  🟡 Moderado  O  🟢 Positivo]

**Justificación:**
[Párrafo de 2-3 líneas que fundamente la calificación asignada basándose en evidencia concreta de la noticia. Explicar por qué se considera crítico, moderado o positivo.]

**Criterios de selección:**
- 🔴 Crítico: Riesgo regulatorio/financiero grave o inmediato que requiere acción urgente
- 🟡 Moderado: Cambio incremental, incertidumbre operativa o presión sectorial que requiere monitoreo
- 🟢 Positivo: Mejora en pagos, acceso, adopción terapéutica o liquidez

---

## RECOMENDACIONES ESTRATÉGICAS

1. **[Área funcional - Market Access/Finanzas/Regulatorio/Comercial]:** [Recomendación específica, accionable y directamente relacionada con la noticia]

2. **[Área funcional]:** [Recomendación específica, accionable y directamente relacionada con la noticia]

3. **[Área funcional]:** [Recomendación específica, accionable y directamente relacionada con la noticia]

---

## PRIORIDAD DE SEGUIMIENTO

**Nivel:** [Alta / Media / Baja]

**Fundamento:** [1-2 líneas justificando el nivel de prioridad asignado según urgencia, exposición y riesgo para la industria]

---

**NOTAS IMPORTANTES:** 
- Si alguna sección NO aplica, indicar explícitamente con la frase sugerida
- Usar lenguaje formal y ejecutivo en todo momento
- NO usar emojis en el cuerpo del texto (solo en el título de nivel de impacto del semáforo)
- Mantener párrafos concisos (máximo 4-5 líneas cada uno)
- Preferir descripción narrativa ejecutiva sobre listas extensas
- NO inventar datos, cifras o decisiones no mencionadas en la noticia
- **IMPORTANTE:** NO usar símbolos como $1, $2, $3 para numerar secciones
- Al mencionar valores monetarios, escribir el número completo sin usar $ como variable (ejemplo: "70 mil millones de pesos" en lugar de "$70")

---

### 🧠 REGLAS DE NO-ALUCINACIÓN
- No completar vacíos con interpretación.
- No atribuir decisiones regulatorias no citadas.
- No proyectar cifras, fechas ni actores no mencionados.
- No agregar contexto histórico no solicitado.
- Si un eje no aplica → Declararlo explícitamente.
- **CRÍTICO:** NO usar $1, $2, $3, etc. como marcadores o numeradores de secciones.
- **CRÍTICO:** Evitar cualquier uso de $ seguido de números que no sean valores monetarios reales.
- Al escribir valores monetarios, usar formato completo: "4,89 billones de pesos" o "COP 4,89 billones".

---

## 🔖 EJEMPLO (NO USAR PARA RELLENAR DATOS REALES)

**RESUMEN EJECUTIVO:**  
La ADRES ajustó temporalmente el giro directo hacia EPS priorizando servicios UPC, lo que podría generar retrasos en pagos a proveedoras farmacéuticas dependientes de tecnologías no financiadas por UPC.

💰 **Flujo de Recursos:**  
Se priorizan giros operativos UPC; pagos de tecnologías MIPRES podrían extenderse. Potencial presión de liquidez para laboratorios con alto volumen no PBS.

💊 **Acceso a Terapias:**  
No aplica.

💲 **Regulación de Precios:**  
No aplica.

🚦 **Semáforo:** 🟡 Moderado — Impacto temporal sobre flujo de caja.

**Recomendaciones:**
1. Renegociar calendarios de pago con EPS prioritarias.
2. Optimizar rotación de inventarios vinculados a tecnologías no PBS.
3. Monitorear la ejecución de giros ADRES y ventanas de ajuste.
4. Escribir en máximo 100 palabras el análisis completo.

⚡ **Prioridad:** Alta
`;
}

/**
 * Guarda el prompt personalizado
 */
function guardarPrompt(texto) {
  PropertiesService.getScriptProperties().setProperty('prompt-prediseñado', texto);
}

/**
 * Obtiene el prompt prediseñado
 */
function obtenerPrompt() {
  let prompt = PropertiesService.getScriptProperties().getProperty('prompt-prediseñado');
  if (!prompt) {
    // Si no hay prompt configurado, usar el por defecto
    prompt = obtenerPromptPorDefecto();
    PropertiesService.getScriptProperties().setProperty('prompt-prediseñado', prompt);
  }
  return prompt;
}

/**
 * Ejecuta el modelo LLM en las celdas seleccionadas usando el prompt prediseñado
 */
function ejecutarEnCelda() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();
  const values = range.getValues();
  const numRows = range.getNumRows();
  const numCols = range.getNumColumns();
  
  // Si no hay selección o está vacía
  if (!range || numRows === 0) {
    SpreadsheetApp.getUi().alert('⚠️ Por favor selecciona una o más celdas con contenido');
    return;
  }
  
  // Obtener el prompt prediseñado
  let promptTemplate;
  try {
    promptTemplate = obtenerPrompt();
  } catch (error) {
    SpreadsheetApp.getUi().alert(error.message);
    return;
  }
  
  SpreadsheetApp.getUi().alert('🚀 Procesando ' + (numRows * numCols) + ' celda(s) con el prompt configurado...\n\nEsto puede tomar unos momentos.');
  
  const resultados = [];
  let celdasProcesadas = 0;
  const totalCeldas = numRows * numCols;
  
  // Procesar cada celda
  for (let i = 0; i < numRows; i++) {
    const fila = [];
    for (let j = 0; j < numCols; j++) {
      const cellValue = values[i][j];
      
      if (cellValue && cellValue.toString().trim() !== '') {
        try {
          // Reemplazar {valor} con el contenido de la celda
          const promptFinal = promptTemplate.replace('{valor}', cellValue.toString());
          const respuesta = llamarGroqAPI(promptFinal);
          fila.push(respuesta);
          
          celdasProcesadas++;
          
          // Esperar 60 segundos entre cada celda procesada (excepto la última)
          if (celdasProcesadas < totalCeldas) {
            Logger.log('Esperando 40 segundos antes de procesar la siguiente celda...');
            Utilities.sleep(40000); // 40 segundos = 40000 milisegundos
          }
        } catch (error) {
          fila.push('ERROR: ' + error.message);
        }
      } else {
        fila.push('');
      }
    }
    resultados.push(fila);
  }
  
  // Colocar resultados en las celdas adyacentes (a la derecha)
  const targetRange = range.offset(0, numCols, numRows, numCols);
  targetRange.setValues(resultados);
  
  // Guardar análisis para el resumen consolidado
  guardarAnalisisParaResumen(values, resultados);
  
  // Generar resumen consolidado automáticamente
  SpreadsheetApp.getUi().alert('✅ Proceso completado: ' + (numRows * numCols) + ' celda(s) procesadas\n\n🔄 Generando resumen consolidado automáticamente...');
  
  generarResumenConsolidado();
}

/**
 * Función principal para llamar a la API de Groq
 */
function llamarGroqAPI(prompt, modelo = 'llama-3.3-70b-versatile', temperatura = 0.7, maxTokens = 1024) {
  const apiKey = obtenerAPIKey();
  
  const payload = {
    model: modelo,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: temperatura,
    max_tokens: maxTokens
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(GROQ_API_URL, options);
    const json = JSON.parse(response.getContentText());
    
    if (json.error) {
      throw new Error('Error de API: ' + json.error.message);
    }
    
    return json.choices[0].message.content;
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    throw new Error('Error al conectar con Groq: ' + error.toString());
  }
}

/**
 * Función personalizada para usar en fórmulas de Sheets
 * Uso: =GROQ("Tu pregunta aquí")
 */
function GROQ(prompt, modelo, temperatura) {
  if (!prompt) {
    return '❌ Proporciona un prompt';
  }
  
  try {
    modelo = modelo || 'llama-3.3-70b-versatile';
    temperatura = temperatura || 0.7;
    return llamarGroqAPI(prompt, modelo, temperatura);
  } catch (error) {
    return 'ERROR: ' + error.toString();
  }
}

/**
 * Obtiene la lista de modelos disponibles
 */
function obtenerModelos() {
  return [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Recomendado)' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Rápido)' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B' }
  ];
}

/**
 * Guarda los análisis para generar el resumen consolidado
 */
function guardarAnalisisParaResumen(noticias, analisis) {
  const fecha = new Date().toISOString();
  const datos = {
    fecha: fecha,
    noticias: noticias,
    analisis: analisis
  };
  
  // Guardar en propiedades del script
  let historial = PropertiesService.getScriptProperties().getProperty('historial-analisis');
  let listaAnalisis = historial ? JSON.parse(historial) : [];
  
  listaAnalisis.push(datos);
  
  // Mantener solo los últimos 50 análisis
  if (listaAnalisis.length > 50) {
    listaAnalisis = listaAnalisis.slice(-50);
  }
  
  PropertiesService.getScriptProperties().setProperty('historial-analisis', JSON.stringify(listaAnalisis));
}

/**
 * Genera un resumen consolidado de todos los análisis
 */
function generarResumenConsolidado() {
  const ui = SpreadsheetApp.getUi();
  
  // Obtener historial de análisis
  const historial = PropertiesService.getScriptProperties().getProperty('historial-analisis');
  
  if (!historial) {
    ui.alert('⚠️ No hay análisis previos para consolidar.\n\nPrimero ejecuta "Ejecutar Prompt en Selección" sobre algunas noticias.');
    return;
  }
  
  const listaAnalisis = JSON.parse(historial);
  
  if (listaAnalisis.length === 0) {
    ui.alert('⚠️ No hay análisis previos para consolidar.');
    return;
  }
  
  // Construir texto con todos los análisis sin mostrar alert
  let textoCompleto = 'A continuación se presentan los análisis individuales del sector salud en Colombia:\n\n';
  
  listaAnalisis.forEach((item, index) => {
    textoCompleto += `--- ANÁLISIS ${index + 1} ---\n`;
    textoCompleto += `Fecha: ${new Date(item.fecha).toLocaleString('es-CO')}\n\n`;
    
    item.analisis.forEach((fila, i) => {
      fila.forEach((analisis, j) => {
        if (analisis && analisis.trim() !== '') {
          textoCompleto += analisis + '\n\n';
        }
      });
    });
    
    textoCompleto += '\n';
  });
  
  // Crear prompt para consolidación
  const promptConsolidacion = `Eres un analista senior del sector salud en Colombia especializado en la industria farmacéutica. 
Tu función es condensar múltiples análisis de noticias del sector salud colombiano de la última semana y convertirlos en un informe ejecutivo para alta dirección (C-Suite, gerencias funcionales).

A continuación tienes varios análisis previos:
${textoCompleto}

---

📌 OBJETIVO:
Generar un **RESUMEN EJECUTIVO SEMANAL CONSOLIDADO**, evitando repeticiones, agrupando tendencias y priorizando hallazgos que tengan efecto real en:
- Market Access
- Tesorería y Liquidez
- Regulación y cumplimiento (compliance)
- Comercial y Forecasting

**NO resumas noticia por noticia.**  
**Extrae patrones, correlaciones, señales y riesgos.**

---

# 📊 RESUMEN EJECUTIVO SEMANAL — SECTOR SALUD COLOMBIA
**Periodo analizado:** [Semana real]  
**Analista:** Msg Brayan Andru Montenegro Embus

---

## 🧠 IDEAS FUERZA
- Puntos que expliquen el impacto más relevante para la industria farmacéutica.
- Sin repetir texto ni datos operativos.
- Usa lenguaje ejecutivo: “incrementa presión de caja”, “mejora predictibilidad”, “desplaza riesgo”, “aprieta margen”.

---

## 💰 1. FLUJO DE RECURSOS (Impacto consolidado)
**Qué cambió y cómo afecta al sector:**
- [1 párrafo. Evitar listados. Describir efecto sobre liquidez, pagos, presupuestos, riesgo de cartera]

**Factores operativos relevantes (máx. 3 bullets):**
- ADRES (UPC, giro directo, capacidades)
- Presupuestos máximos
- Cambios fiscales o regulatorios concretos

**Implicación estratégica para laboratorios:**
- Margen, tiempos de rotación, riesgo de exposición con EPS/IPS, renegociaciones.

---

## 💊 2. ACCESO A TERAPIAS (Impacto consolidado)
**Movimiento real del mercado:**
- Aprobaciones INVIMA, PBS/UPC, IETS, compras centralizadas, MIPRES.

**Efecto empresarial:**
- Ventana de adopción hospitalaria
- Riesgo de sustitución
- Elasticidad de demanda según cobertura

> No describas trámites o procesos burocráticos, solo su impacto.

---

## 💲 3. REGULACIÓN DE PRECIOS (Impacto consolidado)
**Cambios observados:**
- CNPMDM, SISMED, circulares, sanciones.

**Consecuencia real:**
- Compresión de precios, control, volatilidad o ventanas de negociación.

---

## 🚦 EVALUACIÓN DE RIESGO SEMANAL

**Nivel de impacto general:** [Selecciona SOLO UNO: 🔴 Crítico  O  🟡 Moderado  O  🟢 Positivo]

**Justificación:**
[Párrafo de 3-4 líneas explicando por qué se asigna esta calificación basándose en el análisis consolidado de la semana. Debe incluir consideraciones sobre:
- Exposición financiera y operativa para laboratorios
- Urgencia de las acciones requeridas
- Potencial impacto en resultados del negocio]

**Criterios de evaluación:**
- 🔴 Crítico: Riesgo financiero o regulatorio inmediato que requiere acción urgente
- 🟡 Moderado: Cambio estructural emergente o presión sectorial que requiere ajustes
- 🟢 Positivo: Mejora de monetización, predictibilidad o adopción terapéutica

---

## 📌 RECOMENDACIONES ACCIONABLES (no más de 5)
Prioriza decisiones tácticas claras:
- Ajustes de pricing
- Timing de lanzamiento
- Orden de interlocución institucional
- Estrategias de cartera según perfiles de EPS
- Optimización de MIPRES / PBS

> Evita recomendaciones genéricas como “monitorear”.

---

## 📈 CONCLUSIÓN ESTRATÉGICA (máx. 6–8 líneas)
- Qué cambia en el entorno competitivo
- Qué laboratorio gana o pierde posicionamiento
- Qué señales de política pública anticipan cambios en 90–180 días
- Cómo se debería ajustar la estrategia de acceso y negocio

---

## 🤝 STAKEHOLDERS CLAVE (máx. 4 áreas)
Explica el porqué:
- **Market Access:** decisiones por PBS/UPC, IETS o compras
- **Finanzas:** métricas de liquidez, rotación, riesgo EPS
- **Regulatorio:** cumplimiento, sanciones, reporting
- **Comercial:** forecasting, sustitución terapéutica, pricing

---

📌 NOTAS CRÍTICAS:
- **NO repitas datos entre secciones.**
- **NO inventes cifras ni decisiones regulatorias.**
- **NO llenes vacíos con suposiciones.**
- Si una temática no aparece → pon “No aplica”.

---

Resumen generado el ${new Date().toLocaleString('es-CO')}
`;
  
  try {
    const resumenConsolidado = llamarGroqAPI(promptConsolidacion, 'llama-3.3-70b-versatile', 0.3, 4096);
    
    // Guardar resumen en propiedades
    PropertiesService.getScriptProperties().setProperty('ultimo-resumen', resumenConsolidado);
    PropertiesService.getScriptProperties().setProperty('fecha-ultimo-resumen', new Date().toISOString());
    
    // NO crear hoja, solo generar y descargar archivos automáticamente
    descargarArchivosAutomaticamente(resumenConsolidado);
    
  } catch (error) {
    ui.alert('❌ Error al generar resumen: ' + error.message);
  }
}

/**
 * Muestra el resumen en una nueva hoja
 */
function mostrarResumenEnHoja(resumen) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = ss.getSheetByName('Resumen Ejecutivo');
  
  // Si la hoja existe, limpiarla, si no, crearla
  if (hoja) {
    hoja.clear();
  } else {
    hoja = ss.insertSheet('Resumen Ejecutivo');
  }
  
  // Configurar formato
  hoja.getRange('A1').setValue(resumen);
  hoja.getRange('A1').setWrap(true);
  hoja.setColumnWidth(1, 800);
  hoja.getRange('A1').setFontSize(11);
  hoja.getRange('A1').setFontFamily('Arial');
  
  // Activar la hoja
  ss.setActiveSheet(hoja);
}

/**
 * Exporta el resumen en PDF y HTML automáticamente
 */
function exportarResumen() {
  const ui = SpreadsheetApp.getUi();
  
  const resumen = PropertiesService.getScriptProperties().getProperty('ultimo-resumen');
  
  if (!resumen) {
    ui.alert('⚠️ No hay resumen para exportar.\n\nPrimero genera un resumen consolidado.');
    return;
  }
  
  descargarArchivosAutomaticamente(resumen);
}

/**
 * Genera y descarga archivos PDF y HTML automáticamente
 */
function descargarArchivosAutomaticamente(resumen) {
  const fechaResumen = PropertiesService.getScriptProperties().getProperty('fecha-ultimo-resumen');
  const fecha = new Date(fechaResumen);
  const nombreArchivo = `Resumen_Ejecutivo_Salud_${fecha.getFullYear()}-${(fecha.getMonth()+1).toString().padStart(2,'0')}-${fecha.getDate().toString().padStart(2,'0')}`;
  
  // Generar HTML
  const htmlContent = convertirMarkdownAHTML(resumen);
  const htmlCompleto = crearHTMLCompleto(htmlContent, nombreArchivo);
  
  // Guardar HTML en Google Drive
  const carpeta = obtenerOCrearCarpetaReportes();
  const archivoHTML = carpeta.createFile(nombreArchivo + '.html', htmlCompleto, MimeType.HTML);
  
  // Generar PDF desde el HTML
  const pdfBlob = crearPDFDesdeHTML(htmlCompleto, nombreArchivo);
  const archivoPDF = carpeta.createFile(pdfBlob);
  
  // Convertir PDF blob a base64 para descarga directa
  const pdfBase64 = Utilities.base64Encode(pdfBlob.getBytes());
  
  // Mostrar diálogo con descargas automáticas
  mostrarDialogoDescarga(nombreArchivo, pdfBase64, htmlCompleto);
}

/**
 * Crea un PDF desde HTML
 */
function crearPDFDesdeHTML(htmlCompleto, nombreArchivo) {
  const blob = Utilities.newBlob(htmlCompleto, MimeType.HTML, nombreArchivo + '.html');
  return blob.getAs(MimeType.PDF).setName(nombreArchivo + '.pdf');
}

/**
 * Muestra diálogo que descarga automáticamente los archivos
 */
function mostrarDialogoDescarga(nombreArchivo, pdfBase64, contenidoHTML) {
  const html = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
    <head>
      <base target="_top">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          padding: 30px; 
          text-align: center;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          max-width: 500px;
          margin: 0 auto;
        }
        h2 { 
          color: #1976d2; 
          margin-bottom: 20px;
        }
        .status { 
          font-size: 18px; 
          margin: 20px 0;
          color: #388e3c;
          font-weight: bold;
        }
        .info {
          background: #e8f5e9;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
          font-size: 14px;
        }
        .file-list {
          text-align: left;
          margin: 20px 0;
        }
        .file-item {
          padding: 10px;
          background: #f5f5f5;
          margin: 8px 0;
          border-radius: 4px;
          font-size: 14px;
        }
        button {
          padding: 12px 24px;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 20px;
        }
        button:hover {
          background: #1565c0;
        }
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #1976d2;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>📊 Resumen Ejecutivo Generado</h2>
        <div class="spinner" id="spinner"></div>
        <div class="status" id="status">Descargando archivos...</div>
        <div class="info" id="info" style="display:none;">
          <strong>✅ Archivos generados:</strong>
          <div class="file-list">
            <div class="file-item">📄 ${nombreArchivo}.pdf</div>
            <div class="file-item">🌐 ${nombreArchivo}.html</div>
          </div>
          <p>Los archivos se han descargado automáticamente y están guardados en Google Drive (carpeta "Reportes Salud").</p>
        </div>
        <button onclick="google.script.host.close()" style="display:none;" id="closeBtn">Cerrar</button>
      </div>
      
      <script>
        const nombreArchivo = "${nombreArchivo}";
        const pdfBase64 = "${pdfBase64}";
        const contenidoHTML = \`${contenidoHTML.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
        
        // Función para descargar PDF desde base64
        function descargarPDF() {
          try {
            const byteCharacters = atob(pdfBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = nombreArchivo + '.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          } catch (e) {
            console.error('Error descargando PDF:', e);
          }
        }
        
        // Función para descargar HTML
        function descargarHTML() {
          try {
            const blob = new Blob([contenidoHTML], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = nombreArchivo + '.html';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          } catch (e) {
            console.error('Error descargando HTML:', e);
          }
        }
        
        // Iniciar descargas automáticamente
        window.onload = function() {
          setTimeout(function() {
            descargarPDF();
          }, 500);
          
          setTimeout(function() {
            descargarHTML();
          }, 1500);
          
          setTimeout(function() {
            document.getElementById('spinner').style.display = 'none';
            document.getElementById('status').textContent = '✅ Descargas completadas';
            document.getElementById('info').style.display = 'block';
            document.getElementById('closeBtn').style.display = 'inline-block';
          }, 3000);
        };
      </script>
    </body>
    </html>
  `).setWidth(600).setHeight(450);
  
  SpreadsheetApp.getUi().showModalDialog(html, '📥 Descarga Automática');
}

/**
 * Obtiene o crea la carpeta de reportes en Drive
 */
function obtenerOCrearCarpetaReportes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const archivo = DriveApp.getFileById(ss.getId());
  const carpetaPadre = archivo.getParents().next();
  
  // Buscar carpeta "Reportes Salud"
  const carpetas = carpetaPadre.getFoldersByName('Reportes Salud');
  
  if (carpetas.hasNext()) {
    return carpetas.next();
  } else {
    return carpetaPadre.createFolder('Reportes Salud');
  }
}

/**
 * Crea el HTML completo con estilos
 */
function crearHTMLCompleto(contenido, nombreArchivo) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${nombreArchivo}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 40px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 { 
      color: #1976d2; 
      border-bottom: 3px solid #1976d2; 
      padding-bottom: 10px;
      font-size: 28px;
    }
    h2 { 
      color: #424242; 
      margin-top: 30px; 
      border-left: 4px solid #1976d2; 
      padding-left: 10px;
      font-size: 22px;
    }
    h3 { 
      color: #616161;
      font-size: 18px;
      margin-top: 20px;
    }
    p {
      color: #333;
      margin: 10px 0;
    }
    ul, ol { 
      margin-left: 20px;
      margin-top: 10px;
      margin-bottom: 10px;
    }
    li {
      margin: 8px 0;
      color: #333;
    }
    .highlight { 
      background: #fff3e0; 
      padding: 15px; 
      border-left: 4px solid #ff9800; 
      margin: 20px 0; 
    }
    .critico { 
      color: #d32f2f; 
      font-weight: bold; 
    }
    .moderado { 
      color: #f57c00; 
      font-weight: bold; 
    }
    .positivo { 
      color: #388e3c; 
      font-weight: bold; 
    }
    hr { 
      border: none; 
      border-top: 2px solid #e0e0e0; 
      margin: 30px 0; 
    }
    strong {
      color: #1976d2;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #757575;
      text-align: center;
    }
    @media print {
      body { 
        background: white; 
        margin: 0;
        padding: 0;
      }
      .container { 
        box-shadow: none;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    ${contenido}
    <div class="footer">
      Generado automáticamente por Sistema de Análisis del Sector Salud Colombia<br>
      ${new Date().toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short' })}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Muestra el diálogo de exportación
 */
/**
 * Convierte Markdown a HTML básico
 */
function convertirMarkdownAHTML(markdown) {
  let html = markdown;
  
  // Títulos
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  
  // Negrita
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Listas
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');
  
  // Emojis de semáforo con clases CSS
  html = html.replace(/🔴/g, '<span class="critico">🔴</span>');
  html = html.replace(/🟡/g, '<span class="moderado">🟡</span>');
  html = html.replace(/🟢/g, '<span class="positivo">🟢</span>');
  
  // Líneas horizontales
  html = html.replace(/^---$/gm, '<hr>');
  
  // Saltos de línea
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  
  // Envolver listas
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  // Elimina líneas que son solo $n (por si aparecen como "títulos")
  html = html.replace(/^\s*\$[0-9]+\s*$/gm, '');
  // Por seguridad, elimina también cualquier $n incrustado
  html = html.replace(/\$[0-9]+/g, '');
  return html;
}
