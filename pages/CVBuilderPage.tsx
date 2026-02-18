
import React, { useState, useRef } from 'react';
import { Download, ChevronRight, ChevronLeft, Sparkles, Plus, Trash2, User, Briefcase, GraduationCap, Award, FileText, Lock, Star, Check, Zap, Crown, CreditCard, Calendar, Clock } from 'lucide-react';
import { GeminiService } from '../services/gemini';
import { CVData, CVExperience, CVEducation, UserProfile } from '../types';

interface CVBuilderPageProps {
  isAuthenticated: boolean;
  userProfile?: UserProfile;
  onRequireAuth: () => void;
  onUpgrade: (plan: 'pack3' | 'monthly' | 'yearly') => void;
  onDecrementCredit?: () => void;
}

const initialCV: CVData = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  experiences: [],
  education: [],
  skills: []
};

export const CVBuilderPage: React.FC<CVBuilderPageProps> = ({ isAuthenticated, userProfile, onRequireAuth, onUpgrade, onDecrementCredit }) => {
  const [step, setStep] = useState(1);
  const [cv, setCv] = useState<CVData>(initialCV);
  const [isImproving, setIsImproving] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pack3' | 'monthly' | 'yearly'>('monthly');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  // Check Access
  const hasCredits = (userProfile?.cvCredits || 0) > 0;
  const isPremiumValid = userProfile?.isPremium && (userProfile.premiumExpiry || 0) > Date.now();
  const canDownload = isAuthenticated && (isPremiumValid || hasCredits);

  // Helper for Input Changes
  const updateField = (field: keyof CVData, value: any) => {
    setCv(prev => ({ ...prev, [field]: value }));
  };

  // AI Helper Functions
  const improveText = async (text: string, type: 'summary' | 'description', expId?: string) => {
    if (!isAuthenticated) { onRequireAuth(); return; }
    if (!text) return;
    
    setIsImproving(true);
    const optimized = await GeminiService.improveCVContent(text, type);
    
    if (type === 'summary') {
      updateField('summary', optimized);
    } else if (type === 'description' && expId) {
      const newExp = cv.experiences.map(e => e.id === expId ? { ...e, description: optimized } : e);
      updateField('experiences', newExp);
    }
    setIsImproving(false);
  };

  const addExperience = () => {
    const newExp: CVExperience = {
      id: Date.now().toString(),
      role: '', company: '', startDate: '', endDate: '', isCurrent: false, description: ''
    };
    updateField('experiences', [...cv.experiences, newExp]);
  };

  const removeExperience = (id: string) => {
    updateField('experiences', cv.experiences.filter(e => e.id !== id));
  };

  const updateExperience = (id: string, field: keyof CVExperience, value: any) => {
    const newExp = cv.experiences.map(e => e.id === id ? { ...e, [field]: value } : e);
    updateField('experiences', newExp);
  };

  const addEducation = () => {
    const newEdu: CVEducation = { id: Date.now().toString(), degree: '', school: '', year: '' };
    updateField('education', [...cv.education, newEdu]);
  };

  const updateEducation = (id: string, field: keyof CVEducation, value: any) => {
    const newEdu = cv.education.map(e => e.id === id ? { ...e, [field]: value } : e);
    updateField('education', newEdu);
  };

  const handleSkillAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = e.currentTarget.value.trim();
      if (val && !cv.skills.includes(val)) {
        updateField('skills', [...cv.skills, val]);
        e.currentTarget.value = '';
      }
    }
  };

  const handlePrint = () => {
    if (!isAuthenticated) { onRequireAuth(); return; }
    
    if (canDownload) {
      if (!isPremiumValid && hasCredits && onDecrementCredit) {
        onDecrementCredit();
        alert(`1 Crédito usado. Restam ${userProfile!.cvCredits - 1} créditos.`);
      }
      window.print();
    }
  };

  const handleSimulatePayment = () => {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }
    setIsPaymentProcessing(true);
    // Simula delay de pagamento
    setTimeout(() => {
      onUpgrade(selectedPlan);
      setIsPaymentProcessing(false);
      alert("Pagamento confirmado! Acesso libertado.");
    }, 2000);
  };

  // --- STEPS RENDERING ---
  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-xl font-black text-brand-gold uppercase tracking-tight flex items-center gap-2">
        <User size={20} /> Informações Pessoais
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nome Completo</label>
          <input 
            className="w-full bg-slate-50 dark:bg-white/5 border gold-border-subtle p-3 rounded-xl outline-none" 
            value={cv.fullName} 
            onChange={e => updateField('fullName', e.target.value)} 
            placeholder="Ex: João Manuel"
            aria-label="Nome Completo"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cargo / Título Profissional</label>
          <input 
            className="w-full bg-slate-50 dark:bg-white/5 border gold-border-subtle p-3 rounded-xl outline-none" 
            placeholder="Ex: Engenheiro Civil Sénior"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email</label>
          <input 
            className="w-full bg-slate-50 dark:bg-white/5 border gold-border-subtle p-3 rounded-xl outline-none" 
            value={cv.email} 
            onChange={e => updateField('email', e.target.value)} 
            placeholder="email@exemplo.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Telefone</label>
          <input 
            className="w-full bg-slate-50 dark:bg-white/5 border gold-border-subtle p-3 rounded-xl outline-none" 
            value={cv.phone} 
            onChange={e => updateField('phone', e.target.value)} 
            placeholder="+244 9XX XXX XXX"
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Localização</label>
          <input 
            className="w-full bg-slate-50 dark:bg-white/5 border gold-border-subtle p-3 rounded-xl outline-none" 
            value={cv.location} 
            onChange={e => updateField('location', e.target.value)} 
            placeholder="Luanda, Angola"
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Resumo Profissional</label>
            <button 
              onClick={() => improveText(cv.summary, 'summary')}
              disabled={isImproving || !cv.summary}
              className="text-[9px] font-black uppercase tracking-widest text-brand-gold flex items-center gap-1 hover:text-amber-600 disabled:opacity-50"
            >
              <Sparkles size={12} /> {isImproving ? 'Otimizando...' : 'Melhorar com IA'}
            </button>
          </div>
          <textarea 
            className="w-full bg-slate-50 dark:bg-white/5 border gold-border-subtle p-3 rounded-xl outline-none h-32 resize-none" 
            value={cv.summary} 
            onChange={e => updateField('summary', e.target.value)} 
            placeholder="Escreva um breve resumo sobre a sua carreira..."
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-brand-gold uppercase tracking-tight flex items-center gap-2">
          <Briefcase size={20} /> Experiência
        </h3>
        <button onClick={addExperience} className="bg-brand-gold text-white p-2 rounded-full" aria-label="Adicionar Experiência"><Plus size={20} /></button>
      </div>

      {cv.experiences.length === 0 && (
        <div className="text-center p-8 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-orange-500/20">
          <p className="text-slate-400 text-sm font-bold">Nenhuma experiência adicionada</p>
        </div>
      )}

      {cv.experiences.map((exp, idx) => (
        <div key={exp.id} className="bg-white dark:bg-slate-900 border gold-border-subtle p-6 rounded-2xl space-y-4 shadow-sm relative">
           <button onClick={() => removeExperience(exp.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500" aria-label="Remover Experiência"><Trash2 size={18} /></button>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                placeholder="Cargo (Ex: Gerente)" 
                className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg outline-none font-bold"
                value={exp.role}
                onChange={e => updateExperience(exp.id, 'role', e.target.value)}
                aria-label="Cargo"
              />
                  <input placeholder="Empresa" className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg outline-none font-bold" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} aria-label="Nome da Empresa" />
               <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="MM/AAAA"
                    aria-label="Data de Início" 
                    className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg w-full outline-none text-xs" 
                    value={exp.startDate} 
                    onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} 
                    maxLength={7}
                  />
                  <input 
                    type="text" 
                    placeholder="MM/AAAA (Fim)"
                    aria-label="Data de Fim" 
                    disabled={exp.isCurrent} 
                    className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg w-full outline-none text-xs disabled:opacity-50" 
                    value={exp.endDate} 
                    onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} 
                    maxLength={7}
                  />
               </div>
              <div className="flex items-center gap-2">
                 <input type="checkbox" checked={exp.isCurrent} onChange={e => updateExperience(exp.id, 'isCurrent', e.target.checked)} id={`curr-${exp.id}`} className="accent-brand-gold w-4 h-4" />
                 <label htmlFor={`curr-${exp.id}`} className="text-xs font-bold uppercase tracking-widest text-slate-500">Trabalho Atual</label>
              </div>
           </div>
           <div>
              <div className="flex justify-between items-center mb-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Descrição das Atividades</label>
                 <button 
                    onClick={() => improveText(exp.description, 'description', exp.id)}
                    disabled={isImproving || !exp.description}
                    className="text-[9px] font-black uppercase tracking-widest text-brand-gold flex items-center gap-1 hover:text-amber-600 disabled:opacity-50"
                  >
                    <Sparkles size={12} /> {isImproving ? 'IA a escrever...' : 'Melhorar com IA'}
                  </button>
              </div>
              <textarea 
                className="w-full bg-slate-50 dark:bg-white/5 border gold-border-subtle p-3 rounded-xl outline-none h-24 resize-none"
                placeholder="Descreva suas responsabilidades e conquistas..."
                value={exp.description}
                onChange={e => updateExperience(exp.id, 'description', e.target.value)}
              />
           </div>
        </div>
      ))}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-brand-gold uppercase tracking-tight flex items-center gap-2">
          <GraduationCap size={20} /> Educação
        </h3>
        <button onClick={addEducation} className="bg-brand-gold text-white p-2 rounded-full" aria-label="Adicionar Educação"><Plus size={20} /></button>
      </div>
      {cv.education.map((edu) => (
        <div key={edu.id} className="bg-white dark:bg-slate-900 border gold-border-subtle p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 relative">
           <button onClick={() => updateField('education', cv.education.filter(e => e.id !== edu.id))} className="absolute top-4 right-4 text-slate-400 hover:text-red-500" aria-label="Remover Educação"><Trash2 size={18} /></button>
           <input 
              placeholder="Curso / Grau (Ex: Licenciatura)" 
              className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg outline-none font-bold"
              value={edu.degree}
              onChange={e => updateEducation(edu.id, 'degree', e.target.value)}
              aria-label="Grau Académico"
           />
           <input 
              placeholder="Instituição" 
              className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg outline-none font-bold"
              value={edu.school}
              onChange={e => updateEducation(edu.id, 'school', e.target.value)}
              aria-label="Instituição de Ensino"
           />
           <input 
              placeholder="Ano de Conclusão" 
              className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg outline-none font-bold"
              value={edu.year}
              onChange={e => updateEducation(edu.id, 'year', e.target.value)}
              aria-label="Ano de Conclusão"
           />
        </div>
      ))}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-xl font-black text-brand-gold uppercase tracking-tight flex items-center gap-2">
        <Award size={20} /> Habilidades
      </h3>
      <div className="bg-white dark:bg-slate-900 border gold-border-subtle p-6 rounded-2xl space-y-4">
        <input 
          className="w-full bg-slate-50 dark:bg-white/5 border gold-border-subtle p-4 rounded-xl outline-none" 
          placeholder="Digite uma habilidade e pressione ENTER (Ex: Gestão de Projetos)"
          onKeyDown={handleSkillAdd}
          aria-label="Adicionar nova habilidade"
        />
        <div className="flex flex-wrap gap-2">
           {cv.skills.map((skill, i) => (
             <span key={i} className="bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2">
               {skill} <button onClick={() => updateField('skills', cv.skills.filter(s => s !== skill))} aria-label={`Remover habilidade ${skill}`}><CloseIcon size={14} /></button>
             </span>
           ))}
        </div>
      </div>
    </div>
  );

  // --- PREVIEW RENDER (CSS FOR PRINT) ---
  const PreviewCV = () => (
    <div id="cv-preview" className="bg-white text-slate-900 p-12 max-w-[210mm] mx-auto min-h-[297mm] shadow-2xl relative print:shadow-none print:w-full print:max-w-none print:m-0 print:p-0">
       {/* Header */}
       <div className="border-b-2 border-slate-900 pb-6 mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">{cv.fullName || 'Seu Nome'}</h1>
          <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
             {cv.email && <span>{cv.email}</span>}
             {cv.phone && <span>• {cv.phone}</span>}
             {cv.location && <span>• {cv.location}</span>}
          </div>
       </div>

       {/* Summary */}
       {cv.summary && (
         <div className="mb-8">
            <h2 className="text-sm font-black uppercase tracking-widest border-b border-orange-500/20 pb-1 mb-3 text-slate-400">Perfil Profissional</h2>
            <p className="text-sm leading-relaxed">{cv.summary}</p>
         </div>
       )}

       {/* Experience */}
       {cv.experiences.length > 0 && (
         <div className="mb-8">
            <h2 className="text-sm font-black uppercase tracking-widest border-b border-slate-200 pb-1 mb-4 text-slate-400">Experiência Profissional</h2>
            <div className="space-y-5">
               {cv.experiences.map(exp => (
                 <div key={exp.id}>
                    <div className="flex justify-between items-baseline mb-1">
                       <h3 className="font-bold text-lg">{exp.role}</h3>
                       <span className="text-xs font-bold text-slate-500">{exp.startDate} - {exp.isCurrent ? 'Presente' : exp.endDate}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-700 mb-2">{exp.company}</div>
                    <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">{exp.description}</p>
                 </div>
               ))}
            </div>
         </div>
       )}

       {/* Education */}
       {cv.education.length > 0 && (
         <div className="mb-8">
            <h2 className="text-sm font-black uppercase tracking-widest border-b border-slate-200 pb-1 mb-4 text-slate-400">Educação</h2>
            <div className="space-y-3">
               {cv.education.map(edu => (
                 <div key={edu.id} className="flex justify-between">
                    <div>
                       <div className="font-bold">{edu.school}</div>
                       <div className="text-sm text-slate-600">{edu.degree}</div>
                    </div>
                    <div className="text-sm font-bold text-slate-500">{edu.year}</div>
                 </div>
               ))}
            </div>
         </div>
       )}

       {/* Skills */}
       {cv.skills.length > 0 && (
         <div>
            <h2 className="text-sm font-black uppercase tracking-widest border-b border-slate-200 pb-1 mb-4 text-slate-400">Competências</h2>
            <div className="flex flex-wrap gap-2">
               {cv.skills.map((skill, i) => (
                 <span key={i} className="bg-slate-100 px-3 py-1 rounded text-xs font-bold">{skill}</span>
               ))}
            </div>
         </div>
       )}

       {/* Watermark */}
       <div className="mt-12 pt-6 border-t border-slate-100 text-center text-[10px] text-slate-400 uppercase tracking-widest">
          Gerado por Angolife AI Resume Builder
       </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 relative">
      <div className="flex flex-col md:flex-row gap-8 print:hidden">
        {/* LEFT SIDE: BUILDER FORM */}
        <div className={`w-full md:w-1/2 space-y-6 transition-all duration-500 ${!canDownload ? 'blur-sm pointer-events-none select-none opacity-50' : ''}`}>
           <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] shadow-xl gold-border-subtle">
              <div className="flex justify-between items-center mb-8 border-b gold-border-b-subtle pb-4">
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Criador de CV</h2>
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    Passo <span className="text-brand-gold text-lg">{step}</span> / 4
                 </div>
              </div>

              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}

              <div className="flex justify-between mt-10 pt-6 border-t gold-border-t-subtle">
                 <button 
                   onClick={() => setStep(s => Math.max(1, s - 1))} 
                   disabled={step === 1}
                   className="flex items-center gap-2 text-slate-500 font-bold uppercase text-xs tracking-widest hover:text-slate-900 dark:hover:text-white disabled:opacity-50"
                 >
                   <ChevronLeft size={16} /> Voltar
                 </button>
                 
                 {step < 4 ? (
                   <button 
                     onClick={() => setStep(s => Math.min(4, s + 1))}
                     className="bg-brand-gold text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-amber-600"
                   >
                     Próximo <ChevronRight size={16} />
                   </button>
                 ) : (
                   <div className="flex items-center gap-2">
                     <div className="text-right mr-2 hidden md:block">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Estado da conta</div>
                        {isPremiumValid && <div className="text-xs font-black text-emerald-500 uppercase">Premium Ativo</div>}
                        {!isPremiumValid && hasCredits && <div className="text-xs font-black text-brand-gold uppercase">{userProfile?.cvCredits} Créditos</div>}
                        {!canDownload && <div className="text-xs font-black text-red-500 uppercase">Sem Acesso</div>}
                     </div>
                     <button 
                       onClick={handlePrint}
                       className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-emerald-600"
                     >
                       <Download size={16} /> Baixar PDF
                     </button>
                   </div>
                 )}
              </div>
           </div>

           {/* AI TIPS CARD */}
           <div className="bg-slate-950 text-white p-8 rounded-[2rem] gold-border-subtle relative overflow-hidden">
              <div className="relative z-10">
                 <h4 className="flex items-center gap-2 text-brand-gold font-black uppercase tracking-widest text-sm mb-4">
                    <Sparkles size={14} /> Dica de Ouro Angolife
                 </h4>
                 <p className="text-sm font-medium leading-relaxed text-slate-300">
                   {step === 1 && "Use um email profissional (nome.sobrenome@email.com). Evite emails informais. No resumo, foque no valor que pode trazer à empresa."}
                   {step === 2 && "Em vez de listar tarefas, liste resultados. Use a IA para transformar 'Vendi produtos' em 'Gerenciei vendas resultando em 20% de aumento de receita'."}
                   {step === 3 && "Coloque a educação mais recente primeiro. Se tem experiência, não precisa detalhar o ensino médio."}
                   {step === 4 && "Foque em competências técnicas (Hard Skills) relevantes para a vaga. Soft skills são melhores demonstradas na entrevista."}
                 </p>
              </div>
           </div>
        </div>

        {/* RIGHT SIDE: LIVE PREVIEW */}
        <div className={`w-full md:w-1/2 ${!canDownload ? 'blur-sm pointer-events-none opacity-40' : ''}`}>
           <div className="sticky top-24">
              <div className="flex items-center justify-between mb-4 px-2">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pré-visualização ao vivo</span>
                 {!isAuthenticated && (
                   <span className="flex items-center gap-1 text-[9px] font-bold text-red-400 uppercase tracking-widest"><Lock size={10} /> Login necessário</span>
                 )}
              </div>
              <div className="transform scale-[0.6] md:scale-[0.85] origin-top-left md:origin-top border-4 border-orange-500/20 rounded-lg overflow-hidden bg-white">
                 <PreviewCV />
              </div>
           </div>
        </div>

        {/* SUBSCRIPTION OVERLAY */}
        {!canDownload && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
             <div className="min-h-full flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md"></div>
                
                <div className="relative w-full max-w-4xl mx-auto z-10">
                   <div className="text-center mb-10">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-gold text-white mb-6 shadow-xl shadow-amber-500/20">
                         <Crown size={32} />
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
                        Desbloqueie o seu <span className="text-brand-gold">Potencial</span>
                      </h2>
                      <p className="text-slate-400 text-lg font-medium max-w-xl mx-auto">
                        Escolha o plano ideal para a sua carreira. Acesso imediato ao nosso criador de CV com inteligência artificial.
                      </p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* PLAN 1: PACK 3 */}
                      <div 
                        onClick={() => setSelectedPlan('pack3')}
                        className={`bg-slate-900 border-2 rounded-3xl p-6 cursor-pointer transition-all hover:scale-105 ${selectedPlan === 'pack3' ? 'border-brand-gold shadow-2xl scale-105 bg-slate-800' : 'border-slate-800 hover:border-slate-700'}`}
                      >
                         <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-800 rounded-2xl text-slate-400"><FileText size={24} /></div>
                            {selectedPlan === 'pack3' && <div className="bg-brand-gold text-white text-[10px] font-black uppercase px-2 py-1 rounded">Selecionado</div>}
                         </div>
                         <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Micro Pack</h3>
                         <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-3xl font-black text-white">200</span>
                            <span className="text-brand-gold font-bold text-sm">Kz</span>
                         </div>
                         <p className="text-slate-400 text-xs font-bold leading-relaxed mb-6">
                           Ideal para quem precisa de atualizações pontuais. Pague apenas o que usa.
                         </p>
                         <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2 text-xs font-bold text-slate-300"><Check size={14} className="text-emerald-500" /> 3 Downloads de CV</li>
                            <li className="flex items-center gap-2 text-xs font-bold text-slate-300"><Check size={14} className="text-emerald-500" /> Modelos Premium</li>
                            <li className="flex items-center gap-2 text-xs font-bold text-slate-300"><Check size={14} className="text-emerald-500" /> Correção c/ IA</li>
                         </ul>
                      </div>

                      {/* PLAN 2: MONTHLY (POPULAR) */}
                      <div 
                        onClick={() => setSelectedPlan('monthly')}
                        className={`bg-slate-900 border-2 rounded-3xl p-6 cursor-pointer transition-all hover:scale-105 relative overflow-hidden ${selectedPlan === 'monthly' ? 'border-brand-gold shadow-2xl scale-105 bg-slate-800 ring-2 ring-brand-gold/20' : 'border-slate-800 hover:border-slate-700'}`}
                      >
                         <div className="absolute top-0 right-0 bg-brand-gold text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl">Mais Popular</div>
                         <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-brand-gold rounded-2xl text-white shadow-lg"><Calendar size={24} /></div>
                         </div>
                         <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Mensal</h3>
                         <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-3xl font-black text-white">500</span>
                            <span className="text-brand-gold font-bold text-sm">Kz / mês</span>
                         </div>
                         <p className="text-slate-400 text-xs font-bold leading-relaxed mb-6">
                           Acesso total durante 30 dias. Perfeito para quem está ativamente à procura.
                         </p>
                         <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2 text-xs font-bold text-slate-300"><Check size={14} className="text-emerald-500" /> Downloads Ilimitados</li>
                            <li className="flex items-center gap-2 text-xs font-bold text-slate-300"><Check size={14} className="text-emerald-500" /> Acesso a Vagas VIP</li>
                            <li className="flex items-center gap-2 text-xs font-bold text-slate-300"><Check size={14} className="text-emerald-500" /> Prioridade no Suporte</li>
                         </ul>
                      </div>

                      {/* PLAN 3: YEARLY */}
                      <div 
                         onClick={() => setSelectedPlan('yearly')}
                         className={`bg-slate-900 border-2 rounded-3xl p-6 cursor-pointer transition-all hover:scale-105 ${selectedPlan === 'yearly' ? 'border-brand-gold shadow-2xl scale-105 bg-slate-800' : 'border-orange-500/20 hover:border-orange-500/30'}`}
                      >
                         <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-800 rounded-2xl text-slate-400"><Clock size={24} /></div>
                            {selectedPlan === 'yearly' && <div className="bg-brand-gold text-white text-[10px] font-black uppercase px-2 py-1 rounded">Selecionado</div>}
                         </div>
                         <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Anual</h3>
                         <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-3xl font-black text-white">1.500</span>
                            <span className="text-brand-gold font-bold text-sm">Kz / ano</span>
                         </div>
                         <p className="text-slate-400 text-xs font-bold leading-relaxed mb-6">
                           Melhor valor. Poupe e mantenha o seu CV sempre atualizado o ano todo.
                         </p>
                         <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2 text-xs font-bold text-slate-300"><Check size={14} className="text-emerald-500" /> Tudo do Mensal</li>
                            <li className="flex items-center gap-2 text-xs font-bold text-slate-300"><Check size={14} className="text-emerald-500" /> 2 Meses Grátis</li>
                            <li className="flex items-center gap-2 text-xs font-bold text-slate-300"><Check size={14} className="text-emerald-500" /> Destaque no Perfil</li>
                         </ul>
                      </div>
                   </div>

                   <div className="mt-10 flex flex-col items-center">
                     <button 
                       onClick={handleSimulatePayment}
                       disabled={isPaymentProcessing}
                       className="w-full md:w-auto min-w-[300px] bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden"
                     >
                        {isPaymentProcessing ? (
                          <span>Processando...</span>
                        ) : (
                          <>
                            <CreditCard size={20} />
                            <span>Continuar para Pagamento</span>
                          </>
                        )}
                     </button>
                     <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-4">
                       Pagamento Seguro Via Multicaixa Express
                     </p>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* PRINT STYLES - Ensures only the CV is printed */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #cv-preview, #cv-preview * {
            visibility: visible;
          }
          #cv-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 40px !important;
            box-shadow: none;
          }
          @page {
            margin: 0;
            size: auto;
          }
        }
      `}</style>
    </div>
  );
};

// Simple CloseIcon replacement for the Skills section
const CloseIcon = ({size}:{size:number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
