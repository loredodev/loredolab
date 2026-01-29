
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../../types';
import { Play, Pause, Headphones, Brain, Volume2, Wifi, Activity, Moon, Sun, Wind, Music, Sparkles, Heart, Zap, Waves, Info, ShieldCheck, Clock, X, Minimize2, Maximize2 } from 'lucide-react';
import { CONTENT } from '../../constants';

interface MindReprogrammingProps {
  lang: Language;
}

// --- TYPES ---

type Category = 'solfeggio' | 'brainwaves' | 'noise' | 'guided';

interface AudioTrack {
  id: string;
  title: string;
  desc: string;
  category: Category;
  colorFrom: string;
  colorTo: string;
  params: {
    type: 'sine' | 'binaural' | 'noise' | 'guided_session';
    freq?: number; // For sine
    base?: number; // For binaural
    beat?: number; // For binaural
    noiseColor?: 'white' | 'pink' | 'brown' | 'green';
  };
}

// --- GUIDED SCRIPTS (NSDR) ---

const NSDR_SCRIPT_PT = [
    { text: "Feche os olhos e permita que seu corpo afunde na superfície...", delay: 4000 },
    { text: "Não há nada para fazer... nenhum lugar para ir... apenas ser.", delay: 5000 },
    { text: "Respire fundo pelo nariz... e solte lentamente pela boca.", delay: 6000 },
    { text: "Imagine uma luz quente descendo pelo topo da sua cabeça.", delay: 5000 },
    { text: "Essa luz relaxa sua testa... seus olhos... e seu maxilar.", delay: 5000 },
    { text: "Sinta seus ombros pesados... soltando toda a tensão do dia.", delay: 5000 },
    { text: "Você está seguro. Você está no controle.", delay: 4000 },
    { text: "Atenção agora para sua mão direita. Sinta a palma da mão direita.", delay: 5000 },
    { text: "Mão esquerda. Sinta a palma da mão esquerda.", delay: 5000 },
    { text: "Sinta a batida do seu coração... calma e ritmada.", delay: 6000 },
    { text: "Agora, visualize seu objetivo já realizado.", delay: 5000 },
    { text: "Sinta a emoção da vitória. Você já é essa pessoa.", delay: 5000 },
    { text: "Você é focado. Você é inabalável.", delay: 4000 },
    { text: "Sua mente se regenera a cada segundo.", delay: 4000 },
    { text: "Permaneça neste estado de descanso profundo...", delay: 10000 },
    { text: "Curando... Restaurando... Fortalecendo.", delay: 5000 },
];

const NSDR_SCRIPT_EN = [
    { text: "Close your eyes and let your body sink into the surface...", delay: 4000 },
    { text: "There is nothing to do... nowhere to go... just be.", delay: 5000 },
    { text: "Deep breath in through your nose... and slowly out through your mouth.", delay: 6000 },
    { text: "Imagine a warm light descending from the top of your head.", delay: 5000 },
    { text: "This light relaxes your forehead... your eyes... and your jaw.", delay: 5000 },
    { text: "Feel your shoulders getting heavy... releasing all tension.", delay: 5000 },
    { text: "You are safe. You are in control.", delay: 4000 },
    { text: "Bring awareness to your right hand. Feel your right palm.", delay: 5000 },
    { text: "Left hand. Feel your left palm.", delay: 5000 },
    { text: "Feel your heartbeat... calm and rhythmic.", delay: 6000 },
    { text: "Now, visualize your goal already achieved.", delay: 5000 },
    { text: "Feel the emotion of victory. You are already that person.", delay: 5000 },
    { text: "You are focused. You are unshakeable.", delay: 4000 },
    { text: "Your mind regenerates with every second.", delay: 4000 },
    { text: "Stay in this state of deep rest...", delay: 10000 },
    { text: "Healing... Restoring... Strengthening.", delay: 5000 },
];

const SUBLIMINALS_PT = ["CURA", "PODER", "FOCO", "PAZ", "VIDA", "LUZ", "FLUIR", "AGORA", "EU SOU", "AMOR"];
const SUBLIMINALS_EN = ["HEAL", "POWER", "FOCUS", "PEACE", "LIFE", "LIGHT", "FLOW", "NOW", "I AM", "LOVE"];

// --- PLAYLIST DATA ---

const GET_PLAYLIST = (lang: Language): AudioTrack[] => {
    const isPt = lang === 'pt';
    return [
        // --- GUIDED ---
        {
            id: 'nsdr-session',
            title: isPt ? 'Sessão NSDR Imersiva (20min)' : 'Immersive NSDR Session (20min)',
            desc: isPt ? 'Hipnose guiada com ondas Theta e Ruído Rosa para reset neural.' : 'Guided hypnosis with Theta waves and Pink Noise for neural reset.',
            category: 'guided',
            colorFrom: 'from-indigo-600',
            colorTo: 'to-purple-900',
            params: { type: 'guided_session' }
        },

        // --- SOLFEGGIO FREQUENCIES (FULL LIST) ---
        {
            id: '174hz',
            title: '174 Hz - Pain Relief',
            desc: isPt ? 'Alívio da dor, tensão e stress físico.' : 'Relief from pain, tension, and physical stress.',
            category: 'solfeggio',
            colorFrom: 'from-stone-400',
            colorTo: 'to-stone-600',
            params: { type: 'sine', freq: 174 }
        },
        {
            id: '285hz',
            title: '285 Hz - Restoration',
            desc: isPt ? 'Regeneração de tecidos e órgãos. Cura.' : 'Healing tissues and organs. Restoration.',
            category: 'solfeggio',
            colorFrom: 'from-red-400',
            colorTo: 'to-red-600',
            params: { type: 'sine', freq: 285 }
        },
        {
            id: '396hz',
            title: '396 Hz - Liberation',
            desc: isPt ? 'Liberar medo, culpa e tristeza.' : 'Liberating guilt, fear, and grief.',
            category: 'solfeggio',
            colorFrom: 'from-orange-400',
            colorTo: 'to-orange-600',
            params: { type: 'sine', freq: 396 }
        },
        {
            id: '417hz',
            title: '417 Hz - Change',
            desc: isPt ? 'Desfazer situações e facilitar mudanças.' : 'Undoing situations and facilitating change.',
            category: 'solfeggio',
            colorFrom: 'from-amber-400',
            colorTo: 'to-amber-600',
            params: { type: 'sine', freq: 417 }
        },
        {
            id: '528hz',
            title: '528 Hz - Miracle Tone',
            desc: isPt ? 'Reparação de DNA, clareza e paz.' : 'DNA Repair, clarity, and peace.',
            category: 'solfeggio',
            colorFrom: 'from-green-400',
            colorTo: 'to-emerald-600',
            params: { type: 'sine', freq: 528 }
        },
        {
            id: '639hz',
            title: '639 Hz - Connection',
            desc: isPt ? 'Harmonia em relacionamentos e comunicação.' : 'Harmonious relationships and communication.',
            category: 'solfeggio',
            colorFrom: 'from-teal-400',
            colorTo: 'to-cyan-600',
            params: { type: 'sine', freq: 639 }
        },
        {
            id: '741hz',
            title: '741 Hz - Intuition',
            desc: isPt ? 'Limpeza de toxinas e despertar da intuição.' : 'Cleaning toxins and awakening intuition.',
            category: 'solfeggio',
            colorFrom: 'from-sky-400',
            colorTo: 'to-blue-600',
            params: { type: 'sine', freq: 741 }
        },
        {
            id: '852hz',
            title: '852 Hz - Spiritual',
            desc: isPt ? 'Retorno à ordem espiritual e consciência.' : 'Returning to spiritual order and awareness.',
            category: 'solfeggio',
            colorFrom: 'from-indigo-400',
            colorTo: 'to-violet-600',
            params: { type: 'sine', freq: 852 }
        },
        {
            id: '963hz',
            title: '963 Hz - Divine',
            desc: isPt ? 'Consciência divina e iluminação.' : 'Divine consciousness and enlightenment.',
            category: 'solfeggio',
            colorFrom: 'from-fuchsia-400',
            colorTo: 'to-purple-600',
            params: { type: 'sine', freq: 963 }
        },

        // --- BRAINWAVES (FULL LIST) ---
        {
            id: 'delta',
            title: 'Delta (0.5 - 4Hz)',
            desc: isPt ? 'Sono profundo sem sonhos, cura física.' : 'Deep dreamless sleep, physical healing.',
            category: 'brainwaves',
            colorFrom: 'from-slate-700',
            colorTo: 'to-slate-900',
            params: { type: 'binaural', base: 100, beat: 2 }
        },
        {
            id: 'theta',
            title: 'Theta (4 - 8Hz)',
            desc: isPt ? 'Meditação profunda, criatividade, REM.' : 'Deep meditation, creativity, REM sleep.',
            category: 'brainwaves',
            colorFrom: 'from-violet-500',
            colorTo: 'to-purple-800',
            params: { type: 'binaural', base: 200, beat: 6 }
        },
        {
            id: 'alpha',
            title: 'Alpha (8 - 14Hz)',
            desc: isPt ? 'Relaxamento acordado, pré-sono, calma.' : 'Awake relaxation, pre-sleep, calm.',
            category: 'brainwaves',
            colorFrom: 'from-blue-400',
            colorTo: 'to-blue-600',
            params: { type: 'binaural', base: 200, beat: 10 }
        },
        {
            id: 'beta',
            title: 'Beta (14 - 30Hz)',
            desc: isPt ? 'Foco ativo, pensamento analítico, alerta.' : 'Active focus, analytical thinking, alert.',
            category: 'brainwaves',
            colorFrom: 'from-amber-400',
            colorTo: 'to-orange-600',
            params: { type: 'binaural', base: 250, beat: 20 }
        },
        {
            id: 'gamma',
            title: 'Gamma (30 - 100Hz)',
            desc: isPt ? 'Processamento de alta performance e insight.' : 'High performance processing and insight.',
            category: 'brainwaves',
            colorFrom: 'from-rose-500',
            colorTo: 'to-red-600',
            params: { type: 'binaural', base: 400, beat: 40 }
        },

        // --- NOISE (FULL LIST) ---
        {
            id: 'brown-noise',
            title: isPt ? 'Ruído Marrom' : 'Brown Noise',
            desc: isPt ? 'Grave e profundo. O melhor para TDAH e silenciar pensamentos.' : 'Deep and rumbly. Best for ADHD and silencing thoughts.',
            category: 'noise',
            colorFrom: 'from-stone-500',
            colorTo: 'to-stone-800',
            params: { type: 'noise', noiseColor: 'brown' }
        },
        {
            id: 'green-noise',
            title: isPt ? 'Ruído Verde' : 'Green Noise',
            desc: isPt ? 'Frequências da natureza. Soa como floresta ou vento.' : 'Nature frequencies. Sounds like forest or wind.',
            category: 'noise',
            colorFrom: 'from-emerald-600',
            colorTo: 'to-green-800',
            params: { type: 'noise', noiseColor: 'green' }
        },
        {
            id: 'pink-noise',
            title: isPt ? 'Ruído Rosa' : 'Pink Noise',
            desc: isPt ? 'Balanceado como chuva constante. Ótimo para leitura.' : 'Balanced like steady rain. Great for reading.',
            category: 'noise',
            colorFrom: 'from-pink-400',
            colorTo: 'to-rose-500',
            params: { type: 'noise', noiseColor: 'pink' }
        },
        {
            id: 'white-noise',
            title: isPt ? 'Ruído Branco' : 'White Noise',
            desc: isPt ? 'Estática pura. Máscara total de sons externos.' : 'Pure static. Total masking of external sounds.',
            category: 'noise',
            colorFrom: 'from-gray-300',
            colorTo: 'to-gray-500',
            params: { type: 'noise', noiseColor: 'white' }
        }
    ];
};

// --- SOUND ENGINE (NEUROSONIC 2.0) ---

class NeuroSonicEngine {
    ctx: AudioContext | null = null;
    oscillators: OscillatorNode[] = [];
    gainNode: GainNode | null = null;
    noiseNode: AudioBufferSourceNode | null = null;
    isSpeaking: boolean = false;
    currentTimeout: ReturnType<typeof setTimeout> | null = null;

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            this.ctx = new AudioCtx();
            this.gainNode = this.ctx.createGain();
            this.gainNode.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    stop() {
        // Stop Oscillators
        this.oscillators.forEach(o => {
            try { o.disconnect(); } catch(e){}
        });
        this.oscillators = [];

        // Stop Noise
        if (this.noiseNode) {
            try { this.noiseNode.stop(); this.noiseNode.disconnect(); } catch(e){}
            this.noiseNode = null;
        }

        // Stop Speech
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            this.isSpeaking = false;
        }

        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
    }

    setVolume(val: number) {
        if (this.gainNode && this.ctx) {
            this.gainNode.gain.setTargetAtTime(val, this.ctx.currentTime, 0.1);
        }
    }

    // --- GENERATORS ---

    playSine(freq: number) {
        this.init();
        if (!this.ctx || !this.gainNode) return;
        this.stop();

        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.connect(this.gainNode);
        osc.start();
        this.oscillators.push(osc);
        
        this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 2);
    }

    playBinaural(base: number, beat: number, vol = 0.3) {
        this.init();
        if (!this.ctx) return;
        // Don't stop previous if blending, but for now simplistic
        // this.stop(); 

        const merger = this.ctx.createChannelMerger(2);
        merger.connect(this.gainNode!);

        // Left Ear
        const oscL = this.ctx.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(base, this.ctx.currentTime);
        const panL = this.ctx.createStereoPanner();
        panL.pan.value = -1;
        oscL.connect(panL).connect(this.gainNode!); 

        // Right Ear
        const oscR = this.ctx.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(base + beat, this.ctx.currentTime);
        const panR = this.ctx.createStereoPanner();
        panR.pan.value = 1;
        oscR.connect(panR).connect(this.gainNode!);

        oscL.start();
        oscR.start();
        this.oscillators.push(oscL, oscR);
    }

    playNoise(color: 'white' | 'pink' | 'brown' | 'green', vol = 0.2) {
        this.init();
        if (!this.ctx || !this.gainNode) return;
        
        const bufferSize = 2 * this.ctx.sampleRate;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            if (color === 'brown') {
                data[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5; 
            } else if (color === 'pink') {
                data[i] = (lastOut + (0.02 * white)) / 1.011; 
                lastOut = data[i];
                data[i] *= 4; 
            } else if (color === 'green') {
                // Nature spectrum approximation (mid-freq boost)
                data[i] = (lastOut + (0.1 * white)) / 1.05;
                lastOut = data[i];
                data[i] *= 2.5; 
            } else {
                data[i] = white * 0.5;
            }
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        
        // Separate gain for noise to allow layering
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.value = vol;
        noise.connect(noiseGain).connect(this.gainNode);
        
        noise.start();
        this.noiseNode = noise;
    }

    // --- NSDR SESSION MANAGER ---
    
    startNSDRSession(script: {text:string, delay:number}[], lang: Language, onLineStart: (txt: string) => void) {
        this.stop();
        this.init();
        
        // 1. Layer: Theta Waves (4Hz) - Trance state
        this.playBinaural(150, 4, 0.15);

        // 2. Layer: Pink Noise (Breath/Water texture) - Low volume
        this.playNoise('pink', 0.05);

        // 3. Layer: Voice
        this.processScriptQueue(script, 0, lang, onLineStart);
    }

    processScriptQueue(script: {text:string, delay:number}[], index: number, lang: Language, onLineStart: (txt: string) => void) {
        if (!window.speechSynthesis) return;
        if (index >= script.length) {
            // Loop or End? Let's just keep the ambient sound running.
            return;
        }

        const line = script[index];
        onLineStart(line.text);

        const utterance = new SpeechSynthesisUtterance(line.text);
        utterance.lang = lang === 'pt' ? 'pt-BR' : 'en-US';
        
        // Voice Optimization
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes(lang === 'pt' ? 'pt' : 'en') && (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Natural')));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.rate = 0.85; // Slower for hypnosis
        utterance.pitch = 0.9; // Slightly deeper, more soothing
        utterance.volume = 1;

        utterance.onend = () => {
            this.currentTimeout = setTimeout(() => {
                this.processScriptQueue(script, index + 1, lang, onLineStart);
            }, line.delay);
        };

        window.speechSynthesis.speak(utterance);
    }
}

const engine = new NeuroSonicEngine();

export const MindReprogramming: React.FC<MindReprogrammingProps> = ({ lang }) => {
  const t = CONTENT[lang].mind;
  const isPt = lang === 'pt';

  const [activeTab, setActiveTab] = useState<Category>('guided');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isSessionMode, setIsSessionMode] = useState(false);
  const [currentAffirmation, setCurrentAffirmation] = useState("");
  const [subliminalWord, setSubliminalWord] = useState("");

  const playlist = GET_PLAYLIST(lang);
  const activeTrack = playlist.find(t => t.id === playingTrackId);

  // Subliminal Visual Loop
  useEffect(() => {
    if (!isSessionMode) return;
    const words = lang === 'pt' ? SUBLIMINALS_PT : SUBLIMINALS_EN;
    const interval = setInterval(() => {
        setSubliminalWord(words[Math.floor(Math.random() * words.length)]);
    }, 4000); // Change every 4s
    return () => clearInterval(interval);
  }, [isSessionMode, lang]);

  // Cleanup
  useEffect(() => {
    return () => engine.stop();
  }, []);

  const handlePlay = (track: AudioTrack) => {
    if (playingTrackId === track.id) {
        engine.stop();
        setPlayingTrackId(null);
        setIsSessionMode(false);
        return;
    }

    setPlayingTrackId(track.id);
    engine.setVolume(volume);

    if (track.params.type === 'sine' && track.params.freq) {
        engine.playSine(track.params.freq);
    } else if (track.params.type === 'binaural' && track.params.base && track.params.beat) {
        engine.playBinaural(track.params.base, track.params.beat);
    } else if (track.params.type === 'noise' && track.params.noiseColor) {
        engine.playNoise(track.params.noiseColor);
    } else if (track.params.type === 'guided_session') {
        setIsSessionMode(true);
        const script = lang === 'pt' ? NSDR_SCRIPT_PT : NSDR_SCRIPT_EN;
        engine.startNSDRSession(script, lang, (txt) => setCurrentAffirmation(txt));
    }
  };

  const closeSession = () => {
      engine.stop();
      setPlayingTrackId(null);
      setIsSessionMode(false);
  }

  const handleVolume = (val: number) => {
      setVolume(val);
      engine.setVolume(val);
  };

  const filteredTracks = playlist.filter(t => t.category === activeTab);

  // --- IMMERSIVE SESSION MODE RENDER ---
  if (isSessionMode) {
      return (
          <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-1000">
              
              {/* SUBLIMINAL LAYER (Background) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 select-none">
                  <h1 className="text-[15vw] font-black text-white animate-pulse duration-[8000ms] blur-sm">
                      {subliminalWord}
                  </h1>
              </div>

              {/* AMBIENT PARTICLES (CSS) */}
              <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s' }}></div>
                  <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>
              </div>

              {/* MAIN CONTENT */}
              <div className="relative z-10 max-w-2xl w-full px-8 text-center space-y-12">
                  
                  {/* Breathing Visualizer */}
                  <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 bg-white/5 rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
                      <div className="absolute inset-4 bg-white/10 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
                      <div className="relative w-48 h-48 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)]">
                           <Brain className="w-20 h-20 text-white/80" />
                      </div>
                  </div>

                  {/* Dynamic Text */}
                  <div className="h-32 flex items-center justify-center">
                      <p className="text-2xl md:text-3xl text-white font-medium leading-relaxed animate-in slide-in-from-bottom-4 fade-in duration-700 key={currentAffirmation}">
                          "{currentAffirmation}"
                      </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-8">
                       <button onClick={closeSession} className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-md border border-white/10">
                           <X className="w-6 h-6" />
                       </button>
                       <div className="w-48 bg-white/10 rounded-full h-1.5 backdrop-blur-md">
                           <div className="bg-white/50 h-full rounded-full w-1/3 animate-[pulse_3s_infinite]"></div>
                       </div>
                       <div className="p-4 rounded-full text-white/50 cursor-default">
                           <Headphones className="w-6 h-6 animate-bounce" style={{ animationDuration: '3s' }} />
                       </div>
                  </div>
                  
                  <p className="text-white/30 text-sm">
                      {t.player.breathe}
                  </p>
              </div>
          </div>
      );
  }

  // --- STANDARD DASHBOARD RENDER ---
  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-32">
        
        {/* HERO SECTION */}
        <div className="relative rounded-3xl overflow-hidden bg-lab-900 text-white p-8 md:p-12 shadow-2xl">
            <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-1000 ease-in-out opacity-40 ${activeTrack ? `${activeTrack.colorFrom} ${activeTrack.colorTo}` : 'from-gray-800 to-black'}`}></div>
            {activeTrack && (
                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                     <div className="w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
                </div>
            )}
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-lab-300">
                        <Activity className="w-5 h-5" />
                        <span className="uppercase tracking-widest text-xs font-bold">{t.engine}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        {activeTrack ? activeTrack.title : t.title}
                    </h1>
                    <p className="text-lg text-lab-200 max-w-xl">
                        {activeTrack ? activeTrack.desc : t.subtitle}
                    </p>
                </div>
            </div>
        </div>

        {/* TABS & GRID */}
        <div>
            <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
                {[
                    { id: 'guided', label: t.categories.guided, icon: Moon },
                    { id: 'solfeggio', label: t.categories.solfeggio, icon: Sparkles },
                    { id: 'brainwaves', label: t.categories.brainwaves, icon: Activity },
                    { id: 'noise', label: t.categories.noise, icon: Wind },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Category)}
                        className={`flex items-center px-6 py-3 rounded-full text-sm font-bold transition-all transform hover:-translate-y-0.5 ${
                            activeTab === tab.id 
                            ? 'bg-lab-900 text-white shadow-lg shadow-lab-200' 
                            : 'bg-white text-lab-600 border border-lab-200 hover:bg-lab-50'
                        }`}
                    >
                        <tab.icon className="w-4 h-4 mr-2" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTracks.map(track => {
                    const isPlaying = playingTrackId === track.id;
                    return (
                        <button
                            key={track.id}
                            onClick={() => handlePlay(track)}
                            className={`relative overflow-hidden group p-6 rounded-2xl border text-left transition-all duration-300 ${
                                isPlaying 
                                ? 'border-primary-500 ring-2 ring-primary-100 bg-white shadow-xl scale-[1.02]' 
                                : 'border-lab-200 bg-white hover:border-lab-300 hover:shadow-md'
                            }`}
                        >
                            <div className={`h-28 -mx-6 -mt-6 mb-4 bg-gradient-to-br ${track.colorFrom} ${track.colorTo} opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center relative overflow-hidden`}>
                                {/* Wave Animation for playing track */}
                                {isPlaying && (
                                    <div className="absolute inset-0 opacity-20">
                                         <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse"></div>
                                    </div>
                                )}
                                
                                {isPlaying ? (
                                    <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                                        <Pause className="w-8 h-8 text-white drop-shadow-lg" />
                                    </div>
                                ) : (
                                    <Play className="w-8 h-8 text-white drop-shadow-lg opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                )}
                            </div>

                            <h3 className="font-bold text-lab-900 mb-1">{track.title}</h3>
                            <p className="text-xs text-lab-500 leading-relaxed min-h-[40px]">{track.desc}</p>
                            
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-lab-100 text-lab-600 px-2 py-1 rounded border border-lab-200">
                                    {track.params.type === 'guided_session' ? t.immersive : track.params.type.toUpperCase()}
                                </span>
                                {isPlaying && (
                                     <div className="flex gap-0.5 h-3 items-end">
                                        <div className="w-1 bg-primary-500 animate-[bounce_1s_infinite] h-full"></div>
                                        <div className="w-1 bg-primary-500 animate-[bounce_1.2s_infinite] h-2/3"></div>
                                        <div className="w-1 bg-primary-500 animate-[bounce_0.8s_infinite] h-1/2"></div>
                                     </div>
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>

        {/* EDUCATIONAL SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-3xl p-8 border border-lab-200 shadow-sm">
             <div>
                <h2 className="text-2xl font-bold text-lab-900 mb-6 flex items-center gap-2">
                    <Info className="w-6 h-6 text-primary-600" />
                    {t.howTo.title}
                </h2>
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="bg-blue-100 p-3 rounded-xl h-fit"><Clock className="w-6 h-6 text-blue-700" /></div>
                        <div>
                            <h3 className="font-bold text-lab-900 mb-1">{t.howTo.consistencyTitle}</h3>
                            <p className="text-sm text-lab-600 leading-relaxed">
                                {t.howTo.consistencyDesc}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-purple-100 p-3 rounded-xl h-fit"><Headphones className="w-6 h-6 text-purple-700" /></div>
                        <div>
                            <h3 className="font-bold text-lab-900 mb-1">{t.howTo.headphonesTitle}</h3>
                            <p className="text-sm text-lab-600 leading-relaxed">
                                {t.howTo.headphonesDesc}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-green-100 p-3 rounded-xl h-fit"><ShieldCheck className="w-6 h-6 text-green-700" /></div>
                        <div>
                            <h3 className="font-bold text-lab-900 mb-1">{t.howTo.safetyTitle}</h3>
                            <p className="text-sm text-lab-600 leading-relaxed">
                                {t.howTo.safetyDesc}
                            </p>
                        </div>
                    </div>
                </div>
             </div>
             
             <div className="bg-lab-50 rounded-2xl p-6 border border-lab-100">
                 <h3 className="font-bold text-lab-800 mb-4 uppercase text-xs tracking-wider">
                     {t.guide.title}
                 </h3>
                 <div className="space-y-3 text-sm">
                     <div className="flex justify-between border-b border-lab-200 pb-2">
                         <span className="font-mono font-bold text-lab-600">40 Hz (Gamma)</span>
                         <span className="text-lab-800 text-right">{t.guide.gamma}</span>
                     </div>
                     <div className="flex justify-between border-b border-lab-200 pb-2">
                         <span className="font-mono font-bold text-lab-600">14-30 Hz (Beta)</span>
                         <span className="text-lab-800 text-right">{t.guide.beta}</span>
                     </div>
                     <div className="flex justify-between border-b border-lab-200 pb-2">
                         <span className="font-mono font-bold text-lab-600">8-14 Hz (Alpha)</span>
                         <span className="text-lab-800 text-right">{t.guide.alpha}</span>
                     </div>
                     <div className="flex justify-between border-b border-lab-200 pb-2">
                         <span className="font-mono font-bold text-lab-600">4-8 Hz (Theta)</span>
                         <span className="text-lab-800 text-right">{t.guide.theta}</span>
                     </div>
                     <div className="flex justify-between pb-2">
                         <span className="font-mono font-bold text-lab-600">0.5-4 Hz (Delta)</span>
                         <span className="text-lab-800 text-right">{t.guide.delta}</span>
                     </div>
                 </div>

                 <div className="mt-6 p-4 bg-white rounded-xl border border-lab-200 text-xs text-lab-500 italic">
                     "{t.guide.quote}" 
                     <br/>— Albert Einstein (Attributed)
                 </div>
             </div>
        </div>

        {/* STICKY PLAYER FOOTER */}
        {activeTrack && playingTrackId && !isSessionMode && (
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-lab-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-4 z-50 animate-in slide-in-from-bottom-full duration-500">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${activeTrack.colorFrom} ${activeTrack.colorTo} text-white shadow-lg`}>
                            <Activity className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <div className="font-bold text-lab-900">{activeTrack.title}</div>
                            <div className="text-xs text-lab-500 font-medium">{activeTrack.category.toUpperCase()} • {t.generating}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => { engine.stop(); setPlayingTrackId(null); }}
                            className="w-12 h-12 bg-lab-900 text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
                        >
                            <Pause className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="hidden md:flex items-center gap-3 w-48">
                        <Volume2 className="w-4 h-4 text-lab-400" />
                        <input 
                            type="range" 
                            min="0" max="1" step="0.01" 
                            value={volume} 
                            onChange={(e) => handleVolume(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-lab-200 rounded-lg appearance-none cursor-pointer accent-lab-900" 
                        />
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
