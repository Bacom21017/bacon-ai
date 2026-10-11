'use strict';
/* Bacon AI preview mode: an in-memory mock of the controller API.
   Runs fully in the browser with sample data. It never performs network requests. */
(function(){
const now=()=>Date.now()/1000;const hex=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
const clone=v=>JSON.parse(JSON.stringify(v));
const GREETING_BOT={id:'my-ai',name:'My AI',description:'Bacon AI · your coding partner, chatbot, or personal AI assistant.',instructions:'',personality:'Friendly, upbeat Bacon AI by Diab Productions.',mode:'coding',emoji:'⚡',icon:null,cloudTarget:60,projectSettings:{}};
function fresh(){
  const project={id:hex(),name:'Sample calculator',kind:'python',botId:'my-ai',created:Date.now()};
  const s={bots:[clone(GREETING_BOT)],projects:[project],jobs:[],files:{},checkpoints:{},localOnly:false,remaining:82,calls:2,limit:12,paused:false,emergency:false,reason:'',generation:0,routing:0,brain:{brainMode:'hybrid',power:'balanced',localModel:'qwen2.5-coder:7b',cloudModel:''},installed:['qwen2.5-coder:7b','llama3.1:8b'],pulls:{}};
  s.files[project.id]={'calc.py':'def add(a, b):\n    return a + b\n'};s.checkpoints[project.id]=[];return s;
}
const POWER={light:{label:'Light',budgetFactor:0.4,reasoningEffort:'low',parallel:false},balanced:{label:'Balanced',budgetFactor:0.75,reasoningEffort:'medium',parallel:true},max:{label:'Max',budgetFactor:1,reasoningEffort:'high',parallel:true}};
const CATALOG=[['qwen2.5-coder:1.5b',1.5,1.0,'Very fast, basic coding help'],['qwen2.5-coder:3b',2.5,1.9,'Fast, light coding'],['qwen2.5-coder:7b',6,4.7,'Recommended for 8 GB GPUs (e.g. RTX 5060 laptop)',true],['llama3.1:8b',6.5,4.9,'Strong general chat'],['qwen2.5-coder:14b',10,9,'Heavier; spills to system RAM on 8 GB, slower'],['deepseek-coder-v2:16b',10.5,8.9,'Heavier MoE coder; partial CPU offload on 8 GB']].map(([name,vramGB,sizeGB,note,recommended])=>({name,vramGB,sizeGB,note,recommended:!!recommended}));
function effective(b){const o=b.brain||{};return {mode:S.localOnly?'local':(o.brainMode||S.brain.brainMode),power:o.power||S.brain.power,powerProfile:POWER[o.power||S.brain.power],localModel:S.brain.localModel,cloudModel:S.brain.cloudModel,cloudTarget:b.cloudTarget,overridden:!!b.brain};}
function brainStatus(){const bots={};for(const b of S.bots)bots[b.id]=effective(b);return {global:clone(S.brain),modes:{hybrid:'Hybrid',cloud:'ChatGPT only',local:'PC only'},power:POWER,presets:[10,40,60,90],vramGB:8,note:'The cloud/local split is a routing target, not a guaranteed token or compute split.',bots};}
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
      case 'control-center':return center();
      case 'models':return modelsStatus();
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
    case 'bots':{const raw=body.bot||{};if(typeof raw.name!=='string'||!raw.name.trim())err(400,'Bot name is required.');if(!Number.isInteger(raw.cloudTarget)||raw.cloudTarget<0||raw.cloudTarget>100)err(400,'Cloud target must be 0–100.');
      const b={...clone(GREETING_BOT),...clone(raw),id:body.id||hex()};S.bots=S.bots.filter(x=>x.id!==b.id).concat([b]);return clone(b);}
    case 'bot-import':{if(body.format!=='bacon-ai-bot')err(400,'Unsupported bot file.');const b={...clone(GREETING_BOT),...clone(body.bot||{}),id:hex()};S.bots.push(b);return clone(b);}
    case 'projects':{if(typeof body.name!=='string'||!body.name.trim())err(400,'Choose a project name and supported type.');const p={id:hex(),name:body.name.trim(),kind:body.kind,botId:bot(body.botId).id,created:Date.now()};S.projects.unshift(p);S.files[p.id]={};S.checkpoints[p.id]=[];return clone(p);}
    case 'restore':{if(body.confirmed!==true)err(400,'Restoring files requires confirmation.');const list=S.checkpoints[project(body.projectId).id];const c=list.find(x=>x.id===body.checkpoint)||err(400,'Checkpoint not found.');checkpoint(body.projectId,'Before restore');S.files[body.projectId]=clone(c.files);return {checkpoint:c.id};}
    case 'settings':{const b=bot(body.botId);if(!Number.isInteger(body.cloudTarget)||body.cloudTarget<0||body.cloudTarget>100)err(400,'Cloud target must be 0–100.');b.cloudTarget=body.cloudTarget;return clone(b);}
    case 'cloud-mode':{if(body.mode==='local')S.localOnly=true;else if(body.mode==='auto')S.localOnly=false;else if(body.mode==='pause'){S.paused=true;S.reason='Paused until the ChatGPT limit resets (preview).';}else err(400,'Invalid cloud mode.');return cloudMode();}
    case 'brain':{const st=body.settings||{};if(body.scope==='bot'){const b=bot(body.botId);if(st.clear)b.brain=null;else if(st.brainMode){if(!['hybrid','cloud','local'].includes(st.brainMode))err(400,'Invalid brain mode.');b.brain={brainMode:st.brainMode};}return clone(b);}
      if(st.brainMode!==undefined){if(!['hybrid','cloud','local'].includes(st.brainMode))err(400,'Brain mode must be hybrid, cloud (ChatGPT only) or local (PC only).');S.brain.brainMode=st.brainMode;}
      if(st.power!==undefined){if(!POWER[st.power])err(400,'Brain power must be light, balanced or max.');S.brain.power=st.power;}
      if(st.localModel){if(!S.installed.includes(st.localModel))err(400,'Install that Ollama model first (Pull), then select it.');S.brain.localModel=st.localModel;}
      if(st.cloudModel!==undefined)S.brain.cloudModel=String(st.cloudModel).slice(0,60);return clone(S.brain);}
    case 'model-pull':{if(body.confirmed!==true)err(400,'Downloading a model needs confirmation (it can be several GB).');const name=String(body.name||'');if(!CATALOG.some(c=>c.name===name))err(400,'Invalid Ollama model name.');if(Object.values(S.pulls).some(p=>p.state==='pulling'))err(400,'A model download is already running.');S.pulls[name]={state:'pulling',status:'starting (simulated)',percent:0};simulatePull(name);return {name,state:'pulling'};}
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
