import React, { useState } from 'react';
import { useSAP } from '../../context/SAPContext';
import { Sparkles, X, Send, ArrowRight } from 'lucide-react';

interface JouleMessage {
  id: string;
  sender: 'user' | 'joule';
  text: string;
  timestamp: string;
}

const FAQ_KNOWLEDGE_BASE = [
  {
    question: '¿Cómo se conectan MIGO 101, 311, 344, 601 y 651?',
    answer:
      'Son las 5 clases de movimiento fundamentales de SAP S/4HANA en logística:\n\n' +
      '• 101: Entrada de mercancías contra Pedido de Compra (ME21N).\n' +
      '• 311: Traspaso en 1 paso entre almacenes del mismo centro (ej: 0001 -> 0002 Calidad).\n' +
      '• 344: Traspaso de Stock Libre Utilización a Stock Bloqueado (usado ante siniestros como la inundación de TecnoSur).\n' +
      '• 601: Salida de mercancías a cliente (PGI desde VL02N).\n' +
      '• 651: Devolución de cliente a Stock Bloqueado de Devoluciones (Logística Inversa: nunca ingresa directo a libre utilización).'
  },
  {
    question: '¿Qué es MD04 (MRP) y cómo se vincula con la BOM (CS03)?',
    answer:
      'MD04 es la Lista de Necesidades/Stocks dinámica en SAP PP/MM. Traduce directamente la tabla MRP de Planificación y Control:\n' +
      'Requerimientos brutos -> Recepciones programadas -> Disponibilidad proyectada -> Necesidades netas -> Liberación de órdenes desplazada según Lead Time (TS).\n\n' +
      'Cuando se libera una orden del producto padre (ej: MAT-A100), SAP explota la Lista de Materiales (CS03 / BOM) y genera automáticamente los requerimientos brutos de sus componentes hijos (MAT-C300, MAT-3015).'
  },
  {
    question: '¿Cómo defender el OTIF y el Dimensionamiento de Muelles en una entrevista?',
    answer:
      'Dos reglas clave de Procesos Logísticos IV:\n' +
      '1. OTIF (On-Time In-Full) mide entregas completas Y a tiempo en el cliente, no solo que el camión haya salido puntual del muelle.\n' +
      '2. Muelles: N = [(Qd·Td) + (Qc·Tc)] / (H·60·U). El promedio diario no muestra las colas en hora pico; antes de invertir en construir un muelle nuevo, conviene implementar turnos de llegada, preparación anticipada y prevalidación documental.'
  },
  {
    question: '¿Por qué una devolución (651) no vuelve directo a stock libre?',
    answer:
      'En logística inversa (caso Metalúrgica del Sur), primero se recibe e identifica (Mov. 651 en Almacén 0004 Bloqueado), luego se inspecciona físicamente y recién después se clasifica: lo recuperable pasa a reacondicionamiento/reingreso controlado, y lo irreversible a disposición final. Además se mide la Tasa de Recuperación (Unidades recuperadas / devueltas × 100).'
  }
];

export const JouleAssistantDrawer: React.FC = () => {
  const { isJouleOpen, setIsJouleOpen } = useSAP();
  const [messages, setMessages] = useState<JouleMessage[]>([
    {
      id: 'init-1',
      sender: 'joule',
      text:
        'Hola. Soy Joule, tu copiloto en SAP S/4HANA Logistics. Puedo ayudarte a mapear tus materias de la Licenciatura en Logística (MRP, ABC, Expedición, Muelles, Logística Inversa y CMI/OTIF) a las transacciones reales de SAP y prepararte para entrevistas.',
      timestamp: 'Ahora'
    }
  ]);
  const [inputText, setInputText] = useState('');

  if (!isJouleOpen) return null;

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: JouleMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: 'Ahora'
    };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    const matchedFaq = FAQ_KNOWLEDGE_BASE.find(f => f.question === query);

    setTimeout(() => {
      let reply = matchedFaq?.answer || '';
      if (!reply) {
        const lower = query.toLowerCase();
        if (lower.includes('mrp') || lower.includes('md04') || lower.includes('bom') || lower.includes('lote')) {
          reply =
            'En SAP, el MRP se monitorea en MD04 y la estructura del producto en CS03. Puedes elegir políticas de tamaño de lote: Lote a Lote (EX / L4L, minimiza inventario medio), Lote Fijo (FX, reduce costo de lanzamiento) o EOQ. Si el inventario físico es menor al del sistema, el MRP adelanta la liberación de órdenes en el padre y sus hijos.';
        } else if (lower.includes('344') || lower.includes('bloque') || lower.includes('tecnosur') || lower.includes('inund')) {
          reply =
            'El movimiento MIGO 344 realiza un traspaso de Stock Libre Utilización a Stock Bloqueado dentro del mismo almacén. Es el estándar ante siniestros (como el caso TecnoSur) para impedir que Ventas o Picking comprometan mercadería dañada mientras se inspecciona.';
        } else if (lower.includes('651') || lower.includes('devol') || lower.includes('inversa')) {
          reply =
            'En Logística Inversa, una devolución de cliente entra con MIGO Mov. 651 a Stock Bloqueado de Devoluciones (Almacén 0004). Nunca debe reingresar directo a Libre Utilización. Luego de inspección se decide: reingreso controlado, reparación, retorno a proveedor o disposición final.';
        } else if (lower.includes('abc') || lower.includes('pareto') || lower.includes('mc40')) {
          reply =
            'La transacción MC40 ejecuta el Análisis ABC (Pareto 80/20). Recuerda que el criterio importa: clasificar por Valor de Utilización (consumo × precio) prioriza rotación y capital, mientras que clasificar por Valorizado Total de Inventario detecta sobrestock inmovilizado.';
        } else if (lower.includes('muelle') || lower.includes('otif') || lower.includes('cmi') || lower.includes('601') || lower.includes('pgi')) {
          reply =
            'En Expedición (VL02N), el flujo exige 6 controles: Picking -> Verificación -> Consolidación -> Acondicionamiento -> Carga (capacidad, estabilidad, compatibilidad, secuencia) -> Liberación PGI (Mov. 601). Para muelles aplica N = (Qd·Td + Qc·Tc) / (H·60·U), validando siempre los picos horarios.';
        } else {
          reply =
            `Sobre "${query}": En SAP S/4HANA Logistics cada decisión impacta en tiempo real sobre inventario (MMBE), planificación (MD04) y tablero gerencial (CMI/OTIF). Prueba ejecutar el caso TecnoSur o Metalúrgica del Sur para ver la trazabilidad completa por número de documento.`;
        }
      }

      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'joule', text: reply, timestamp: 'Ahora' }
      ]);
    }, 300);
  };

  return (
    <aside
      className="fixed inset-y-0 right-0 w-full sm:w-[440px] bg-white border-l border-[#d9e1e8] shadow-2xl z-50 flex flex-col"
      aria-label="Asistente Joule para SAP Logistics"
    >
      {/* Header */}
      <div className="bg-[#1b2a4a] text-white p-4 flex items-center justify-between border-b border-[#2a3f68]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0a6ed1] flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm tracking-tight">Joule AI Assistant</h3>
              <span className="px-1.5 py-0.5 bg-white/15 text-blue-100 rounded text-[10px] font-mono">
                UTN-SAP Coach
              </span>
            </div>
            <p className="text-[11px] text-slate-300">Traductor de conceptos de carrera a SAP S/4HANA</p>
          </div>
        </div>
        <button
          onClick={() => setIsJouleOpen(false)}
          className="text-slate-300 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          aria-label="Cerrar Joule"
        >
          <X className="w-5 h-5" strokeWidth={1.8} />
        </button>
      </div>

      {/* Quick Prompts */}
      <div className="p-3 bg-[#f5f6f7] border-b border-[#d9e1e8]">
        <span className="text-[10px] font-bold text-[#5b738b] uppercase tracking-wider block mb-2">
          Consultas Frecuentes de Entrevista:
        </span>
        <div className="flex flex-col gap-1.5">
          {FAQ_KNOWLEDGE_BASE.map((faq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(faq.question)}
              className="text-left text-xs p-2 rounded-lg bg-white border border-[#d9e1e8] hover:border-[#0a6ed1] hover:bg-[#f0f4f9] text-[#1d2d3e] transition-colors flex items-center justify-between group"
            >
              <span className="truncate pr-2">{faq.question}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#5b738b] group-hover:text-[#0a6ed1] shrink-0" strokeWidth={2} />
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f5f6f7]/60">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[90%] p-3.5 rounded-xl text-xs leading-relaxed shadow-xs whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-[#0a6ed1] text-white rounded-tr-none'
                  : 'bg-white text-[#1d2d3e] border border-[#d9e1e8] rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-[#5b738b] mt-1 px-1 font-mono">{msg.timestamp}</span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-[#d9e1e8]">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Pregunta sobre MRP, ABC, 344, 651, OTIF o Muelles..."
            className="flex-1 text-xs px-3 py-2.5 rounded-lg border border-[#d9e1e8] focus:outline-none focus:border-[#0a6ed1] focus:ring-1 focus:ring-[#0a6ed1]"
          />
          <button
            type="submit"
            className="p-2.5 rounded-lg bg-[#0a6ed1] hover:bg-[#0854a0] text-white transition-colors disabled:opacity-50"
            disabled={!inputText.trim()}
            aria-label="Enviar"
          >
            <Send className="w-4 h-4" strokeWidth={2} />
          </button>
        </form>
      </div>
    </aside>
  );
};
