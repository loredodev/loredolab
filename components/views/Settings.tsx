
import React, { useState, useRef } from 'react';
import { User, Organization, Language, Chronotype } from '../../types';
import { Save, LogOut, Trash2, Check, Shield, Smartphone, Calendar, Download, User as UserIcon, Camera, Loader2, LayoutGrid, ChevronRight, Sun, Moon, Sunrise } from 'lucide-react';
import { PLAN_LIMITS, CONTENT } from '../../constants';
import { createCheckoutSession, createPortalSession } from '../../services/billingService';
import { supabase } from '../../services/supabase';

interface SettingsProps {
  user: User;
  onLogout: () => void;
  lang: Language;
}

export const Settings: React.FC<SettingsProps> = ({ user, onLogout, lang }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'billing'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const isPt = lang === 'pt';
  
  const [integrations, setIntegrations] = useState({ apple: false, calendar: false });

  const [formData, setFormData] = useState({
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      chronotype: user.chronotype || 'bear'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = CONTENT[lang]?.settings || CONTENT['en'].settings;
  const planT = t.billing.plans; 
  
  const currentOrg: Organization = {
      id: user.orgId || 'personal',
      name: 'Personal Lab',
      plan: 'FREE', 
      members: 1
  };

  const handleSave = async () => {
      setIsSaving(true);
      try {
          // Saving to Auth Metadata (usually mapped to Public User via trigger)
          const { error } = await supabase.auth.updateUser({
              data: { 
                  full_name: formData.name,
                  chronotype: formData.chronotype
              }
          });
          if (error) throw error;
          
          // Also try to update Public Table directly to be sure (since triggers might lag or fail)
          await supabase.from('users').update({ 
              full_name: formData.name
              // Note: Chronotype column might not exist on users table in all schemas, relies on metadata usually for app state
          }).eq('id', user.id);

          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err) {
          console.error("Failed to update profile", err);
      } finally {
          setIsSaving(false);
      }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      setUploadingPhoto(true);

      try {
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64String = reader.result as string;
              setFormData(prev => ({ ...prev, avatarUrl: base64String }));
              await supabase.auth.updateUser({
                  data: { avatar_url: base64String }
              });
              setUploadingPhoto(false);
          };
          reader.readAsDataURL(file);
      } catch (err) {
          setUploadingPhoto(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 px-4">
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-lab-900 tracking-tight">{t.title}</h1>
            <p className="text-lab-500 font-medium mt-1">{user.email}</p>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center justify-center gap-2 text-lab-500 hover:text-red-600 transition-all text-sm font-bold bg-white border border-lab-200 px-6 py-3 rounded-2xl shadow-sm hover:shadow-md"
          >
            <LogOut className="w-4 h-4" /> {t.logout} 
          </button>
      </header>

      {/* Navegação de Abas - Estilo Pílula */}
      <div className="flex bg-lab-100 p-1.5 rounded-2xl w-fit overflow-x-auto max-w-full">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-8 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'profile' ? 'bg-white text-lab-900 shadow-sm' : 'text-lab-500 hover:text-lab-700'}`}
          >
            {t.tabs.profile}
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`px-8 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'billing' ? 'bg-white text-lab-900 shadow-sm' : 'text-lab-500 hover:text-lab-700'}`}
          >
            {t.tabs.billing}
          </button>
      </div>

      {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                  {/* Card de Informações */}
                  <div className="bg-white p-8 rounded-[2.5rem] border border-lab-200 shadow-sm space-y-8">
                      <div className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
                          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                              <div className="w-28 h-28 rounded-3xl bg-lab-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-lab-400 rotate-3 group-hover:rotate-0 transition-transform">
                                  {uploadingPhoto ? <Loader2 className="animate-spin w-8 h-8"/> : (
                                      formData.avatarUrl ? <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon className="w-12 h-12" />
                                  )}
                              </div>
                              <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Camera className="w-6 h-6 text-white" />
                              </div>
                              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                          </div>
                          <div>
                              <h2 className="text-2xl font-bold text-lab-900">{t.profile.header}</h2>
                              <p className="text-sm text-lab-400 font-medium">#{user.id.slice(0, 8)} • Scientist Alpha</p>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-lab-400 uppercase tracking-widest ml-1">{t.profile.name}</label>
                              <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full px-5 py-4 rounded-2xl border border-lab-200 bg-lab-50/20 focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium text-lab-900"
                              />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-lab-400 uppercase tracking-widest ml-1">{t.profile.role}</label>
                              <div className="px-5 py-4 rounded-2xl border border-lab-100 bg-lab-50 text-lab-400 font-medium cursor-not-allowed select-none">
                                  {user.role}
                              </div>
                          </div>
                      </div>

                      {/* Bio-Personalization: Chronotype Selector */}
                      <div className="space-y-4 pt-4 border-t border-lab-100">
                          <div className="flex items-center gap-2">
                              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Smartphone className="w-4 h-4" /></div>
                              <h3 className="font-bold text-lab-900">{isPt ? 'Bio-Personalização (Cronotipo)' : 'Bio-Personalization (Chronotype)'}</h3>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3">
                              {[
                                  { id: 'lion', label: isPt ? 'Leão' : 'Lion', icon: Sunrise, desc: '5am-9pm' },
                                  { id: 'bear', label: isPt ? 'Urso' : 'Bear', icon: Sun, desc: '7am-11pm' },
                                  { id: 'wolf', label: isPt ? 'Lobo' : 'Wolf', icon: Moon, desc: '10am-2am' },
                              ].map((type) => (
                                  <button
                                      key={type.id}
                                      onClick={() => setFormData({...formData, chronotype: type.id as Chronotype})}
                                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                                          formData.chronotype === type.id 
                                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900' 
                                          : 'border-lab-100 hover:border-indigo-200 text-lab-500'
                                      }`}
                                  >
                                      <type.icon className={`w-6 h-6 mb-1 ${formData.chronotype === type.id ? 'text-indigo-600' : 'text-lab-400'}`} />
                                      <span className="font-bold text-xs">{type.label}</span>
                                      <span className="text-[9px] opacity-70">{type.desc}</span>
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div className="flex items-center justify-end pt-4">
                          <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-sm text-white transition-all shadow-lg hover:shadow-primary-500/20 flex items-center justify-center gap-2 ${saveSuccess ? 'bg-emerald-500' : 'bg-lab-900 hover:bg-black'}`}
                          >
                              {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : (saveSuccess ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />)}
                              {saveSuccess ? t.profile.saved : t.profile.save}
                          </button>
                      </div>
                  </div>

                  {/* Grade de Integrações */}
                  <div className="space-y-6">
                      <div className="flex items-center gap-2 px-2">
                          <LayoutGrid className="w-5 h-5 text-primary-600" />
                          <h2 className="text-xl font-bold text-lab-900">{t.profile.integrations}</h2>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <IntegrationCard 
                            icon={<Smartphone className="w-5 h-5 text-red-500" />}
                            title={t.integrations?.apple?.title || "Apple Health"}
                            desc={t.integrations?.apple?.desc || "Health data"}
                            checked={integrations.apple}
                            onChange={() => setIntegrations(p => ({...p, apple: !p.apple}))}
                        />
                        <IntegrationCard 
                            icon={<Calendar className="w-5 h-5 text-blue-500" />}
                            title={t.integrations?.calendar?.title || "Google Calendar"}
                            desc={t.integrations?.calendar?.desc || "Routines"}
                            checked={integrations.calendar}
                            onChange={() => setIntegrations(p => ({...p, calendar: !p.calendar}))}
                        />
                      </div>
                  </div>
              </div>

              <div className="space-y-6">
                  {/* Card de Segurança/Privacidade */}
                  <div className="bg-white p-8 rounded-[2.5rem] border border-lab-200 shadow-sm space-y-6">
                      <h2 className="text-xs font-black text-lab-900 uppercase tracking-[0.2em] border-b border-lab-100 pb-4">{t.profile.privacy}</h2>
                      
                      <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-lab-100 hover:bg-lab-50 transition-all group">
                          <div className="text-left">
                              <div className="font-bold text-lab-800 text-sm">{t.profile.backup}</div>
                              <div className="text-[10px] text-lab-400 font-bold uppercase tracking-tight">{t.profile.backupDesc}</div>
                          </div>
                          <Download className="w-5 h-5 text-lab-300 group-hover:text-primary-600 transition-colors" />
                      </button>

                      <button 
                        onClick={() => window.confirm(t.profile.deleteConfirm)}
                        className="w-full flex items-center justify-between p-4 rounded-2xl border border-red-50 bg-red-50/5 hover:bg-red-50 transition-all group"
                      >
                          <div className="text-left">
                              <div className="font-bold text-red-700 text-sm">{t.profile.delete}</div>
                              <div className="text-[10px] text-red-400 font-bold uppercase tracking-tight">{t.profile.deleteDesc}</div>
                          </div>
                          <Trash2 className="w-5 h-5 text-red-200 group-hover:text-red-600 transition-colors" />
                      </button>
                  </div>
                  
                  <div className="p-8 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                      <Shield className="w-20 h-20 text-white/10 absolute -bottom-4 -right-4" />
                      <h3 className="font-black text-lg mb-2 flex items-center gap-2">
                        <Shield className="w-5 h-5" /> HIPAA Compliant
                      </h3>
                      <p className="text-xs text-white/80 font-medium leading-relaxed">
                          Seus dados científicos são criptografados. Apenas você e seus colegas de lab autorizados possuem a chave de acesso.
                      </p>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'billing' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-10">
                  <div className="absolute top-0 right-0 p-24 bg-primary-600/30 rounded-full blur-[100px] -mr-20 -mt-20"></div>
                  <div className="relative z-10 text-center md:text-left">
                      <span className="bg-white/10 text-white/70 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/10 mb-6 inline-block">
                        {t.billing.currentPlan}
                      </span>
                      <h2 className="text-6xl font-black tracking-tighter">
                          {planT[currentOrg.plan].name}
                      </h2>
                  </div>
                  <button 
                    onClick={() => createPortalSession()} 
                    className="relative z-10 w-full md:w-auto bg-white text-black hover:bg-lab-100 px-12 py-5 rounded-2xl font-black text-sm transition-all transform hover:-translate-y-1 shadow-xl"
                  >
                      {t.billing.manageStripe}
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <PricingCard planConfig={PLAN_LIMITS.FREE} localizedPlan={planT.FREE} current={currentOrg.plan === 'FREE'} lang={lang} t={t} onSelect={() => {}} />
                  <PricingCard planConfig={PLAN_LIMITS.PREMIUM} localizedPlan={planT.PREMIUM} current={currentOrg.plan === 'PREMIUM'} lang={lang} t={t} onSelect={() => createCheckoutSession('PREMIUM')} popular />
                  <PricingCard planConfig={PLAN_LIMITS.SUPER_PREMIUM} localizedPlan={planT.SUPER_PREMIUM} current={currentOrg.plan === 'SUPER_PREMIUM'} lang={lang} t={t} onSelect={() => createCheckoutSession('SUPER_PREMIUM')} />
              </div>
          </div>
      )}
    </div>
  );
};

const IntegrationCard = ({ icon, title, desc, checked, onChange }: any) => (
    <div className="flex items-center justify-between p-6 border border-lab-200 bg-white rounded-[2rem] hover:border-primary-200 transition-all shadow-sm">
        <div className="flex items-center gap-4">
            <div className="p-3.5 bg-lab-50 rounded-2xl">{icon}</div>
            <div>
                <div className="font-black text-lab-900 text-sm tracking-tight">{title}</div>
                <div className="text-[10px] font-bold text-lab-400 uppercase tracking-widest mt-0.5">{desc}</div>
            </div>
        </div>
        <Switch checked={checked} onChange={onChange} />
    </div>
);

const Switch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
        <div className="w-14 h-8 bg-lab-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
    </label>
);

const PricingCard = ({ planConfig, localizedPlan, current, lang, t, onSelect, popular }: any) => {
    const isFree = planConfig.priceMonthly === 0;
    
    return (
        <div className={`relative flex flex-col p-10 rounded-[3rem] border transition-all duration-500 ${
            current 
            ? 'border-black ring-4 ring-black/5 bg-white shadow-2xl scale-[1.05] z-10' 
            : (popular ? 'border-primary-100 bg-white shadow-lg' : 'border-lab-200 bg-white hover:border-lab-300')
        }`}>
            {popular && !current && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                    {t.billing.popular}
                </div>
            )}
            <div className="mb-10">
                <h3 className="text-xl font-black text-lab-900 tracking-tight">{localizedPlan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-5xl font-black text-lab-900">
                        {isFree ? (lang === 'pt' ? 'R$0' : '$0') : `$${planConfig.priceMonthly}`}
                    </span>
                    {!isFree && <span className="text-lab-400 font-black text-xs uppercase tracking-widest">{t.billing.cycle}</span>}
                </div>
            </div>
            <div className="flex-1 space-y-5">
                <ul className="space-y-4">
                    {localizedPlan.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-center text-sm font-bold text-lab-600 gap-4">
                            <div className="bg-emerald-100 rounded-full p-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /></div>
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mt-12">
                {current ? (
                    <div className="w-full py-5 rounded-2xl font-black text-center bg-lab-100 text-lab-400 text-xs uppercase tracking-widest cursor-default">
                        {t.billing.current}
                    </div>
                ) : (
                    <button 
                        onClick={onSelect}
                        className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all transform hover:-translate-y-1 shadow-md hover:shadow-xl ${
                            popular 
                            ? 'bg-primary-600 text-white hover:bg-primary-700' 
                            : (isFree ? 'bg-lab-100 text-lab-500' : 'bg-lab-900 text-white hover:bg-black')
                        }`}
                    >
                        {isFree ? 'Começar' : t.billing.upgrade}
                    </button>
                )}
            </div>
        </div>
    );
};
