
// v0.0.21: robuste laufende Punkte als Text (. -> .. -> ...), kein CSS-Cursor.
const h8Dots=[...document.querySelectorAll('.running-dots')];
let h8DotStep=0;
setInterval(()=>{
  h8DotStep=(h8DotStep%3)+1;
  h8Dots.forEach(el=>{ el.textContent='.'.repeat(h8DotStep); });
},420);
h8Dots.forEach(el=>{ el.textContent='.'; });

const boot=document.querySelector('#boot');
const prompt=document.querySelector('#gatePrompt');
const out=document.querySelector('#bootText');
const lines=['> H8IT WIRD INITIALISIERT...','> SCHLECHTE IDEEN WERDEN GELADEN...','> GESUNDER MENSCHENVERSTAND ........ FEHLGESCHLAGEN','> H8IT .............................. ONLINE'];
let state='enter';

// Wer von einer App-Seite zurückkommt, landet direkt wieder auf der H8IT-Projektseite.
if(sessionStorage.getItem('h8itEntered')==='1'){
  state='inside';
  boot.classList.add('done');
}

function showEnter(){
  state='enter';
  prompt.innerHTML='> DAS NICHTS BETRETEN? [J/N] <span class="gate-cursor">█</span>';
  out.innerHTML='';
}
async function runBoot(){
  state='booting';
  // Fullscreen darf nur direkt aus einer bewussten Nutzereingabe gestartet werden.
  // J am Eingang ist genau diese Eingabe; ESC bleibt jederzeit Browser-Notausgang.
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  } catch (_) { /* Browser darf Fullscreen ablehnen; Seite läuft normal weiter. */ }
  sessionStorage.setItem('h8itEntered','1');
  prompt.innerHTML='> DAS NICHTS BETRETEN? [J/N] <span class="answer">J</span>';
  out.textContent=''; let i=0;
  function next(){
    if(i<lines.length){out.textContent+=lines[i++]+'\n';setTimeout(next,260)}
    else setTimeout(()=>boot.classList.add('done'),500);
  }
  setTimeout(next,300);
}
function deny(){
  state='retry';
  prompt.innerHTML='> ZUGRIFF VERWEIGERT.<br>> FEIGLING.<br><br>> NOCHMAL VERSUCHEN? [J/N] <span class="gate-cursor">█</span>';
  out.innerHTML='';
}
function goodbye(){
  state='goodbye';
  prompt.innerHTML='> AUF WIEDERSEHEN. <span class="gate-cursor">█</span>';
  out.innerHTML='';
}
document.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(k!=='j' && k!=='n') return;
  e.preventDefault();
  if(state==='enter'){ k==='j' ? runBoot() : deny(); }
  else if(state==='retry'){ k==='j' ? showEnter() : goodbye(); }
});

const phrase='starte --projekt schlechte_idee.exe';let p=0;
setTimeout(function type(){const el=document.querySelector('#typed');if(p<phrase.length){el.textContent+=phrase[p++];setTimeout(type,65)}},2600);


const manifestText=document.querySelector('.about>p');
if(manifestText){
  const parts=[
    {text:'Nützlich. Unnötig. Ein bisschen daneben.', cls:''},
    {text:'Kleine digitale Dinge. Gebaut, weil ', cls:''},
    {text:'warum zur Hölle nicht?', cls:'accent-type'}
  ];
  manifestText.innerHTML='<span id="manifestTyped"></span><span class="manifest-cursor">█</span>';
  const out=document.querySelector('#manifestTyped');
  let started=false;
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  async function typeManifest(){
    if(started) return;
    started=true;
    for(let pi=0;pi<parts.length;pi++){
      if(pi===1) out.appendChild(document.createElement('br'));
      const span=document.createElement('span');
      if(parts[pi].cls) span.className=parts[pi].cls;
      out.appendChild(span);
      for(const ch of parts[pi].text){
        span.textContent+=ch;
        await wait(ch==='.' || ch==='?' ? 105 : 38);
      }
      if(pi<parts.length-1) await wait(180);
    }
  }
  const manifestObserver=new IntersectionObserver(entries=>{
    if(entries.some(e=>e.isIntersecting)){
      typeManifest();
      manifestObserver.disconnect();
    }
  },{threshold:.3});
  manifestObserver.observe(manifestText);
}



// v0.0.14 — Der lange Festplatten-Scan läuft pro Sitzung genau einmal.
// Danach zeigen alle Kacheln denselben bereits abgeschlossenen Scan; nur die
// jeweilige EXE-Abfrage wechselt. Reine Browser-Inszenierung, kein Dateizugriff.
const fakePaths=[
  'C:\\Windows\\System32','C:\\Program Files','C:\\Users\\Public\\Documents',
  'C:\\Users\\...\\Desktop','C:\\Users\\...\\Downloads','C:\\Users\\...\\AppData\\Local',
  'C:\\Users\\...\\AppData\\Roaming','C:\\pagefile.sys','C:\\hiberfil.sys'
];
const fakeDiskInfo='> Lokaler Datenträger (C:)\n> 476 GB Gesamtspeicher\n> 183 GB verfügbar\n';
const strip=document.querySelector('.project-strip');
const cards=[...document.querySelectorAll('.project')];
let activeCard=null;
let busy=false;
const nap=ms=>new Promise(r=>setTimeout(r,ms));
const scanDone=sessionStorage.getItem('h8itScanDone')==='1';
const foundCount=sessionStorage.getItem('h8itFoundCount') || '13.847';

function finishedScanText(){
  return fakeDiskInfo+fakePaths.map(p=>'> '+p).join('\n')+'\n\n> FILES FOUND: '+foundCount+'\n> SCAN COMPLETE.\n';
}
function sensitiveBox(card){
  let box=card.querySelector('.tile-sensitive');
  if(!box){
    box=document.createElement('div');
    box.className='tile-sensitive';
    box.textContent='[!!] SENSITIVES MATERIAL GEFUNDEN\n     ...wenn das deine Frau wüsste. ;-)';
    card.querySelector('.tile-output').after(box);
  }
  return box;
}
function scrollTerminal(card, smooth=false){
  const term=card.querySelector('.tile-scan');
  if(!term) return;
  requestAnimationFrame(()=>term.scrollTo({top:term.scrollHeight,behavior:smooth?'smooth':'auto'}));
}
function showReady(card){
  const app=card.dataset.app;
  card.querySelector('.tile-output').textContent=finishedScanText()+'> C:\\H8IT\\'+app+'.EXE\n';
  const warning=sensitiveBox(card); warning.classList.add('show','blink');
  card.querySelector('.tile-prompt').innerHTML='> <span class="exe">'+app+'.EXE</span> AUSFÜHREN? [J/N] <span class="cursor">█</span>';
  card.querySelector('strong').textContent='TASTATUR: J / N';
  card.dataset.awaiting='1';
  scrollTerminal(card, true);
}
function activate(card){
  if(busy) return;
  cards.forEach(c=>{ if(c!==card){c.classList.remove('engaged');c.dataset.awaiting='0';} });
  activeCard=card;
  card.classList.add('engaged');
  if(sessionStorage.getItem('h8itScanDone')==='1') showReady(card);
  else runFirstScan(card);
}
async function runFirstScan(card){
  if(busy || sessionStorage.getItem('h8itScanDone')==='1'){showReady(card);return;}
  busy=true; strip.classList.add('locked');
  const output=card.querySelector('.tile-output');
  const promptBox=card.querySelector('.tile-prompt');
  output.textContent=fakeDiskInfo; promptBox.textContent='';
  const warning=sensitiveBox(card); warning.classList.remove('show','blink');
  await nap(500);
  for(const path of fakePaths){
    output.textContent+='> '+path+'\n'; scrollTerminal(card, true);
    await nap(95+Math.random()*115);
  }
  warning.classList.add('show','blink');
  scrollTerminal(card, true);
  await nap(950);
  await nap(1350);
  warning.classList.remove('blink');
  output.textContent+='\n> Scan wird fortgesetzt...\n'; scrollTerminal(card, true);
  await nap(550);
  const count=(11842+Math.floor(Math.random()*5000)).toLocaleString('de-DE');
  sessionStorage.setItem('h8itFoundCount',count);
  output.textContent+='> FILES FOUND: '+count+'\n> SCAN COMPLETE.\n'; scrollTerminal(card, true);
  await nap(420);
  sessionStorage.setItem('h8itScanDone','1');
  busy=false; strip.classList.remove('locked');
  showReady(card);
}

cards.forEach(card=>{
  card.addEventListener('mouseenter',()=>activate(card));
  card.addEventListener('focus',()=>activate(card));
  card.addEventListener('click',e=>e.preventDefault());
});

// Nach Rückkehr von einer App bleibt genau deren Kachel offen. Der lange Scan
// ist bereits abgeschlossen; Mouseover auf eine andere Kachel wechselt sofort.
if(scanDone){
  const last=sessionStorage.getItem('h8itLastApp');
  const card=cards.find(c=>c.dataset.app===last) || cards[0];
  if(card){ activeCard=card; card.classList.add('engaged'); showReady(card); }
}

document.addEventListener('keydown',async e=>{
  if(!activeCard || activeCard.dataset.awaiting!=='1' || busy) return;
  const k=e.key.toLowerCase();
  if(k!=='j' && k!=='n') return;
  e.preventDefault();

  const card=activeCard, app=card.dataset.app;
  const box=card.querySelector('.tile-prompt'), strong=card.querySelector('strong');
  const targets={THE_RAT:'the-rat.html',UNBEQUEM:'unbequem.html',NAGGIT:'naggit.html'};
  card.dataset.awaiting='0';
  sessionStorage.setItem('h8itLastApp',app);

  // Nach der ersten kompletten Schreck-Show geht J oder N ohne Wartezeit zur App.
  if(sessionStorage.getItem('h8itFirstScareDone')==='1'){
    window.location.href=targets[app]||'#';
    return;
  }

  busy=true; strip.classList.add('locked');
  strong.textContent='BITTE WARTEN...';
  box.innerHTML='> GRATULIERE.<br>> DEINE FESTPLATTE WIRD FORMATIERT.<br><br>> FORMATIERUNG STARTET IN...'; scrollTerminal(card, true);
  await nap(650);
  for(const n of [3,2,1]){
    box.innerHTML='> GRATULIERE.<br>> DEINE FESTPLATTE WIRD FORMATIERT.<br><br>> FORMATIERUNG STARTET IN... <span class="countdown">'+n+'...</span>'; scrollTerminal(card, true);
    await nap(800);
  }

  // Langsamer, leicht unregelmäßiger Fake-Fortschritt (ca. 4,8 s).
  const steps=[3,8,14,21,29,37,46,55,63,71,78,84,89,93,96,98,99,100];
  const delays=[180,210,230,250,260,270,280,290,300,300,310,320,330,340,350,420,650,260];
  for(let i=0;i<steps.length;i++){
    const pct=steps[i];
    const blocks=Math.round(pct/6.25);
    box.innerHTML='> <span class="exe">FORMAT C:\\</span><br>> '+ '█'.repeat(blocks)+'░'.repeat(16-blocks)+' '+pct+'%';
    await nap(delays[i]);
  }
  await nap(450);

  // Diese komplette Show darf in der Sitzung kein zweites Mal laufen.
  sessionStorage.setItem('h8itFirstScareDone','1');

  // Kurzer kompletter Blackscreen mit blinkendem C:\>-Cursor.
  const blackout=document.createElement('div');
  blackout.className='h8-blackout';
  blackout.innerHTML='<div class="h8-dos">C:\\&gt; <span>█</span></div>';
  document.body.appendChild(blackout);
  await nap(1500);
  window.location.href=targets[app]||'#';
});
