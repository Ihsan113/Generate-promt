import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Copy, Zap, Film, Image as ImageIcon, 
  CheckCircle2, Clock, Volume2, VolumeX, 
  AlertTriangle, Maximize2, ShieldCheck, Check, Layers, Ban,
  Settings, X, Cpu
} from 'lucide-react';

const App = () => {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  
  // Settings State (Hanya Groq)
  const [showSettings, setShowSettings] = useState(false);
  const [groqApiKey, setGroqApiKey] = useState('');
  
  // Generation Params
  const [mode, setMode] = useState('video'); // 'video' or 'photo'
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState(15); 
  const [includeAudio, setIncludeAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef(null);
  const resultRef = useRef(null);

  // API Configuration
  const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

  const ratios = [
    { label: 'Cinematic', value: '16:9' },
    { label: 'Vertical', value: '9:16' },
    { label: 'Portrait', value: '4:5' },
  ];

  // Load Settings from LocalStorage
  useEffect(() => {
    const savedGroqKey = localStorage.getItem('stocklens_groq_key');
    if (savedGroqKey) {
      setGroqApiKey(savedGroqKey);
    } else {
      // Tampilkan settings jika belum ada key sama sekali
      setShowSettings(true);
    }
  }, []);

  // Save Settings
  const handleSaveSettings = () => {
    localStorage.setItem('stocklens_groq_key', groqApiKey);
    setShowSettings(false);
  };

  // Efek Loading "Thinking Process" Cyberpunk
  useEffect(() => {
    if (loading) {
      const steps = [
        "Initializing Llama 4 Scout Core...",
        "Scanning for Technical Artifacts...",
        "Preventing Morphing & Physics Glitches...",
        mode === 'video' ? `Mapping ${duration}s Shot Timeline...` : "Calculating Lens Physics...",
        "Injecting ProRes 4444 XQ Codec...",
        "Finalizing Masterpiece Prompt..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingStep(steps[i % steps.length]);
        i++;
      }, 800);
      return () => clearInterval(interval);
    }
  }, [loading, mode, duration]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 10MB limit (Groq Llama 4 supports up to 20MB, but 10MB is safer for base64 payload)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size too big (Max 10MB).");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        const base64Data = reader.result.split(',')[1];
        setImageBase64(base64Data);
        setError('');
        setResult('');
        setCopied(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePrompt = async () => {
    if (!imageBase64) {
      setError("Please upload a reference image first.");
      return;
    }

    if (!groqApiKey) {
      setError("Groq API Key is required. Please set it in Settings (⚙️).");
      setShowSettings(true);
      return;
    }

    setLoading(true);
    setError('');
    setResult('');
    setCopied(false);

    // --- PROTOCOL & LOGIC ASSEMBLY (SUTRADARA / DoP) ---
    const artifactShield = `NO ARTIFACTS OR GLITCHES: moiré pattern, noise, grain, flicker, rolling shutter, jello effect, lens flare, vignetting, blocky, pixelation, macroblocking, stuttering, judder, ring effect, gibbs phenomenon, color banding, drop frame, freeze, interlacing artifacts, dust, spots, chromatic aberration, fringing, morphing, mutating, extra limbs, bad anatomy, warped perspective, physics violation, unnatural movement, floating objects.`;

    const qualityTags = mode === 'video' 
      ? `Tech Specs: 8k resolution, highly detailed, photorealistic, uncompressed RAW, high bitrate, ProRes 4444 XQ, 16-bit color depth, smooth color gradients, crystal clear, zero noise, ${duration}s duration, cinematic B-roll, 60fps. ${artifactShield}`
      : `Tech Specs: 150MP Phase One IQ4, 16-bit TIFF, ISO 50, uncompressed RAW, sharp focus, hyper-detailed, photorealistic, 8k resolution, professional color grading. ${artifactShield}`;

    const audioInstruction = (mode === 'video' && includeAudio)
      ? `AUDIO REQUIREMENT: REQUIRED. You MUST add a section at the end: "Audio: [Specific SFX], [Music Mood]".`
      : `AUDIO REQUIREMENT: FORBIDDEN. Do NOT mention audio, music, or sound effects.`;

    const specificLogic = mode === 'video'
      ? `
        MODE: VIDEO (CINEMATIC FOOTAGE)
        TARGET DURATION: ${duration} Seconds.
        CRITICAL TASK (CHRONOLOGICAL PACING):
        You MUST design the camera movement chronologically based on the ${duration}s duration to ensure smooth, professional pacing. 
        Do not just say "move the camera". Detail the pacing like a real Director of Photography.
        
        Examples of pacing for ${duration}s:
        - "0s-${Math.floor(duration/3)}s: Starts with a smooth, slow push-in establishing the subject. ${Math.floor(duration/3)}s-${Math.floor(duration*0.8)}s: Transitions into a subtle orbit (parallax effect) revealing the background depth. ${Math.floor(duration*0.8)}s-${duration}s: Gentle ease-out holding focus on the main subject."
        - "Slow motion tracking shot maintaining a perfectly stable frame throughout the entire ${duration} seconds, easing into a rack focus at the very end."
        
        RULES:
        1. Ensure the movement complexity perfectly matches the ${duration}s length (do not rush a 5s shot, do not make a 60s shot too static).
        2. Describe the motion in English using pro terms: Ease-in, Speed Ramp, Pedestal, Dolly, Parallax, Rack Focus, Tracking.
        3. Make sure the subject acts naturally (No sudden, impossible, or glitchy movements).
        `
      : `
        MODE: PHOTOGRAPHY (HIGH-END)
        TASK:
        1. Determine the BEST lens focal length (e.g., 85mm for portraits, 16mm for landscapes, 100mm Macro for details).
        2. Describe the Depth of Field (Bokeh vs Deep Focus).
        3. Describe the Shutter Speed effect (Frozen vs Motion Blur).
        `;

    const systemInstruction = `
      You are a Senior AI Director of Photography & Prompt Engineer for High-End Commercials.
      
      GLOBAL INSTRUCTION:
      1. Analyze the input image perfectly.
      2. Generate a PREMIUM STOCK PROMPT in **ENGLISH ONLY**.
      3. Focus ONLY on Visual Description, Chronological Action/Camera Pacing, Lighting, and Mood.
      4. DO NOT write technical specs (8k, ProRes, etc) inside your generation, because the system will inject them automatically at the end.
      
      ${audioInstruction}
      ${specificLogic}

      STRICT OUTPUT FORMAT:
      [Detailed Subject Description] + [Chronological Camera Movement & Pacing / Lens Choice] + [Environment & Cinematic Lighting] + [Mood]
      ${mode === 'video' && includeAudio ? '+ [Audio Recommendation]' : ''}
    `;

    try {
      // --- ENGINE: GROQ (LLAMA 4 SCOUT) ---
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                { role: 'system', content: systemInstruction },
                { 
                  role: 'user', 
                  content: [
                    { type: "text", text: "Analyze this image and create the professional prompt based on the system instructions." },
                    { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
                  ] 
                }
            ],
            temperature: 0.2, // Rendah agar output stabil dan teknis
            max_tokens: 1024
        })
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error?.message || "Groq API Error");
      
      let aiGeneratedText = data.choices?.[0]?.message?.content?.trim();

      // --- POST PROCESSING ---
      if (aiGeneratedText) {
        // Membersihkan tag bawaan jika AI tidak sengaja menuliskannya
        aiGeneratedText = aiGeneratedText
          .replace(/--ar \d+:\d+/g, '')
          .replace(/--video/g, '')
          .replace(/--v \d+\.\d+/g, '')
          .replace(/Tech Specs:/gi, '')
          .replace(/NO ARTIFACTS.*/gi, ''); 
        
        // Merakit hasil akhir (Teks AI + Standar Kualitas + Parameter Aspect Ratio)
        const finalAssembly = `${aiGeneratedText.trim()} ${qualityTags} --ar ${aspectRatio} ${mode === 'video' ? '--video' : '--v 6.0'}`;
        
        setResult(finalAssembly);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      } else {
        throw new Error("Analysis failed. No response from Llama 4 Scout.");
      }

    } catch (err) {
      setError(err.message || "Connection error. Check your API Key or Network.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const doCopy = (text) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) { setError("Manual copy failed."); }
      document.body.removeChild(textArea);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(result)
        .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
        .catch(() => doCopy(result));
    } else { doCopy(result); }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-mono selection:bg-orange-500 selection:text-black relative">
      
      {/* --- SETTINGS MODAL --- */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f1115] border border-orange-500/30 p-6 rounded-2xl w-[90%] max-w-sm shadow-[0_0_50px_rgba(249,115,22,0.1)] relative">
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-2 mb-2 text-orange-500">
              <Settings size={20} />
              <h2 className="text-lg font-bold uppercase tracking-widest">Engine Config</h2>
            </div>
            
            <p className="text-xs text-zinc-400 mb-6">
              Powered by <strong className="text-orange-400">Llama 4 Scout 17B</strong> via Groq.
            </p>

            <div className="space-y-4">
              {/* API Key Input */}
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Groq API Key</label>
                <input 
                  type="password"
                  value={groqApiKey}
                  onChange={(e) => setGroqApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-white focus:border-orange-500 focus:outline-none placeholder-zinc-700 font-sans"
                />
                <p className="text-[9px] text-zinc-500 mt-2">
                  Model active: <span className="text-orange-400/70">meta-llama/llama-4-scout-17b-16e-instruct</span>
                </p>
              </div>

              <button 
                onClick={handleSaveSettings}
                disabled={!groqApiKey}
                className="w-full bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-500 hover:bg-orange-500 text-white font-bold py-3 rounded-lg mt-2 flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <Check size={16} /> Save Key & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN APP --- */}
      <div className="max-w-md mx-auto min-h-screen flex flex-col bg-[#050505] shadow-2xl relative overflow-hidden border-x border-zinc-900">
        
        {/* Header Cyberpunk */}
        <div className="px-6 pt-10 pb-6 bg-gradient-to-b from-[#0a1015] to-transparent z-10 relative">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 via-red-600 to-purple-600" />
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black tracking-tighter italic text-white">
                STOCK<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">LENS</span>
                <span className="text-[10px] align-top ml-1 text-zinc-500">PRO</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-2">
                <Ban size={12} className="text-red-500" />
                <p className="text-[9px] text-red-500 font-bold tracking-widest uppercase">
                  Llama Scout | Anti-Morph
                </p>
              </div>
            </div>

            <div className="flex gap-2">
               {/* Settings Btn */}
               <button 
                onClick={() => setShowSettings(true)}
                className="h-10 w-10 bg-[#0a0a0a] rounded-lg flex items-center justify-center border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-900 transition-all text-zinc-400 hover:text-orange-400"
               >
                 <Settings size={18} />
               </button>
               
               <div className="h-10 w-10 bg-[#0a0a0a] rounded-lg flex items-center justify-center border border-zinc-800 shadow-[0_0_15px_rgba(249,115,22,0.15)] relative">
                <Cpu size={20} className="text-orange-500" />
                <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-black ${groqApiKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
               </div>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex bg-zinc-900/60 p-1 rounded-lg border border-zinc-800 backdrop-blur-md">
            <button 
              onClick={() => setMode('video')} 
              className={`flex-1 py-3 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all 
              ${mode === 'video' ? 'bg-orange-900/30 text-orange-400 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              <Film size={14} /> Video
            </button>
            <button 
              onClick={() => setMode('photo')} 
              className={`flex-1 py-3 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all 
              ${mode === 'photo' ? 'bg-purple-900/30 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              <ImageIcon size={14} /> Photo
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 flex flex-col gap-5 pb-8 relative z-10">

          {/* Upload Area */}
          <div className="relative group">
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
            <div onClick={() => fileInputRef.current.click()} className={`relative w-full aspect-video rounded-lg border transition-all cursor-pointer overflow-hidden ${image ? 'border-orange-500/50 bg-zinc-900' : 'border-zinc-800 bg-zinc-900/30 border-dashed hover:border-zinc-600'}`}>
              {image ? (
                <>
                  <img src={image} alt="Preview" className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-all duration-500" />
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-orange-500/10 backdrop-blur-md rounded border border-orange-500/30">
                     <span className="text-[9px] font-bold text-orange-400">ANALYZING SOURCE</span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
                  <Upload size={24} className="mb-2 group-hover:text-orange-500 transition-colors" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Upload Reference</span>
                </div>
              )}
            </div>
          </div>

          {/* Settings Grid */}
          <div className="space-y-3">
             {/* Aspect Ratio */}
             <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/50">
                <div className="flex items-center gap-2 mb-2 text-zinc-500">
                   <Maximize2 size={12} />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Ratio</span>
                </div>
                <div className="flex gap-2">
                   {ratios.map(r => (
                     <button key={r.value} onClick={() => setAspectRatio(r.value)} className={`flex-1 py-2 rounded text-[10px] font-bold border transition-all ${aspectRatio === r.value ? 'bg-zinc-800 border-zinc-600 text-white' : 'border-transparent text-zinc-600 hover:bg-zinc-800'}`}>
                       {r.label}
                     </button>
                   ))}
                </div>
             </div>

             {/* Video Controls */}
             {mode === 'video' && (
               <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                  {/* Duration */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <div className="flex items-center gap-2 text-zinc-500">
                          <Clock size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Timeline Duration</span>
                       </div>
                       <span className="text-[10px] font-bold text-orange-400">{duration} Sec</span>
                    </div>
                    <input type="range" min="1" max="60" step="1" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                  </div>

                  {/* Audio Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                     <div className="flex items-center gap-2 text-zinc-500">
                        {includeAudio ? <Volume2 size={12} className="text-orange-400" /> : <VolumeX size={12} />}
                        <span className="text-[10px] font-bold uppercase tracking-widest">Audio Generator</span>
                     </div>
                     <button onClick={() => setIncludeAudio(!includeAudio)} className={`w-10 h-5 rounded-full relative transition-colors ${includeAudio ? 'bg-orange-600' : 'bg-zinc-700'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${includeAudio ? 'left-6' : 'left-1'}`} />
                     </button>
                  </div>
               </div>
             )}
          </div>

          {/* Generate Button */}
          <button onClick={generatePrompt} disabled={loading || !image} className={`w-full py-4 rounded-lg font-black text-xs uppercase tracking-widest transition-all shadow-xl group relative overflow-hidden ${loading || !image ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800' : 'bg-gradient-to-r from-orange-600 to-red-600 text-white border border-orange-500/50 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]'}`}>
            <div className="flex items-center justify-center gap-3 relative z-10">
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{loadingStep}</span>
                </>
              ) : (
                <>
                  <Zap size={16} className="fill-current" />
                  <span>Generate Masterpiece</span>
                </>
              )}
            </div>
          </button>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-2 text-red-400 text-[10px] text-left">
              <AlertTriangle size={16} className="shrink-0" /> <span className="flex-1">{error}</span>
            </div>
          )}

          {/* Result */}
          {result && (
            <div ref={resultRef} className="animate-in slide-in-from-bottom-10 fade-in duration-500 pb-6">
               <div className="flex items-center justify-between mb-2 pl-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-orange-500" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Llama Scout Output
                    </span>
                  </div>
                  <span className="text-[9px] font-bold bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded border border-zinc-800">ENGLISH</span>
               </div>
               
               <div className="bg-[#080808] rounded-lg border border-zinc-800 p-4 relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-red-600" />
                 <p className="text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap break-words">{result}</p>
                 
                 <div className="mt-4 pt-3 border-t border-zinc-900 flex gap-2">
                    <button onClick={copyToClipboard} className={`flex-1 py-3 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${copied ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-zinc-200'}`}>
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy Prompt'}
                    </button>
                 </div>
               </div>

               {/* Tech Specs Indicator */}
               <div className="mt-3 grid grid-cols-2 gap-2 opacity-70">
                  <div className="flex items-center gap-2 bg-zinc-900/50 px-2 py-1.5 rounded border border-zinc-800">
                    <Layers size={10} className="text-orange-500" />
                    <span className="text-[9px] text-zinc-400">
                      {mode === 'video' ? 'Timeline Paced' : '150MP Phase One'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-900/50 px-2 py-1.5 rounded border border-zinc-800">
                    <ShieldCheck size={10} className="text-orange-500" />
                    <span className="text-[9px] text-zinc-400">
                      Anti-Morph Active
                    </span>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;