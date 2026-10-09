// Independent assessment: no answer feedback until submission.
const root = document.getElementById('check-root');
const storageNote = document.getElementById('check-storage');
const KEY = 'igel-forschercheck-v1';
const choice = (question, options, answer) => ({question, options, answer});
const tasks = {
 A: [
  {title:'Körper', icon:'🦔', items:[choice('Was trägt der Igel auf dem Rücken?', ['Stacheln','Federn'],0),choice('Womit riecht der Igel?', ['Mit der Nase','Mit dem Schwanz'],0),choice('Womit hört der Igel?', ['Mit den Pfoten','Mit den Ohren'],1),choice('Wie viele Pfoten hat der Igel?', ['Zwei','Vier'],1)]},
  {title:'Nahrung',icon:'🪲',items:[choice('🪲 Käfer: Nahrung oder keine Nahrung?', ['Nahrung','Keine Nahrung'],0),choice('🍪 Keks: Nahrung oder keine Nahrung?', ['Nahrung','Keine Nahrung'],1),choice('🐛 Raupe: Nahrung oder keine Nahrung?', ['Nahrung','Keine Nahrung'],0),choice('🍬 Bonbon: Nahrung oder keine Nahrung?', ['Nahrung','Keine Nahrung'],1)]},
  {title:'Zuhause',icon:'🍂',items:[choice('Laubhaufen: ein geschütztes Versteck?', ['Ja','Nein'],0),choice('Straße: ein geschütztes Versteck?', ['Ja','Nein'],1),choice('Dichte Hecke: ein geschütztes Versteck?', ['Ja','Nein'],0),choice('Offene Rasenfläche: ein geschütztes Versteck?', ['Ja','Nein'],1)]},
  {title:'Igeljahr',icon:'❄️',items:[choice('Der Igel erwacht aus dem Winterschlaf.', ['Frühling','Sommer','Herbst','Winter'],0),choice('Viele Igel bekommen jetzt Junge.', ['Frühling','Sommer','Herbst','Winter'],1),choice('Der Igel frisst sich Fettreserven an.', ['Frühling','Sommer','Herbst','Winter'],2),choice('Der Igel hält Winterschlaf.', ['Frühling','Sommer','Herbst','Winter'],3)]},
  {title:'Hilfe',icon:'💧',items:[choice('Was stellen wir zum Trinken hin?', ['Milch','Frisches Wasser'],1),choice('Was hilft als Versteck?', ['Laub und Äste liegen lassen','Alle Verstecke entfernen'],0),choice('Was hilft auf dem Weg zum nächsten Garten?', ['Ein Durchgang im Zaun','Ein ganz geschlossener Zaun'],0),choice('Was tun wir mit dem Mähroboter bei Nacht?', ['Ausschalten','Fahren lassen'],0)]}
 ]
};
let state = null, screen = 'setup', teacher = false;
const el = (tag,text,cls) => {const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const btn = (text,action,cls='quiet') => {const b=el('button',text,cls);b.type='button';b.onclick=action;return b;};
const list = () => tasks[state.version];
const completed = (t,i) => t.items.every((q,j)=>Number.isInteger(state.answers[i]?.[j]));
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));storageNote.textContent='Dieser Check wird nur in diesem Browser gespeichert. Vor dem nächsten Kind den Check löschen.';}catch{storageNote.textContent='Speichern ist in diesem Browser nicht möglich. Die Antworten bleiben nur bis zum Neuladen erhalten. Ergebnis vor dem Schließen drucken.';}}
try {
 const data=JSON.parse(localStorage.getItem(KEY)||'null');
 if(data?.schema===1 && tasks[data.version] && Array.isArray(data.answers) && Number.isInteger(data.index) && data.index>=0 && data.index<tasks[data.version].length && typeof data.code==='string' && typeof data.support==='string' && typeof data.comment==='string' && typeof data.submitted==='boolean' && typeof data.read==='boolean' && typeof data.date==='string'){
  const valid=tasks[data.version].every((t,i)=>Array.isArray(data.answers[i]) && (t.items?t.items.every((q,j)=>data.answers[i][j]===null || (Number.isInteger(data.answers[i][j])&&data.answers[i][j]>=0&&data.answers[i][j]<q.options.length)):t.fields.every((_,j)=>typeof data.answers[i][j]==='string')));
  if(valid){state=data;storageNote.textContent='Ein Check ist auf diesem Gerät gespeichert. Fortsetzen oder nach dem Sichern löschen.';}
 }
} catch {storageNote.textContent='Kein gespeicherter Check verfügbar.';}
function show(next){screen=next;render();const heading=root.querySelector('h2');if(heading){heading.tabIndex=-1;heading.focus();}}
function field(label,value,change,multiline=false){const wrap=el('label',label,'check-field');const input=el(multiline?'textarea':'input');if(!multiline)input.type='text';input.setAttribute('aria-label',label);input.value=value;input.maxLength=multiline?1500:80;if(multiline)input.rows=3;const printValue=el('span',value||'Keine Angabe','check-print-value');printValue.setAttribute('aria-hidden','true');input.oninput=()=>{change(input.value);printValue.textContent=input.value||'Keine Angabe';};wrap.append(input,printValue);return wrap;}
function render(){
 root.replaceChildren();
 if(screen==='setup'){
  root.append(el('h2','Für die Lehrkraft: Check vorbereiten'));
  root.append(el('p','Fünf Aufgabenbereiche mit insgesamt 20 Punkten. Die Antworten werden nach der Abgabe automatisch ausgewertet. Plane etwa 15 bis 20 Minuten ein. Du kannst die Aufgaben vorlesen lassen.'));
  if(state){root.append(el('p','Gespeichert: Version '+state.version+' · '+(state.code||'ohne Kürzel')+(state.submitted?' · abgegeben':' · in Bearbeitung')));root.append(btn(state.submitted?'Abgegebenen Check öffnen':'Gespeicherten Check fortsetzen',()=>{teacher=false;show(state.submitted?'submitted':'task');},'sun'),btn('Gespeicherten Check löschen',()=>show('delete')));return;}
  const form=el('form');
  let code='',read=false;form.append(field('Kürzel (freiwillig, kein voller Name)',code,v=>code=v));const readLabel=el('label',undefined,'check-toggle');const readBox=el('input');readBox.type='checkbox';readBox.onchange=()=>read=readBox.checked;readLabel.append(readBox,el('span','Vorlesen anbieten'));form.append(readLabel);
  const start=el('button','Check starten','sun');start.type='submit';form.append(start);form.onsubmit=e=>{e.preventDefault();state={schema:1,version:'A',code,date:new Date().toLocaleDateString('de-DE'),read,index:0,answers:tasks.A.map(t=>t.items.map(()=>null)),support:'',comment:'',submitted:false};teacher=false;save();show('task');};root.append(form);
 } else if(screen==='delete'){
  root.append(el('h2','Check von diesem Gerät löschen?'),el('p','Sichere den Ergebnisbogen vorher. Danach sind die Antworten in diesem Browser entfernt.'));
  root.append(btn('Abbrechen',()=>show('setup')),btn('Jetzt löschen',()=>{try{localStorage.removeItem(KEY);}catch{storageNote.textContent='Löschen fehlgeschlagen. Bitte Browserdaten prüfen.';return;}state=null;teacher=false;storageNote.textContent='Der Check wurde gelöscht.';show('setup');},'sun'));
 } else if(screen==='task'){
  const t=list()[state.index];root.append(el('p','Version '+state.version+' · '+'Aufgabenbereich '+(state.index+1)+' von '+list().length,'check-progress'));root.append(el('h2',t.title),el('div',t.icon,'quiz-icon'));
  if(state.read){const supported='speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;const speakButton=btn(supported?'Aufgabe vorlesen':'Vorlesen hier nicht verfügbar',()=>{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t.items.map(q=>q.question+' '+q.options.join('. ')).join('. '));u.lang='de-DE';u.rate=.85;speechSynthesis.speak(u);});speakButton.disabled=!supported;root.append(speakButton);}
  t.items.forEach((q,j)=>{const group=el('fieldset',undefined,'check-question');group.append(el('legend',q.question));const opts=el('div',undefined,'check-options');q.options.forEach((text,k)=>{const l=el('label',undefined,'check-answer');const radio=el('input');radio.type='radio';radio.name='check-q-'+j;radio.value=k;radio.checked=state.answers[state.index][j]===k;radio.onchange=()=>{state.answers[state.index][j]=k;save();};l.append(radio,el('span',text));opts.append(l);});group.append(opts);root.append(group);});
  const nav=el('div',undefined,'check-actions');const back=btn('Zurück',()=>{state.index--;save();show('task');});back.disabled=state.index===0;nav.append(back,btn(state.index===list().length-1?'Zur Übersicht':'Weiter',()=>{if(state.index<list().length-1){state.index++;save();show('task');}else show('review');},'sun'),btn('Pause / Vorbereitung',()=>show('setup')));root.append(nav,el('p','Du kannst Antworten ändern oder Aufgaben offen lassen. Lösungen siehst du während des Checks nicht.','check-note'));
 } else if(screen==='review'){
  root.append(el('h2','Prüfe deinen Check'),el('p','Möchtest du noch etwas ergänzen? Nach der Abgabe kannst du deine Antworten nicht mehr ändern.'));
  list().forEach((t,i)=>root.append(btn(t.title+' · '+(completed(t,i)?'beantwortet':'noch offen'),()=>{state.index=i;save();show('task');})));
  root.append(btn('Zurück zu den Aufgaben',()=>show('task')),btn('Check jetzt abgeben',()=>{state.submitted=true;save();teacher=false;show('submitted');},'sun'));
 } else if(screen==='submitted'){
  root.append(el('h2','Dein Check ist abgegeben'),el('p','Danke fürs Forschen! Gib das Gerät jetzt deiner Lehrkraft.'));
  root.append(btn('Lehrkraftauswertung öffnen',()=>{teacher=true;show('report');},'sun'),btn('Zur Vorbereitung',()=>show('setup')));
 } else if(screen==='report' && teacher){
  const report=el('div',undefined,'check-report');report.append(el('h2','Ergebnisbogen · Version '+state.version),el('p','Kürzel: '+(state.code||'ohne Kürzel')+' · Datum: '+state.date));
  let total=0;
  list().forEach((t,i)=>{
   const section=el('section',undefined,'check-report-task');section.append(el('h3',t.title));
   let points=0;t.items.forEach((q,j)=>{const a=state.answers[i][j],good=a===q.answer;if(good)points++;section.append(el('p',q.question+' Antwort: '+(a===null?'offen':q.options[a])+' · '+(good?'1':'0')+' Punkt. Erwartet: '+q.options[q.answer]+'.'));});total+=points;section.append(el('strong',points+' / 4 Punkte · '+(points===4?'sicher':points>=2?'teilweise sicher':'noch üben')));
   report.append(section);
  });
  report.append(el('h3','Gesamt: '+total+' / '+(list().length*4)+' Punkte'));
  report.append(field('Unterstützung (z. B. vorgelesen / mündlich aufgenommen)',state.support,v=>{state.support=v;save();}),field('Rückmeldung der Lehrkraft',state.comment,v=>{state.comment=v;save();},true));
  report.append(el('p','Jede richtige Einzelantwort zählt einen Punkt. Offene Antworten zählen null Punkte. Die Rückmeldung zeigt, welche Lernbereiche sicher sind und wo noch geübt werden kann.'));
  root.append(report,btn('Ergebnis drucken / als PDF sichern',()=>{document.body.classList.add('check-print');window.print();},'sun'),btn('Zur Vorbereitung',()=>{teacher=false;show('setup');}));
 }
}
window.addEventListener('afterprint',()=>document.body.classList.remove('check-print'));
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{if('speechSynthesis' in window)speechSynthesis.cancel();}));
render();
