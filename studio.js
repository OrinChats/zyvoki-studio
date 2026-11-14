(()=>{'use strict';const $=id=>document.getElementById(id);const c=$('preview'),ctx=c.getContext('2d',{alpha:false}),a=$('narration'),f=$('engine'),seek=$('seek');let duration=42.84;let loadToken=0,loadedURL=null,audioURL=null,projectName="Goku — Instinto Superior";let assetURLs=[];let ready=false,playing=false,position=0,started=0,raf=0,rec=null,chunks=[],audioCtx=null,audioDest=null,sourceNode=null,stream=null;const fmt=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;const status=s=>$('status').textContent=s;function engine(){try{return f.contentWindow}catch{return null}}function render(t){const w=engine();if(!ready||!w)return;try{w.seek(Math.max(0,Math.min(duration-.001,t)));const fc=w.document.getElementById('c')||w.document.querySelector('canvas');if(!fc)throw Error('Motor sem canvas de renderização');ctx.drawImage(fc,0,0,c.width,c.height);if(!$('captionsOn').checked){/* Captions are drawn into original Canvas; switch requires renderer support */}}catch(e){status('Erro ao desenhar: '+e.message)}}function ui(){seek.value=position;$('time').textContent=`${fmt(position)} / ${fmt(duration)}`;$('play').textContent=playing?'❚❚ Pausar':'▶ Reproduzir'}function tick(now){if(!playing)return;position=Math.min(duration,(now-started)/1000);render(position);ui();if(position>=duration){if(rec&&rec.state==='recording')rec.stop();pause();return}raf=requestAnimationFrame(tick)}function pause(){playing=false;cancelAnimationFrame(raf);a.pause();ui()}async function play(){if(!ready)return;if(playing){pause();return}if(position>=duration-.05)position=0;playing=true;started=performance.now()-position*1000;try{if($('audioOn').checked){a.currentTime=position;await a.play()}}catch(e){status('O navegador bloqueou o áudio: toque em reproduzir novamente.')}ui();raf=requestAnimationFrame(tick)}function jump(t){position=+t;started=performance.now()-position*1000;try{a.currentTime=position}catch{}render(position);ui()}$('play').onclick=play;$('restart').onclick=()=>jump(0);seek.oninput=e=>jump(e.target.value);$('audioOn').onchange=()=>{a.muted=!$('audioOn').checked};$('captionsOn').onchange=()=>status('As legendas fazem parte do Canvas original e permanecem visíveis nesta versão.');f.onload=()=>{const token=++loadToken;const w=engine();let count=0;const check=()=>{if(token!==loadToken)return;if(w&&w.READY&&typeof w.seek==='function'){ready=true;duration=Number(w.END)||duration;seek.max=duration;position=0;$('loading').style.display='none';render(0);ui();status('Prévia pronta: '+projectName);return}if(w&&w.__studioError){$('loading').textContent='Erro: '+w.__studioError;status('Erro no projeto: '+w.__studioError);return}if(++count>100){$('loading').textContent='Falha ao iniciar projeto';status('Tempo limite: motor sem READY. '+(w&&w.__studioError||'Verifique se o projeto está completo.'));return}setTimeout(check,150)};check()};
async function setupAudio(){if(audioDest)return audioDest.stream;audioCtx=new (window.AudioContext||window.webkitAudioContext)();audioDest=audioCtx.createMediaStreamDestination();sourceNode=audioCtx.createMediaElementSource(a);sourceNode.connect(audioDest);sourceNode.connect(audioCtx.destination);await audioCtx.resume();return audioDest.stream}
$('record').onclick=async()=>{if(!ready)return;if(!window.MediaRecorder||!c.captureStream){status('Este navegador não suporta gravação do Canvas.');return}try{pause();jump(0);const v=c.captureStream(30);const tracks=[...v.getVideoTracks()];if($('audioOn').checked){const s=await setupAudio();tracks.push(...s.getAudioTracks())}stream=new MediaStream(tracks);const formats=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];const mime=formats.find(x=>MediaRecorder.isTypeSupported(x));if(!mime)throw Error('Gravação WebM indisponível neste navegador');chunks=[];rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:4500000});rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};rec.onstop=()=>{const blob=new Blob(chunks,{type:mime});const url=URL.createObjectURL(blob);const d=$('download');if(d.href&&d.href.startsWith('blob:'))URL.revokeObjectURL(d.href);d.href=url;d.classList.add('show');$('record').disabled=false;$('stop').disabled=true;status('Gravação concluída. Toque em “Baixar vídeo WebM”.');stream.getTracks().forEach(t=>t.stop())};rec.start(1000);$('record').disabled=true;$('stop').disabled=false;$('download').classList.remove('show');status('Gravando em tempo real. Não bloqueie a tela.');await play()}catch(e){status('Não foi possível gravar: '+e.message);$('record').disabled=false;$('stop').disabled=true}};$('stop').onclick=()=>{if(rec&&rec.state!=='inactive')rec.stop();pause()};setInterval(()=>{if(rec&&rec.state==='recording'&&position>=duration-.05){rec.stop();pause()}},250);

// Importação offline de projetos ZIP, sem precisar republicar o Studio.
const DB='zyvoki-studio-v3';
function dbOpen(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>req.result.createObjectStore('projects');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function saveZip(bytes){const db=await dbOpen();return new Promise((res,rej)=>{const tx=db.transaction('projects','readwrite');tx.objectStore('projects').put(bytes,'active');tx.oncomplete=()=>{db.close();res()};tx.onerror=()=>rej(tx.error)})}
async function getZip(){const db=await dbOpen();return new Promise((res,rej)=>{const tx=db.transaction('projects','readonly');const r=tx.objectStore('projects').get('active');r.onsuccess=()=>{db.close();res(r.result)};r.onerror=()=>rej(r.error)})}
async function clearZip(){const db=await dbOpen();return new Promise((res,rej)=>{const tx=db.transaction('projects','readwrite');tx.objectStore('projects').delete('active');tx.oncomplete=()=>{db.close();res()};tx.onerror=()=>rej(tx.error)})}
const jsEscape=s=>s.replace(/<\/script/gi,'<\\/script');
async function importProject(bytes,persist=true){
  pause();if(rec&&rec.state==='recording')throw Error('Pare a gravação antes de importar.');
  status('Abrindo ZIP...');const zip=await JSZip.loadAsync(bytes);
  const paths=Object.keys(zip.files).filter(x=>!zip.files[x].dir);
  const idx=paths.find(x=>/(^|\/)film\/index\.html$/i.test(x))||paths.find(x=>/(^|\/)index\.html$/i.test(x));
  if(!idx)throw Error('ZIP sem film/index.html.');
  const base=idx.slice(0,idx.lastIndexOf('/')+1);
  for(const url of assetURLs)URL.revokeObjectURL(url);assetURLs=[];
  let markup=await zip.file(idx).async('string');
  // Empacota imagens, texturas, modelos GLB, videos, fontes e arquivos auxiliares.
  // Os recursos ficam acessiveis no iframe por URLs blob locais; sem upload externo.
  const mimeFor=(name)=>({png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',svg:'image/svg+xml',gif:'image/gif',mp4:'video/mp4',webm:'video/webm',glb:'model/gltf-binary',gltf:'model/gltf+json',bin:'application/octet-stream',hdr:'image/vnd.radiance',ktx2:'image/ktx2',woff2:'font/woff2',woff:'font/woff',json:'application/json'})[name.split('.').pop().toLowerCase()]||'application/octet-stream';
  const resources={};
  for(const name of paths){if(!name.startsWith(base)||name===idx)continue;
    if(!/\.(png|jpe?g|webp|svg|gif|mp4|webm|glb|gltf|bin|hdr|ktx2|woff2?|json)$/i.test(name))continue;
    const bytes=await zip.file(name).async('blob');const url=URL.createObjectURL(new Blob([bytes],{type:mimeFor(name)}));assetURLs.push(url);
    resources[name.slice(base.length)]=url;
  }
  const scripts=[...markup.matchAll(/<script\s+src=["']([^"']+)["']\s*><\/script>/gi)];
  for(const m of scripts){const name=m[1];if(name.includes('..')||/^https?:/i.test(name))throw Error('Script externo ou caminho inseguro: '+name);const item=zip.file(base+name);if(!item)throw Error('Script ausente: '+base+name);const code=await item.async('string');markup=markup.replace(m[0],'<script>'+jsEscape(code)+'</script>')}
  // Mapeamento de assets para engines Three.js / WebGL / Canvas.
  const assetBootstrap='<script>window.ZYVOKI_ASSETS='+JSON.stringify(resources).replace(/<\//g,'<\\/')+';window.zyvokiAsset=function(path){return window.ZYVOKI_ASSETS[path]||path};<\/script>';
  markup=markup.replace(/<head([^>]*)>/i,'<head$1>'+assetBootstrap);
  // Converte referencias declarativas em URLs locais, incluindo texturas e videos.
  for(const [name,url] of Object.entries(resources)){
    markup=markup.replaceAll('"'+name+'"','"'+url+'"').replaceAll("'"+name+"'","'"+url+"'");
    markup=markup.replaceAll('url('+name+')','url('+url+')');
  }
  const audioFile=paths.find(x=>/(^|\/)(goku|narration|audio)\.(mp3|wav|m4a)$/i.test(x))||paths.find(x=>/\.(mp3|wav|m4a)$/i.test(x));
  if(audioFile){const blob=await zip.file(audioFile).async('blob');if(audioURL)URL.revokeObjectURL(audioURL);audioURL=URL.createObjectURL(new Blob([blob],{type:audioFile.endsWith('.wav')?'audio/wav':audioFile.endsWith('.m4a')?'audio/mp4':'audio/mpeg'}));a.src=audioURL;a.load()}
  else {a.src='goku.mp3';a.load()}
  ready=false;$('loading').style.display='grid';$('loading').textContent='Carregando projeto…';
  if(loadedURL)URL.revokeObjectURL(loadedURL);
  // Relata erros do motor no próprio Studio e evita espera infinita.
  markup=markup.replace(/<head([^>]*)>/i, '<head$1><script>window.__studioError=null;window.addEventListener("error",function(e){window.__studioError=(e.message||"Erro JavaScript")+(e.filename?" em "+e.filename:"")});window.addEventListener("unhandledrejection",function(e){window.__studioError=String(e.reason)});<\/script>');
  // A fonte pode falhar no Android; não deve bloquear a animação.
  // srcdoc mantém a mesma origem do Studio para permitir acesso ao Canvas.
  // URLs blob: criam origem opaca em alguns navegadores Android.
  loadedURL=null;
  projectName=paths.find(x=>/(^|\/)project\.json$/i.test(x))?'Projeto importado':'Projeto importado';
  const meta=paths.find(x=>/(^|\/)project\.json$/i.test(x));
  if(meta){try{const info=JSON.parse(await zip.file(meta).async('string'));projectName=String(info.title||info.name||projectName).slice(0,90)}catch{}}
  $('projectTitle').textContent=projectName;$('projectInfo').textContent='Motor multimídia • 1080 × 1920 • '+Object.keys(resources).length+' recursos (imagens / vídeos / modelos)';
  f.removeAttribute('src'); f.srcdoc=markup;
  if(persist){try{await saveZip(bytes)}catch(e){status('Projeto aberto, mas não foi possível salvar no navegador: '+e.message)}}
}
$('projectFile').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{await importProject(await file.arrayBuffer());status('Projeto recebido. Iniciando prévia...')}catch(err){status('Falha na importação: '+err.message)}finally{e.target.value=''}});
function restore(){pause();ready=false;duration=42.84;seek.max=duration;position=0;projectName='Goku — Instinto Superior';$('projectTitle').textContent=projectName;$('projectInfo').textContent='Canvas 2D • 1080 × 1920 • 42,84 segundos';if(audioURL){URL.revokeObjectURL(audioURL);audioURL=null}a.src='goku.mp3';a.load();$('loading').style.display='grid';f.removeAttribute('srcdoc');f.src='film/index.html';ui()}
$('restore').onclick=restore;
$('forget').onclick=async()=>{try{await clearZip();restore();status('Projeto importado apagado deste navegador.')}catch(e){status('Erro ao limpar: '+e.message)}};
getZip().then(bytes=>{if(bytes)return importProject(bytes,false)}).catch(e=>status('Projeto padrão disponível. Armazenamento local indisponível: '+e.message));

})();