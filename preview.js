'use strict';
const PV_PRESETS={"groq": {"label": "Groq", "baseUrl": "https://api.groq.com/openai/v1", "model": "llama-3.3-70b-versatile", "keyUrl": "https://console.groq.com/keys", "steps": "Sign in at console.groq.com, open API Keys, Create API Key, copy it once."}, "openrouter": {"label": "OpenRouter", "baseUrl": "https://openrouter.ai/api/v1", "model": "meta-llama/llama-3.3-70b-instruct", "keyUrl": "https://openrouter.ai/settings/keys", "steps": "Sign in at openrouter.ai, open Settings → Keys, Create Key. Many models are paid per token; some are marked free."}, "gemini": {"label": "Google Gemini", "baseUrl": "https://generativelanguage.googleapis.com/v1beta/openai", "model": "gemini-2.5-flash", "keyUrl": "https://aistudio.google.com/apikey", "steps": "Sign in to Google AI Studio, click Get API key → Create API key. This uses Gemini’s OpenAI-compatible endpoint."}, "mistral": {"label": "Mistral", "baseUrl": "https://api.mistral.ai/v1", "model": "mistral-small-latest", "keyUrl": "https://console.mistral.ai/api-keys", "steps": "Sign in at console.mistral.ai, open API Keys, Create new key."}, "custom": {"label": "Custom", "baseUrl": "", "model": "", "keyUrl": "", "steps": "Any service with an OpenAI-compatible /chat/completions endpoint. Check its docs for the base URL and model names."}};const PV_BILL='Third-party AI usage may be billed by that provider under your account. Bacon AI never switches to it on its own; you choose it in Brain Mode.';
/* Bacon AI preview mode: an in-memory mock of the controller API.
   Runs fully in the browser with sample data. It never performs network requests. */
(function(){
const now=()=>Date.now()/1000;const hex=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
const clone=v=>JSON.parse(JSON.stringify(v));
const GREETING_BOT={id:'my-ai',name:'My AI',description:'Bacon AI · your coding partner, chatbot, or personal AI assistant.',instructions:'',personality:'Friendly, upbeat Bacon AI by Diab Productions.',mode:'coding',emoji:'⚡',icon:null,cloudTarget:60,projectSettings:{}};
function fresh(){
  const project={id:hex(),name:'Sample calculator',kind:'python',botId:'my-ai',created:Date.now()};
  const s={bots:[clone(GREETING_BOT)],projects:[project],jobs:[],files:{},checkpoints:{},localOnly:false,remaining:82,calls:2,limit:12,paused:false,emergency:false,reason:'',generation:0,routing:0,brain:{brainMode:'hybrid',power:'balanced',localModel:'qwen2.5-coder:7b',cloudModel:'',cloudProvider:'codex'},providers:[{id:'p_000000000fa4',name:'Fake AI (sample)',baseUrl:'https://fake-ai.example/v1',model:'fake-coder-1',preset:'custom',hasKey:true}],installed:['qwen2.5-coder:7b','llama3.1:8b'],pulls:{},accounts:[{id:hex(),email:'sara@example.com',name:'Sara (sample)',role:'user',status:'pending',created:now(),cloudBudget:null,age:null,adult:false,swearing:false,devices:1,tailnet:[]},{id:hex(),email:'omar@example.com',name:'Omar (sample)',role:'user',status:'active',created:now(),cloudBudget:5,age:11,adult:false,swearing:false,devices:2,tailnet:['ts-user:omar@example.com']}],bans:{devices:0,tailnet:[]}};
  s.files[project.id]={'calc.py':'def add(a, b):\n    return a + b\n'};s.checkpoints[project.id]=[];return s;
}
const POWER={light:{label:'Light',budgetFactor:0.4,reasoningEffort:'low',parallel:false},balanced:{label:'Balanced',budgetFactor:0.75,reasoningEffort:'medium',parallel:true},max:{label:'Max',budgetFactor:1,reasoningEffort:'high',parallel:true}};
const CATALOG=[['qwen2.5-coder:1.5b',1.5,1.0,'Very fast, basic coding help'],['qwen2.5-coder:3b',2.5,1.9,'Fast, light coding'],['qwen2.5-coder:7b',6,4.7,'Recommended for 8 GB GPUs (e.g. RTX 5060 laptop)',true],['llama3.1:8b',6.5,4.9,'Strong general chat'],['qwen2.5-coder:14b',10,9,'Heavier; spills to system RAM on 8 GB, slower'],['deepseek-coder-v2:16b',10.5,8.9,'Heavier MoE coder; partial CPU offload on 8 GB']].map(([name,vramGB,sizeGB,note,recommended])=>({name,vramGB,sizeGB,note,recommended:!!recommended}));
function effective(b){const o=b.brain||{};return {mode:S.localOnly?'local':(o.brainMode||S.brain.brainMode),power:o.power||S.brain.power,powerProfile:POWER[o.power||S.brain.power],localModel:S.brain.localModel,cloudModel:S.brain.cloudModel,cloudProvider:S.brain.cloudProvider,cloudTarget:b.cloudTarget,overridden:!!b.brain};}
function brainStatus(){const bots={};for(const b of S.bots)bots[b.id]=effective(b);return {global:clone(S.brain),modes:{hybrid:'Hybrid',cloud:'ChatGPT only',local:'PC only',other:'Other AI'},providers:S.providers.map(p=>({id:p.id,name:p.name,model:p.model})),billingNote:PV_BILL,power:POWER,presets:[10,40,60,90],vramGB:8,note:'The cloud/local split is a routing target, not a guaranteed token or compute split.',bots};}
function modelsStatus(){const inst=new Set(S.installed);return {installed:S.installed.map(n=>({name:n,sizeGB:(CATALOG.find(c=>c.name===n)||{}).sizeGB||1})),catalog:CATALOG.map(c=>({...c,installed:inst.has(c.name),fits:c.vramGB<=8})),active:S.brain.localModel,vramGB:8,ollamaError:null,pulls:clone(S.pulls),cloudModels:{active:S.brain.cloudModel,note:'Preview: sample list. Blank = Codex default.'}};}
function simulatePull(name){let pct=0;const tick=()=>{pct=Math.min(100,pct+20);S.pulls[name]={state:pct<100?'pulling':'done',status:pct<100?'downloading (simulated)':'success (simulated)',percent:pct};if(pct<100)later(500,tick);else S.installed.push(name);};later(300,tick);}
let S=fresh();
function err(status,message){const e=new Error(message);e.status=status;throw e;}
function bot(id){return S.bots.find(b=>b.id===(id||'my-ai'))||err(400,'Bot not found.');}
function project(id){return S.projects.find(p=>p.id===id)||err(400,'Project not found.');}
function job(id){return S.jobs.find(j=>j.id===id)||err(404,'Build not found');}
function level(r){return r==null?'unknown':r<=10?'red':r<=25?'orange':r<=50?'yellow':'green';}
function threshold(r){return [5,10,25,50,75].find(t=>r!=null&&r<=t)??null;}
function cloudMode(){if(S.localOnly)return {localOnly:true,chosen:true,reason:'Local only (your choice). Total performance may be lower.'};if(S.remaining<=0)return {localOnly:true,reason:'ChatGPT/Codex allowance exhausted (sample)'};if(S.calls>=S.limit)return {localOnly:true,reason:'App daily cloud call budget used'};return {localOnly:false,reason:'Cloud available'};}
function center(){const t=performance.now()/1000;const left=Math.max(0,100-S.calls*100/S.limit);
  return {preview:true,host:{kind:'laptop',name:'Preview PC (sample)'},controls:{paused:S.paused,emergency:S.emergency,reason:S.reason,generation:S.generation},
  hardware:{cpuPercent:30+Math.round(12*Math.sin(t/3)),ramPercent:46,gpuPercent:41+Math.round(10*Math.cos(t/4)),cpuTempC:58,gpuTempC:63,sampledAt:now()},safety:'normal',
  allowance:{source:'sample data (preview, not a real report)',available:true,windows:[{bucket:'codex',window:'primary',remainingPercent:S.remaining,resetsAt:now()+3*3600+1200}],remainingPercent:S.remaining,warningThreshold:threshold(S.remaining),warningLevel:level(S.remaining),exhausted:S.remaining<=0,estimated:false},
  requestBudget:{used:S.calls,limit:S.limit,label:'App call budget, not ChatGPT allowance',remainingPercent:left,warningThreshold:threshold(left),warningLevel:level(left),exhausted:S.calls>=S.limit},
  cloudMode:(()=>{const m=cloudMode();m.brainMode=S.brain.brainMode;m.cloudBlocked=m.localOnly&&!m.chosen&&S.brain.brainMode==='cloud';return m;})(),brain:brainStatus(),observedCalls:{local:0,cloud:S.calls},cloudTarget:60};}
function update(j,fields){Object.assign(j,fields);}
function later(ms,fn){setTimeout(()=>{try{fn();}catch(e){}},ms);}
function sampleCode(prompt){const p=prompt.toLowerCase();
  if(/js|javascript|web|html/.test(p))return ['JavaScript','```javascript\nexport function debounce(fn, wait = 200) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), wait);\n  };\n}\n```'];
  if(/roblox|lua/.test(p))return ['Luau','```lua\nlocal Players = game:GetService("Players")\n\nPlayers.PlayerAdded:Connect(function(player)\n  local stats = Instance.new("Folder")\n  stats.Name = "leaderstats"\n  stats.Parent = player\nend)\n```'];
  return ['Python','```python\ndef fizzbuzz(n: int) -> list[str]:\n    """Return FizzBuzz values from 1 to n."""\n    out = []\n    for i in range(1, n + 1):\n        out.append("FizzBuzz" if i % 15 == 0 else "Fizz" if i % 3 == 0 else "Buzz" if i % 5 == 0 else str(i))\n    return out\n```'];}
function chatReply(prompt){const [lang,code]=sampleCode(prompt);
  return `This is a **preview** reply with sample data, not real AI. Here is how a ${lang} answer looks, with highlighting and a Copy button:\n\n${code}\n\nConnect your PC to get real answers from Ollama + ChatGPT.`;}
function checkpoint(pid,reason){const c={id:hex(),created:now(),reason,files:clone(S.files[pid])};S.checkpoints[pid].push(c);return c.id;}
function runCoding(j){const pid=j.projectId;const ev=t=>{j.events=[...j.events,t];};
  update(j,{state:'running'});ev('Step 1: planning and generating changes.');const e=effective(bot(j.botId));ev(e.mode==='hybrid'?`Hybrid · routing target ${e.cloudTarget}% cloud · ${POWER[e.power].label} power.`:e.mode==='cloud'?'ChatGPT only mode; local model not used.':'PC only mode; cloud never used.');
  later(900,()=>{const m=effective(bot(j.botId)).mode;if(m==='cloud'&&S.remaining<=0){update(j,{state:'failed',error:'ChatGPT limit reached in ChatGPT-only mode (sample). Switch to PC only or pause.'});return;}if(m!=='local'&&S.remaining<=0&&m==='hybrid')ev('Cloud skipped (sample limit); continuing locally.');else if(m!=='local')ev('Cloud contribution completed (simulated).');if(m!=='cloud')ev('Local '+S.brain.localModel+' contribution completed (simulated).');if(m==='hybrid'&&S.remaining>0)ev('Local integration merged cloud and local contributions.');
    j.plan=['Add subtract() and multiply()','Write unit tests','Run tests'];
    const cp=checkpoint(pid,'Before coding step: '+j.prompt.slice(0,80));
    S.files[pid]['calc.py']='def add(a, b):\n    return a + b\n\n\ndef subtract(a, b):\n    return a - b\n\n\ndef multiply(a, b):\n    return a * b\n';
    S.files[pid]['tests/test_calc.py']='import unittest\nfrom calc import add, subtract, multiply\n\n\nclass CalcTests(unittest.TestCase):\n    def test_ops(self):\n        self.assertEqual(add(2, 3), 5)\n        self.assertEqual(subtract(5, 3), 2)\n        self.assertEqual(multiply(4, 3), 12)\n';
    ev('Files saved; checkpoint '+cp.slice(0,8)+'.');j.lastChecks={ok:true,output:'Static syntax/JSON checks passed (2 files). No runtime claims.'};j.stepIndex=0;
    if(effective(bot(j.botId)).mode!=='local'&&S.remaining>0)S.calls=Math.min(S.limit,S.calls+1);
    update(j,{state:'awaiting_approval',approval:{kind:'tests',tools:['python_tests'],message:'Run generated project tests on this PC? (Preview: nothing actually runs.)'}});});}
function finishCoding(j){update(j,{state:'running',approval:null});j.events=[...j.events,'Running python_tests (simulated)'];
  later(800,()=>{j.lastChecks={ok:true,runtime:true,output:'test_ops (test_calc.CalcTests.test_ops) ... ok\n\nRan 1 test in 0.001s\n\nOK   (simulated in preview)'};j.events=[...j.events,'Checks passed.'];
    update(j,{state:'ready',stepIndex:1,verification:'runtime tests passed (simulated)',reply:'Added `subtract()` and `multiply()` with unit tests.\n\n```python\ndef subtract(a, b):\n    return a - b\n```\n\nPreview mode: sample result, not real AI.'});});}
function diff(pid,id){const list=S.checkpoints[pid];const i=list.findIndex(c=>c.id===id);if(i<0)err(400,'Checkpoint not found.');
  const before=list[i].files,after=list[i+1]?.files||S.files[pid];const changes=[];
  for(const name of [...new Set([...Object.keys(before),...Object.keys(after)])].sort()){const a=before[name],b=after[name];if(a===b)continue;
    const al=(a||'').split('\n'),bl=(b||'').split('\n');let k=0;while(k<al.length&&k<bl.length&&al[k]===bl[k])k++;
    const text=[`--- a/${name}`,`+++ b/${name}`,`@@ -${k+1} +${k+1} @@`,...al.slice(k).filter(x=>x!=='').map(x=>'-'+x),...bl.slice(k).filter(x=>x!=='').map(x=>'+'+x)].join('\n');
    changes.push({path:name,status:a==null?'added':b==null?'deleted':'modified',diff:text});}
  return {checkpoint:id,reason:list[i].reason,changes};}
function handle(path,method,body){const [route,qs]=path.split('?');const q=new URLSearchParams(qs||'');
  if(method==='GET'){
    switch(route){
      case 'status':return {models:['qwen2.5-coder:7b (sample)'],ollamaError:null,cloudConfigured:true,cloudBackend:'codex',localModel:'qwen2.5-coder:7b',hybridState:{}};
      case 'bots':return clone(S.bots);case 'projects':return clone(S.projects);case 'builds':return clone([...S.jobs].reverse());
      case 'control-center':return {...center(),pendingAccounts:clone(S.accounts.filter(a=>a.status==='pending'))};
      case 'models':return modelsStatus();
      case 'me-theme':return clone(S.theme||{preset:'bacon',accent:'#ff7399',accent2:'#df4c65',background:'#121116',surface:'#1b1a21',text:'#f6f1f5'});
      case 'me-app':return clone(S.look||{name:'Bacon AI',shortName:'Bacon AI',themeColor:'#131217',backgroundColor:'#131217',icon:null,emoji:null});
      case 'me':return {id:'owner',email:'owner',role:'admin',status:'active',owner:true};
      case 'accounts':return {accounts:clone(S.accounts),emailConfigured:false,emailError:null,bans:clone(S.bans)};
      case 'approval-link':err(400,'Preview: approval links come from real sign-up emails.');
      case 'integrations':return [{name:'Preview mode',status:'Sample data only. Connect your PC for real integrations.'},{name:'Python',status:'File editing + approved unittest execution'},{name:'Roblox Studio',status:'Bridge implemented; live Windows validation required'}];
      case 'project-files':project(q.get('id'));return clone(S.files[q.get('id')]);
      case 'checkpoints':project(q.get('id'));return S.checkpoints[q.get('id')].map(c=>({id:c.id,created:c.created,reason:c.reason})).reverse();
      case 'checkpoint-diff':project(q.get('id'));return diff(q.get('id'),q.get('checkpoint'));
      case 'bot-export':{const b=bot(q.get('id'));const {id,...rest}=b;return {format:'bacon-ai-bot',version:1,bot:rest};}
      case 'project-download':err(400,'Downloads are disabled in preview. Connect your PC to download real projects.');
      default:if(route.startsWith('builds/'))return clone(job(route.slice(7)));err(404,'Not available in preview.');}
  }
  switch(route){
    case 'tasks':{const b=bot(body.botId);if(typeof body.prompt!=='string'||!body.prompt.trim())err(400,'Enter 1–20,000 characters.');
      if(S.emergency)err(400,'Emergency stop active. Resume before starting new work.');
      const mode=body.mode||b.mode;const j={id:hex(),prompt:body.prompt,state:'queued',created:Date.now(),workflow:'bacon',botId:b.id,bot:clone(b),mode,events:[],conversationId:body.conversationId||hex(),projectId:mode==='coding'?project(body.projectId).id:null};
      if(mode==='coding'){if(S.jobs.some(x=>x.projectId===j.projectId&&['queued','running','awaiting_approval'].includes(x.state)))err(400,'This project already has active or approval-pending work.');later(400,()=>runCoding(j));}
      else later(700,()=>update(j,{state:'ready',reply:chatReply(j.prompt)}));
      S.jobs.push(j);return clone(j);}
    case 'approve':{const j=job(body.id);if(j.state!=='awaiting_approval')err(400,'No approval pending.');if(body.approve!==true){update(j,{state:'stopped',approval:null,error:'Action declined. Saved files and checkpoints retained.'});return clone(j);}finishCoding(j);return clone(j);}
    case 'resume-task':{const j=job(body.id);if(!['stopped','failed','needs_attention'].includes(j.state))err(400,'This task cannot be resumed.');update(j,{state:'queued',error:null});later(300,()=>runCoding(j));return clone(j);}
    case 'control':{const a=body.action;if(a==='pause'){S.paused=true;S.reason='Paused by user (preview).';}else if(a==='resume'){S.paused=false;S.emergency=false;S.reason='';}else if(a==='stop'||a==='emergency'){S.generation++;S.paused=false;S.emergency=a==='emergency';S.reason=S.emergency?'Emergency workload stop':'Work stopped';for(const j of S.jobs)if(['queued','running','awaiting_approval'].includes(j.state))update(j,{state:'stopped',error:'Work stopped; files retained.'});}else err(400,'Unknown control action');return center().controls;}
    case 'bots':{const raw=body.bot||{};if(raw.icon!=null&&!(typeof raw.icon==='string'&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(raw.icon)&&raw.icon.length<=400000))err(400,'Use a PNG, JPEG or WebP icon smaller than 280 KB.');if(typeof raw.name!=='string'||!raw.name.trim())err(400,'Bot name is required.');if(!Number.isInteger(raw.cloudTarget)||raw.cloudTarget<0||raw.cloudTarget>100)err(400,'Cloud target must be 0–100.');
      const b={...clone(GREETING_BOT),...clone(raw),id:body.id||hex()};delete b.iconText;S.bots=S.bots.filter(x=>x.id!==b.id).concat([b]);return clone(b);}
    case 'bot-import':{if(body.format!=='bacon-ai-bot')err(400,'Unsupported bot file.');const b={...clone(GREETING_BOT),...clone(body.bot||{}),id:hex()};S.bots.push(b);return clone(b);}
    case 'projects':{if(typeof body.name!=='string'||!body.name.trim())err(400,'Choose a project name and supported type.');const p={id:hex(),name:body.name.trim(),kind:body.kind,botId:bot(body.botId).id,created:Date.now()};S.projects.unshift(p);S.files[p.id]={};S.checkpoints[p.id]=[];return clone(p);}
    case 'restore':{if(body.confirmed!==true)err(400,'Restoring files requires confirmation.');const list=S.checkpoints[project(body.projectId).id];const c=list.find(x=>x.id===body.checkpoint)||err(400,'Checkpoint not found.');checkpoint(body.projectId,'Before restore');S.files[body.projectId]=clone(c.files);return {checkpoint:c.id};}
    case 'settings':{const b=bot(body.botId);if(!Number.isInteger(body.cloudTarget)||body.cloudTarget<0||body.cloudTarget>100)err(400,'Cloud target must be 0–100.');b.cloudTarget=body.cloudTarget;return clone(b);}
    case 'cloud-mode':{if(body.mode==='local')S.localOnly=true;else if(body.mode==='auto')S.localOnly=false;else if(body.mode==='pause'){S.paused=true;S.reason='Paused until the ChatGPT limit resets (preview).';}else err(400,'Invalid cloud mode.');return cloudMode();}
    case 'providers':{const a=body.action||'list';
      if(a==='save'){const p=body.provider||{};if(!p.name)err(400,'Give it a name.');if(!/^https:\/\/[^\s/?#@]+(\/[^\s?#]*)?$/.test(p.baseUrl||''))err(400,'Base URL must be https://, like https://api.groq.com/openai/v1 (no key or ? in the address).');if(!p.model)err(400,'Enter a model name.');
        const old=S.providers.find(x=>x.id===p.id);if(!old&&!p.apiKey)err(400,'Paste the API key.');const item={id:old?old.id:'p_'+Math.random().toString(16).slice(2,14).padEnd(12,'0'),name:p.name,baseUrl:p.baseUrl.replace(/\/+$/,''),model:p.model,preset:p.preset||'custom',hasKey:true};
        if(old)Object.assign(old,item);else S.providers.push(item);} /* preview: the key is discarded, never stored */
      else if(a==='delete'){S.providers=S.providers.filter(x=>x.id!==body.id);if(S.brain.cloudProvider===body.id){S.brain.cloudProvider='codex';if(S.brain.brainMode==='other')S.brain.brainMode='hybrid';}}
      else if(a==='test')return {test:{ok:true,reply:'OK (sample reply from the preview fake provider; nothing was sent)'}};
      else if(a==='models')return {models:['fake-coder-1','fake-coder-mini','fake-chat-large']};
      return {providers:clone(S.providers),presets:PV_PRESETS,billingNote:PV_BILL};}
    case 'brain':{const st=body.settings||{};if(body.scope==='bot'){const b=bot(body.botId);if(st.clear)b.brain=null;else if(st.brainMode){if(!['hybrid','cloud','local','other'].includes(st.brainMode))err(400,'Invalid brain mode.');b.brain={brainMode:st.brainMode};}return clone(b);}
      if(st.brainMode!==undefined){if(!['hybrid','cloud','local','other'].includes(st.brainMode))err(400,'Brain mode must be hybrid, cloud (ChatGPT only), local (PC only) or other (Other AI).');S.brain.brainMode=st.brainMode;}
      if(st.cloudProvider!==undefined){if(st.cloudProvider!=='codex'&&!S.providers.some(p=>p.id===st.cloudProvider))err(400,'That AI provider no longer exists.');S.brain.cloudProvider=st.cloudProvider;}
      if(st.power!==undefined){if(!POWER[st.power])err(400,'Brain power must be light, balanced or max.');S.brain.power=st.power;}
      if(st.localModel){if(!S.installed.includes(st.localModel))err(400,'Install that Ollama model first (Pull), then select it.');S.brain.localModel=st.localModel;}
      if(st.cloudModel!==undefined)S.brain.cloudModel=String(st.cloudModel).slice(0,60);return clone(S.brain);}
    case 'model-pull':{if(body.confirmed!==true)err(400,'Downloading a model needs confirmation (it can be several GB).');const name=String(body.name||'');if(!CATALOG.some(c=>c.name===name))err(400,'Invalid Ollama model name.');if(Object.values(S.pulls).some(p=>p.state==='pulling'))err(400,'A model download is already running.');S.pulls[name]={state:'pulling',status:'starting (simulated)',percent:0};simulatePull(name);return {name,state:'pulling'};}
    case 'signup':{const e=String(body.email||'').trim().toLowerCase();if(!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(e))err(400,'Enter a valid email address.');if(String(body.password||'').length<10)err(400,'Use a password of at least 10 characters.');S.verify={email:e,name:body.name||e.split('@')[0],attempts:0};return {status:'verify',email:e,message:'We emailed a 6-digit code to '+e+'. (Preview only: no email is sent. Sample-only code for this preview: 123456.)'};}
    case 'signup-resend':if(!S.verify)err(400,'That sign-up expired. Start again.');return {status:'verify',email:S.verify.email,message:'New code sent. (Preview only: the sample-only code is still 123456.)'};
    case 'signup-verify':{const v=S.verify||err(400,'That code expired. Start the sign-up again.');if(body.code!=='123456'){v.attempts++;if(v.attempts>=5){S.verify=null;err(400,'Too many wrong codes. Start the sign-up again.');}err(400,`Wrong code. ${5-v.attempts} attempt(s) left.`);}
      S.verify=null;S.accounts.push({id:hex(),email:v.email,name:v.name,role:'user',status:'pending',created:now(),cloudBudget:null,devices:1,tailnet:[]});return {status:'pending',email:v.email,message:'Email verified (preview). It now waits for owner approval in Control center → Accounts.'};}
    case 'login':err(400,'Preview: sign-in is simulated. Connect a real controller to sign in.');
    case 'password-reset-start':if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email||''))err(400,'Enter a valid email address.');return {status:'reset',message:'Preview: no email is sent. Sample-only code for this preview: 123456. Enter it with a new password.'};
    case 'password-reset':if(body.code!=='123456')err(400,'Wrong code. 4 attempt(s) left. (Preview sample code: 123456)');if(typeof body.password!=='string'||body.password.length<10)err(400,'Use a password of at least 10 characters.');return {status:'done',message:'Preview: password changed (simulated). Real sign-in needs a connected controller.'};
    case 'me-theme':{const b=body||{};if(!['accent','accent2','background','surface','text'].every(k=>/^#[0-9a-fA-F]{6}$/.test(b[k]||'')))err(400,'Colours must look like #1a2b3c.');S.theme=clone(b);return clone(b);}
    case 'me-app':{const b=body||{};if(typeof b.shortName!=='string'||!b.shortName.trim()||b.shortName.length>15)err(400,'Home-screen name must be 1–15 characters (longer names get cut off).');if(![b.themeColor,b.backgroundColor].every(c=>/^#[0-9a-fA-F]{6}$/.test(c||'')))err(400,'Colours must look like #1a2b3c.');if(b.icon!=null&&!(typeof b.icon==='string'&&b.icon.startsWith('data:image/png;base64,')))err(400,'The app icon must be a PNG made by the app (under 450 KB).');S.look=clone(b);return clone(b);}
    case 'logout':return {signedOut:true};
    case 'accounts':{const u=S.accounts.find(x=>x.id===body.id)||err(400,'Account not found.');const a=body.action;
      if(a==='update'){const c=body.changes||{};if(c.status&&!['active','denied','pending'].includes(c.status))err(400,'Invalid status.');if(c.role&&!['user','admin'].includes(c.role))err(400,'Invalid role.');if('cloudBudget' in c&&c.cloudBudget!==null&&!(Number.isInteger(c.cloudBudget)&&c.cloudBudget>=0&&c.cloudBudget<=1000))err(400,'Cloud budget must be 0–1000 calls per day, or blank for no personal limit.');if('age' in c){if(c.age!==null&&!(Number.isInteger(c.age)&&c.age>=3&&c.age<=120))err(400,'Enter an age from 3 to 120.');u.age=c.age;u.adult=c.age!==null&&c.age>=18;if(!u.adult)u.swearing=false;delete c.age;}if('swearing' in c){if(c.swearing&&!u.adult)err(400,'Swearing mode is only for adults (18+). The owner sets ages.');u.swearing=!!c.swearing;delete c.swearing;}Object.assign(u,c);}
      else if(a==='ban'){u.status='banned';S.bans.devices+=u.devices;for(const t of u.tailnet)if(!S.bans.tailnet.includes(t))S.bans.tailnet.push(t);}
      else if(a==='unban'){u.status='denied';S.bans.devices=Math.max(0,S.bans.devices-u.devices);S.bans.tailnet=S.bans.tailnet.filter(t=>!u.tailnet.includes(t));}
      else if(a==='remove')S.accounts=S.accounts.filter(x=>x.id!==u.id);else err(400,'Unknown account action.');return clone(u);}
    case 'allowance-refresh':return {refreshing:true};
    default:err(404,'Not available in preview.');}
}
window.BaconPreview={
  // Returns a real Response built in memory; there is no fetch() anywhere in this file.
  async request(path,options={}){const method=(options.method||'GET').toUpperCase();let body;try{body=options.body?JSON.parse(options.body):undefined;}catch(e){body=undefined;}
    try{const value=handle(path,method,body);return new Response(JSON.stringify(value),{status:method==='POST'&&path==='tasks'?202:200,headers:{'Content-Type':'application/json'}});}
    catch(e){return new Response(JSON.stringify({error:e.message}),{status:e.status||400,headers:{'Content-Type':'application/json'}});}},
  setRemaining(r){S.remaining=r;if(r>0)S.localOnly=false;},
  setBudgetUsed(n){S.calls=Math.max(0,Math.min(S.limit,n));},
  reset(){S=fresh();},
  state(){return S;},
};
})();
