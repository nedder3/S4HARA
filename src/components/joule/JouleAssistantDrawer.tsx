import React, { useState } from 'react';
import { useSAP } from '../../context/SAPContext';
import {
  Sparkles,
  X,
  Send,
  HelpCircle,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Package,
  Truck
} from 'lucide-react';

interface JouleMessage {
  id: string;
  sender: 'user' | 'joule';
  text: string;
  timestamp: string;
  category?: 'TEORIA' | 'ENTREVISTA' | 'OPERACION';
}

const FAQ_KNOWLEDGE_BASE = [
  {
    question: '¿Qué es MIGO y qué movimientos son los más importantes?',
    category: 'OPERACION' as const,
    answer:
      'MIGO ("Movement of Goods") es la transacción unificada de SAP para gestionar inventario. Los movimientos clave que te preguntarán en una entrevista son:\n\n' +
      '• 101: Entrada de mercancías contra un Pedido de Compra (PO).\n' +
      '• 102: Anulación de una entrada 101.\n' +
      '• 311: Traspaso de almacén a almacén en 1 paso dentro del mismo centro (ej: de Almacén General a Cuarentena).\n' +
      '• 501: Entrada de mercancía sin pedido (carga inicial o muestras gratuitas).\n' +
      '• 601: Salida de mercancías para entrega al cliente (PGI) desde una entrega saliente (VL01N).'
  },
  {
    question: '¿Cómo explicar la diferencia entre SolPed (ME51N) y Pedido de Compra (ME21N)?',
    category: 'ENTREVISTA' as const,
    answer:
      'En una entrevista de logística di esto:\n\n' +
      '"La Solicitud de Pedido (SolPed / ME51N) es un documento interno del área solicitante (producción, mantenimiento o depósito) comunicando que necesita insumos. No tiene validez legal con terceros. El Pedido de Compra (Purchase Order / ME21N) es el contrato comercial vinculante que compras envía al proveedor con cantidades, precios pactados, condiciones Incoterm y fecha de entrega."'
  },
  {
    question: '¿Qué es PGI (Post Goods Issue) y por qué bloquea si el picking no coincide?',
    category: 'OPERACION' as const,
    answer:
      'PGI (Contabilización de Salida de Mercancías) es el hito final en logística de expedición. Al ejecutar PGI en la entrega saliente (VL02N):\n' +
      '1. Se descuenta el stock físico del almacén (Mov. 601).\n' +
      '2. Se transfiere el riesgo/propiedad de la carga al transporte o cliente.\n' +
      '3. Se habilita a Finanzas a emitir la Factura de Venta (VF01).\n\n' +
      'SAP bloquea el PGI si la cantidad pickeada es menor que la cantidad de la entrega para evitar discrepancias legales en el remito.'
  },
  {
    question: '¿Cómo se estructura el inventario en SAP S/4HANA?',
    category: 'TEORIA' as const,
    answer:
      'La jerarquía es:\n' +
      '• Mandante (Client): Nivel más alto (ej: 100).\n' +
      '• Sociedad (Company Code): Entidad financiera legal (ej: 1000).\n' +
      '• Centro / Planta (Plant): Unidad operativa física con inventario propio (ej: 1010 Planta Buenos Aires).\n' +
      '• Almacén (Storage Location): Subdivisión dentro del centro (ej: 0001 Principal, 0002 Cuarentena).\n' +
      '• Lote (Batch): Subdivisión para trazabilidad por vencimiento o partida de fabricación.\n' +
      '• Ubicación (Bin): En EWM, el código exacto de pasillo y estantería (ej: A-01-01).'
  }
];

export const JouleAssistantDrawer: React.FC = () => {
  const { isJouleOpen, setIsJouleOpen } = useSAP();
  const [messages, setMessages] = useState<JouleMessage[]>([
    {
      id: 'init-1',
      sender: 'joule',
      text:
        '¡Hola! Soy Joule, tu copiloto corporativo en SAP S/4HANA Logistics. Estoy aquí para ayudarte a comprender cada transacción, explicarte el impacto de cada movimiento de stock y entrenarte para preguntas típicas de entrevistas de logística. ¿Qué duda tienes hoy?',
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

    // AI simulation logic
    setTimeout(() => {
      let reply = '';
      const lower = query.toLowerCase();

      if (lower.includes('101') || lower.includes('migo')) {
        reply =
          'En MIGO, el movimiento 101 registra la entrada de mercaderías contra un pedido de compra abierto (PO). ' +
          'Al contabilizarlo, SAP incrementa el stock de libre utilización en el almacén de destino, actualiza el historial del pedido (ME23N) ' +
          'y genera un Documento de Material (número 500000xxxx). Si el lote viene sin inspección, entra directo a 0001; si requiere ensayo de calidad, se recepciona en control de calidad (stock EM).';
      } else if (lower.includes('311') || lower.includes('traspaso') || lower.includes('transferencia')) {
        reply =
          'El movimiento 311 es un traslado en un solo paso entre dos almacenes de la misma planta. ' +
          'Es fundamental en logística interna cuando necesitas mover mercadería de un almacén general (0001) a un área de cuarentena (0002), ' +
          'o cuando abasteces el área de picking para despacho (0003).';
      } else if (lower.includes('601') || lower.includes('pgi') || lower.includes('salida') || lower.includes('despacho')) {
        reply =
          'El movimiento 601 es la salida de mercancías para una entrega saliente a cliente. ' +
          'Es el paso posterior al Picking (VL02N). Al contabilizar el PGI, el inventario se reduce físicamente y en los libros contables, ' +
          'dejando la entrega lista para emisión de factura (VF01).';
      } else if (lower.includes('entrevista') || lower.includes('pregunt') || lower.includes('tip')) {
        reply =
          'Un reclutador de logística en SAP casi siempre te preguntará:\n' +
          '1. "¿Qué haces si hay una discrepancia entre lo que dice el remito físico y el pedido en SAP?"\n' +
          '-> Respuesta experta: Se recibe en SAP únicamente la cantidad física real contada (recepción parcial) o se ingresa la diferencia en stock de control de calidad / bloqueado para reclamo formal al proveedor.\n\n' +
          '2. "¿Cómo consultas rápidamente la disponibilidad total de un SKU?"\n' +
          '-> Respuesta experta: Mediante la transacción MMBE (Resumen de stocks) filtrando por Centro y Almacén.';
      } else {
        reply =
          `Respecto a "${query}": En SAP S/4HANA Logistics, cada proceso está interconectado mediante documentos maestros y números de transacción. ` +
          `Recuerda siempre verificar la estructura organizativa (Centro 1010 y Almacén) y el tipo de stock (Libre utilización, Control de calidad o Bloqueado). ` +
          `Puedes consultar la app MMBE para ver reflejado cualquier movimiento en tiempo real.`;
      }

      const jouleMsg: JouleMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'joule',
        text: reply,
        timestamp: 'Ahora'
      };
      setMessages(prev => [...prev, jouleMsg]);
    }, 400);
  };

  return (
    <aside
      className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200"
      aria-label="Asistente Joule para SAP Logistics"
    >
      {/* Header */}
      <div className="bg-[#1b2a4a] text-white p-4 flex items-center justify-between border-b border-[#2a3f68]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-4 h-4 text-amber-300" strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm tracking-tight">Joule AI Assistant</h3>
              <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-200 border border-blue-400/30 rounded text-[10px] font-mono">
                Logistics Coach
              </span>
            </div>
            <p className="text-[11px] text-slate-300">Tutor de conceptos SAP & Preguntas de Entrevistas</p>
          </div>
        </div>
        <button
          onClick={() => setIsJouleOpen(false)}
          className="text-slate-300 hover:text-white p-1 rounded-md hover:bg-slate-700/50 transition-colors"
          aria-label="Cerrar Joule"
        >
          <X className="w-5 h-5" strokeWidth={1.8} />
        </button>
      </div>

      {/* Quick Prompts / FAQ Carousel */}
      <div className="p-3 bg-slate-50 border-b border-slate-200">
        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-2">
          Preguntas Clave para el Mercado Laboral:
        </span>
        <div className="flex flex-col gap-1.5">
          {FAQ_KNOWLEDGE_BASE.slice(0, 3).map((faq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(faq.question)}
              className="text-left text-xs p-2 rounded-md bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 transition-colors flex items-center justify-between group"
            >
              <span className="truncate pr-2">{faq.question}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" strokeWidth={2} />
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] p-3.5 rounded-xl text-xs leading-relaxed shadow-xs whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-[#0a6ed1] text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">{msg.timestamp}</span>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-slate-200">
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
            placeholder="Pregúntale a Joule sobre cualquier T-Code o flujo SAP..."
            className="flex-1 text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="p-2.5 rounded-lg bg-[#0a6ed1] hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
            disabled={!inputText.trim()}
            aria-label="Enviar pregunta"
          >
            <Send className="w-4 h-4" strokeWidth={2} />
          </button>
        </form>
      </div>
    </aside>
  );
};
