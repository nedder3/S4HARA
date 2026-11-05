import React from 'react';
import { useSAP } from '../../context/SAPContext';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Award,
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { CaseStudy } from '../../types/sap';

export const GuidedTrainingCases: React.FC = () => {
  const {
    caseStudies,
    activeCaseStudyId,
    setActiveCaseStudyId,
    setActiveApp,
    executeTCode
  } = useSAP();

  const handleStartCase = (c: CaseStudy) => {
    setActiveCaseStudyId(c.id);
    const firstIncompleteStep = c.steps.find(s => !s.isCompleted) || c.steps[0];
    if (firstIncompleteStep) {
      executeTCode(firstIncompleteStep.appTarget);
    }
  };

  const completedCount = caseStudies.filter(c => c.isCompleted).length;

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-6 space-y-6 animate-in fade-in-50 duration-200">
      {/* Title & Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 text-amber-100 text-xs font-mono mb-3 border border-white/10">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Módulo de Preparación para Inserción Laboral</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Casos de Negocio Guiados para Licenciatura en Logística
          </h1>
          <p className="mt-2 text-sm sm:text-base text-amber-100 leading-relaxed">
            Resuelve misiones operativas reales de almacén y transporte utilizando las transacciones oficiales de SAP S/4HANA. Cada caso incluye preguntas reales que realizan los líderes de logística en entrevistas laborales.
          </p>

          <div className="mt-4 flex items-center gap-3 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-white/20">
              Progreso General: {completedCount} de {caseStudies.length} Casos Resueltos
            </span>
          </div>
        </div>
      </div>

      {/* Case Studies List */}
      <div className="space-y-5">
        {caseStudies.map((caseStudy, index) => {
          const isCurrentActive = caseStudy.id === activeCaseStudyId;
          const completedSteps = caseStudy.steps.filter(s => s.isCompleted).length;
          const percent = Math.round((completedSteps / caseStudy.steps.length) * 100);

          return (
            <div
              key={caseStudy.id}
              className={`bg-white rounded-xl border shadow-xs overflow-hidden transition-all ${
                isCurrentActive
                  ? 'border-amber-500 ring-2 ring-amber-400'
                  : caseStudy.isCompleted
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      {caseStudy.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Rol: {caseStudy.role}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-mono">
                      Dificultad: {caseStudy.difficulty} ({caseStudy.estimatedMinutes} min)
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{caseStudy.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-700 block">
                      {completedSteps} / {caseStudy.steps.length} Pasos ({percent}%)
                    </span>
                    <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full ${
                          caseStudy.isCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartCase(caseStudy)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 ${
                      isCurrentActive
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : caseStudy.isCompleted
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-[#0a6ed1] hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isCurrentActive ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>En Curso</span>
                      </>
                    ) : caseStudy.isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Revisar Caso</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Iniciar Misión</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Context Description */}
              <div className="p-5 space-y-4">
                <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <strong className="text-slate-900 block mb-1">Contexto Operativo del Centro:</strong>
                  {caseStudy.context}
                </div>

                {/* Steps Checklist */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    Ruta de Ejecución en SAP:
                  </h4>
                  <div className="space-y-2">
                    {caseStudy.steps.map(step => (
                      <div
                        key={step.id}
                        className={`p-3 rounded-lg border flex items-start justify-between gap-3 text-xs transition-colors ${
                          step.isCompleted
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {step.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-400 shrink-0 mt-0.5 flex items-center justify-center font-mono text-[9px] text-slate-500">
                              {step.id}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold">{step.instruction}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{step.explanation}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setActiveCaseStudyId(caseStudy.id);
                            executeTCode(step.appTarget);
                          }}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-mono text-[11px] font-bold text-slate-700 shrink-0 flex items-center gap-1"
                        >
                          <span>{step.appTarget}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interview Tip Callout */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-950 flex items-start gap-3">
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <strong className="block font-bold text-amber-900">
                      Pregunta Típica de Entrevista de Trabajo:
                    </strong>
                    <p className="mt-0.5 text-amber-900/90 leading-relaxed font-sans">
                      {caseStudy.interviewTip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
