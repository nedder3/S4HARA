import React from 'react';
import { useSAP } from '../../context/SAPContext';
import { CaseStudy } from '../../types/sap';
import { CheckCircle2, Clock, ArrowRight, Award, HelpCircle, Play } from 'lucide-react';

export const GuidedTrainingCases: React.FC = () => {
  const { caseStudies, activeCaseStudyId, setActiveCaseStudyId, executeTCode } = useSAP();

  const handleStartCase = (c: CaseStudy) => {
    setActiveCaseStudyId(c.id);
    const firstIncomplete = c.steps.find(s => !s.isCompleted) || c.steps[0];
    if (firstIncomplete) {
      executeTCode(firstIncomplete.appTarget);
    }
  };

  const completedCount = caseStudies.filter(c => c.isCompleted).length;

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#d9e1e8] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#f0f4f9] text-[#0a6ed1] text-xs font-mono font-semibold border border-[#c2dcf7]">
            <Award className="w-3.5 h-3.5" />
            <span>Misiones UTN FRBB → SAP S/4HANA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d2d3e]">
            Casos Integradores de Logística sobre SAP S/4HANA
          </h1>
          <p className="text-sm text-[#5b738b] leading-relaxed">
            Resuelve escenarios inspirados en tus materias de la Licenciatura en Logística (*TecnoSur Equipamientos, Metalúrgica del Sur, MRP y ABC*) ejecutando transacciones reales de SAP y preparándote para preguntas de entrevista técnica.
          </p>
        </div>

        <div className="bg-[#f5f6f7] px-4 py-3 rounded-xl border border-[#d9e1e8] text-right shrink-0">
          <span className="text-[11px] font-semibold text-[#5b738b] uppercase block">Progreso General</span>
          <span className="text-2xl font-extrabold font-mono text-[#0a6ed1] tabular-nums">
            {completedCount} / {caseStudies.length}
          </span>
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-5">
        {caseStudies.map(caseStudy => {
          const isCurrentActive = caseStudy.id === activeCaseStudyId;
          const completedSteps = caseStudy.steps.filter(s => s.isCompleted).length;
          const percent = Math.round((completedSteps / caseStudy.steps.length) * 100);

          return (
            <div
              key={caseStudy.id}
              className={`bg-white rounded-xl border shadow-xs overflow-hidden transition-all ${
                isCurrentActive
                  ? 'border-[#0a6ed1] ring-2 ring-[#0a6ed1]/30'
                  : caseStudy.isCompleted
                  ? 'border-[#bce3c9]'
                  : 'border-[#d9e1e8]'
              }`}
            >
              <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#edf2f7] bg-[#f5f6f7]/50">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#0a6ed1] text-white">
                      {caseStudy.code}
                    </span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-white border border-[#d9e1e8] text-[#1d2d3e] font-semibold">
                      {caseStudy.subjectTag}
                    </span>
                    <span className="text-xs text-[#5b738b]">Rol: {caseStudy.role}</span>
                    <span className="text-[#cbd5e1]">·</span>
                    <span className="text-xs text-[#5b738b] font-mono">
                      {caseStudy.difficulty} ({caseStudy.estimatedMinutes} min)
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1d2d3e]">{caseStudy.title}</h3>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[#1d2d3e] tabular-nums block">
                      {completedSteps}/{caseStudy.steps.length} Pasos ({percent}%)
                    </span>
                    <div className="w-32 h-2 bg-[#e2e8f0] rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full ${caseStudy.isCompleted ? 'bg-[#107e3e]' : 'bg-[#0a6ed1]'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartCase(caseStudy)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                      caseStudy.isCompleted
                        ? 'bg-[#107e3e] hover:bg-[#0c6330] text-white'
                        : 'bg-[#0a6ed1] hover:bg-[#0854a0] text-white'
                    }`}
                  >
                    {isCurrentActive ? (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>Continuar</span>
                      </>
                    ) : caseStudy.isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completado</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Iniciar Caso</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="text-xs text-[#1d2d3e] leading-relaxed bg-[#f5f6f7] p-4 rounded-lg border border-[#d9e1e8]">
                  <strong className="block mb-1 text-[#0a6ed1]">Consigna & Contexto Operativo:</strong>
                  {caseStudy.context}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#5b738b] uppercase tracking-wider mb-2.5">
                    Secuencia de Ejecución en SAP S/4HANA:
                  </h4>
                  <div className="space-y-2">
                    {caseStudy.steps.map(step => (
                      <div
                        key={step.id}
                        className={`p-3 rounded-lg border flex items-start justify-between gap-3 text-xs ${
                          step.isCompleted
                            ? 'bg-[#eaf7ee] border-[#bce3c9] text-[#107e3e]'
                            : 'bg-white border-[#d9e1e8] text-[#1d2d3e]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {step.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-[#107e3e] shrink-0 mt-0.5" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-[#5b738b] shrink-0 mt-0.5 flex items-center justify-center font-mono text-[9px] text-[#5b738b]">
                              {step.id}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold">{step.instruction}</div>
                            <div className="text-[11px] opacity-80 mt-0.5">{step.explanation}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setActiveCaseStudyId(caseStudy.id);
                            executeTCode(step.appTarget);
                          }}
                          className="px-2.5 py-1 rounded bg-[#f5f6f7] hover:bg-[#0a6ed1] hover:text-white border border-[#d9e1e8] font-mono text-[11px] font-bold text-[#1d2d3e] shrink-0 flex items-center gap-1 transition-colors"
                        >
                          <span>{step.appTarget}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#f0f4f9] border border-[#c2dcf7] rounded-lg p-3.5 text-xs text-[#1d2d3e] flex items-start gap-3">
                  <HelpCircle className="w-4 h-4 text-[#0a6ed1] shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <strong className="block font-bold text-[#0a6ed1]">
                      Preparación para Entrevista Laboral:
                    </strong>
                    <p className="mt-0.5 leading-relaxed">{caseStudy.interviewTip}</p>
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
