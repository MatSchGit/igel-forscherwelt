import {speakText,readButton,stopSpeech} from './speech.js?v=1';
const $=id=>document.getElementById(id);let sceneReady=false,currentView='garden';
function showView(view){if(assessmentActive&&view!=='check')return;stopSpeech();if(!['garden','body','food','habitat','year','help','enemies','check'].includes(view))throw Error('Unbekannte Station');currentView=view;document.querySelectorAll('.view').forEach(s=>s.hidden=s.id!==view);document.querySelectorAll('nav button').forEach(b=>b.toggleAttribute('aria-current',b.dataset.view===view));document.querySelectorAll('nav button[aria-current]').forEach(b=>b.setAttribute('aria-current','page'));if(view==='body'){if(!sceneReady)initModel();else window.dispatchEvent(new Event('resize'));}window.scrollTo(0,0);}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>showView(b.dataset.view));
function speak(text){speakText(text);}
document.querySelectorAll('.read').forEach(b=>b.onclick=()=>speak(b.dataset.read));$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else{$('fullscreen').textContent='iPad bitte quer halten';}}catch{$('fullscreen').textContent='iPad bitte quer halten';}};
const parts=[['Stacheln','Die Stacheln schützen den Igel. Bei Gefahr kann er sich zu einer Kugel einrollen.'],['Schnauze','An der Schnauze sitzt die Nase. Mit ihr riecht der Igel und sucht nach Nahrung.'],['Augen','Die Augen des Igels sind klein.'],['Ohren','Mit seinen Ohren hört der Igel auch leise Geräusche.'],['Pfote mit Krallen','An jeder Pfote sitzen Krallen. Sie helfen dem Igel beim Graben.'],['Bauch','Am Bauch hat der Igel Fell und keine Stacheln.'],['Schwanz','Der Igel hat einen kurzen Schwanz. Er sitzt hinten am Körper.']];let practice=false,selected=null;const known=new Set();let hotButtons=[],hedgehog,homeRotation=.35;
parts.forEach(([name],i)=>{const b=document.createElement('button');b.textContent=name;b.setAttribute('aria-pressed','false');b.onclick=()=>{if(practice){selected=i;updateBody();}else{known.add(i);$('body-feedback').textContent=parts[i][1];speak(name);updateBody();}};$('words').append(b);});
function updateBody(){[...$('words').children].forEach((b,i)=>{b.setAttribute('aria-pressed',selected===i?'true':'false');b.classList.toggle('done',known.has(i));});hotButtons.forEach((b,i)=>{b.textContent=known.has(i)?parts[i][0]:String(i+1);b.classList.toggle('named',known.has(i));});$('discover').setAttribute('aria-pressed',String(!practice));$('practice').setAttribute('aria-pressed',String(practice));$('body-instruction').textContent=practice?'Wählt ein Wort. Tippt dann auf den passenden Punkt.':'Tippt auf einen Punkt am Igel.';}
function partClick(i){if(!practice){known.add(i);$('body-feedback').textContent=parts[i][1];speak(parts[i][0]);}else if(selected===null){$('body-feedback').textContent='Wählt zuerst ein Wort aus.';}else if(selected===i){known.add(i);selected=null;$('body-feedback').textContent=known.size===parts.length?'Ihr habt alle Körperteile gefunden!':'Das passt! '+parts[i][1];speak(parts[i][0]);}else{$('body-feedback').textContent='Schaut noch einmal genau hin. Ihr könnt den Igel drehen.';}updateBody();}
function bodyReset(){known.clear();selected=null;$('body-feedback').textContent='Was fällt euch am Körper auf?';updateBody();}
$('discover').onclick=()=>{practice=false;bodyReset();};$('practice').onclick=()=>{practice=true;bodyReset();};$('restart-body').onclick=bodyReset;$('all-labels').onclick=()=>{parts.forEach((_,i)=>known.add(i));selected=null;$('body-feedback').textContent='Vergleicht: Wo sind Stacheln? Wo ist Fell?';updateBody();};
async function initModel(){sceneReady=true;try{
const T=await import('./three.module.js');const {createHedgehog}=await import('./hedgehog.js?v=3');const container=$('model');const renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;container.append(renderer.domElement);
const scene=new T.Scene();const camera=new T.PerspectiveCamera(34,1,.1,100);camera.position.set(3.7,2.4,6.7);camera.lookAt(0,.62,0);scene.add(new T.HemisphereLight(0xfff5e3,0x8b9285,2));const key=new T.DirectionalLight(0xfff0d9,3);key.position.set(1,6,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=4;key.shadow.camera.bottom=-4;key.shadow.bias=-.0005;scene.add(key);const fill=new T.DirectionalLight(0xe4ecf5,1.4);fill.position.set(-3,2,-4);scene.add(fill);
const animal=createHedgehog();hedgehog=animal.root;hedgehog.rotation.y=homeRotation;scene.add(hedgehog);const floor=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({opacity:.18}));floor.rotation.x=-Math.PI/2;floor.position.y=-.04;floor.receiveShadow=true;scene.add(floor);
const anchors=animal.anchors;const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('model-leaders');svg.setAttribute('aria-hidden','true');container.append(svg);const lines=anchors.map(()=>{const line=document.createElementNS('http://www.w3.org/2000/svg','line');svg.append(line);return line;});
hotButtons=anchors.map((_,i)=>{const b=document.createElement('button');b.className='hotspot';b.setAttribute('aria-label','K\u00f6rperpunkt '+(i+1));b.onclick=()=>partClick(i);container.append(b);return b;});updateBody();let dragging=false,lastX=0,lastY=0;
renderer.domElement.onpointerdown=e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);};renderer.domElement.onpointermove=e=>{if(!dragging)return;hedgehog.rotation.y+=(e.clientX-lastX)*.012;hedgehog.rotation.z=T.MathUtils.clamp(hedgehog.rotation.z+(e.clientY-lastY)*.004,-.6,.6);lastX=e.clientX;lastY=e.clientY;};renderer.domElement.onpointerup=renderer.domElement.onpointercancel=()=>dragging=false;
$('rotate-left').onclick=()=>hedgehog.rotation.y-=.5;$('rotate-right').onclick=()=>hedgehog.rotation.y+=.5;$('reset-model').onclick=()=>{hedgehog.rotation.set(0,homeRotation,0);};function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.position.set(w/h<1.2?4.2:3.7,2.4,w/h<1.2?8.7:6.7);camera.lookAt(0,.62,0);camera.updateProjectionMatrix();svg.setAttribute('viewBox','0 0 '+w+' '+h);}window.addEventListener('resize',resize);new ResizeObserver(resize).observe(container);resize();const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let lastFrame=0;function render(t){requestAnimationFrame(render);if(t-lastFrame<40)return;lastFrame=t;if(currentView!=='body')return;animal.tick(t*.001,reduced);hedgehog.updateMatrixWorld();const w=container.clientWidth,h=container.clientHeight;const offsets=[[-65,-30],[60,15],[72,-30],[20,-65],[35,53],[-68,47],[-60,35]];anchors.forEach((a,i)=>{const p=a.clone();hedgehog.localToWorld(p);p.project(camera);const x=(p.x+1)/2*w,y=(-p.y+1)/2*h;const bx=T.MathUtils.clamp(x+offsets[i][0],hotButtons[i].offsetWidth/2+8,w-hotButtons[i].offsetWidth/2-8);const by=T.MathUtils.clamp(y+offsets[i][1],38,h-30);hotButtons[i].style.left=bx+'px';hotButtons[i].style.top=by+'px';lines[i].setAttribute('x1',x);lines[i].setAttribute('y1',y);lines[i].setAttribute('x2',bx);lines[i].setAttribute('y2',by);});renderer.render(scene,camera);}requestAnimationFrame(render);
}catch(error){$('model-error').hidden=false;console.error(error);}}
const context=document.modelContext;if(context?.registerTool){const lifecycle=new AbortController();try{Promise.resolve(context.registerTool({name:'open_learning_station',title:'Lernstation öffnen',description:'Öffnet Garten, Körper, Nahrung, Zuhause, Igeljahr, Helfen, Feinde oder Forschercheck in der Igel-Forscherwelt.',inputSchema:{type:'object',properties:{station:{type:'string',enum:['garden','body','food','habitat','year','help','enemies','check']}},required:['station'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||Object.keys(input).some(k=>k!=='station'))throw Error('Ungültige Eingabe');showView(input.station);return{station:currentView};}},{signal:lifecycle.signal})).catch(()=>{});window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});}catch{}}

const field=$('catch-field'),item=$('catch-item'),igel=$('catch-igel');
const catchFoods=[['🪲','Käfer',true],['🪱','Regenwurm',true],['🐛','Raupe',true],['🍬','Bonbon',false],['🍦','Eis',false],['🍪','Keks',false]];
let running=false,paused=false,position=.5,fall=0,round=0,score=0,currentFood=null,lastTime=0,nextAt=0;
function moveIgel(x){position=Math.max(.08,Math.min(.92,x));igel.style.left=(position*100)+'%';}
function newItem(){currentFood=catchFoods[round%6];round++;fall=-65;item.innerHTML='<span aria-hidden="true">'+currentFood[0]+'</span><small>'+currentFood[1]+'</small>';item.style.left=([.22,.68,.45,.8,.32,.56][(round-1)%6]*100)+'%';item.hidden=false;}
function finish(){running=false;item.hidden=true;$('catch-pause').disabled=true;$('catch-start').textContent='Noch einmal spielen';$('catch-feedback').textContent='Runde geschafft! Ihr habt '+score+' von 12 Entscheidungen richtig getroffen. Nahrung fangen, anderes vorbeilassen.';}
$('catch-start').onclick=()=>{running=true;paused=false;round=0;score=0;nextAt=0;lastTime=0;moveIgel(.5);$('catch-score').textContent='0 richtige Entscheidungen';$('catch-feedback').textContent='';$('catch-pause').disabled=false;$('catch-pause').textContent='Pause';$('catch-start').textContent='Neu starten';newItem();field.focus();};
$('catch-pause').onclick=()=>{paused=!paused;$('catch-pause').textContent=paused?'Weiter':'Pause';lastTime=0;};
field.onpointerdown=e=>{field.setPointerCapture(e.pointerId);moveIgel((e.clientX-field.getBoundingClientRect().left)/field.clientWidth);};
field.onpointermove=e=>{if(field.hasPointerCapture(e.pointerId))moveIgel((e.clientX-field.getBoundingClientRect().left)/field.clientWidth);};
field.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();moveIgel(position+(e.key==='ArrowLeft'?-.075:.075));}};
$('catch-left').onclick=()=>moveIgel(position-.12);$('catch-right').onclick=()=>moveIgel(position+.12);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused){paused=true;$('catch-pause').textContent='Weiter';}});
function catchTick(t){requestAnimationFrame(catchTick);if(!running||paused||currentView!=='food'||$('catch-mode').hidden){lastTime=0;return;}if(nextAt){if(t<nextAt)return;nextAt=0;if(round>=12){finish();return;}newItem();lastTime=t;}
const dt=lastTime?Math.min((t-lastTime)/1000,.05):0;lastTime=t;fall+=dt*75;item.style.top=fall+'px';
const bottom=field.clientHeight-92;if(fall>=bottom){const x=parseFloat(item.style.left)/100,hit=Math.abs(x-position)*field.clientWidth<58;item.hidden=true;if(hit===currentFood[2])score++;if(hit&&currentFood[2]){$('catch-feedback').textContent=currentFood[1]+': Das gehört zur Nahrung des Igels.';}else if(hit){$('catch-feedback').textContent=currentFood[1]+': Das ist keine geeignete Igelnahrung.';}else{$('catch-feedback').textContent='';}$('catch-score').textContent=score+' richtige Entscheidungen · '+round+'/12';nextAt=t+(hit?2200:700);}
}
requestAnimationFrame(catchTick);
const places=[['🍂','Laubhaufen',true,'Ein geschützter Laubhaufen bietet dem Igel ein Versteck. Im Winter kann er dort sein Nest bauen.'],['🌳','Dichte Hecke',true,'Unter einer dichten Hecke findet der Igel Schutz.'],['🪵','Reisighaufen',true,'Zwischen Ästen und Laub kann sich der Igel verstecken.'],['⚽','Offene Rasenfläche',false,'Hier fehlt ein geschütztes Versteck. Auf der Rasenfläche kann der Igel aber Nahrung suchen.'],['🚗','Straße',false,'Hier ist es gefährlich. Der Igel braucht geschützte Orte abseits des Verkehrs.'],['💧','Offener Teich',false,'Ein offener Teich ist kein Schlafplatz. Ein flacher Ausstieg hilft Tieren, wieder herauszukommen.']];
places.forEach(([icon,name,good,explanation])=>{const b=document.createElement('button');b.className='place';b.innerHTML='<span aria-hidden="true">'+icon+'</span><strong>'+name+'</strong>';b.onclick=()=>{b.classList.add('visited');b.setAttribute('aria-label',name+'. '+explanation);$('habitat-feedback').textContent=explanation;};$('habitat-places').append(b);});
$('habitat-reset').onclick=()=>{[...$('habitat-places').children].forEach((b,i)=>{b.classList.remove('visited');b.removeAttribute('aria-label');});$('habitat-feedback').textContent='Schaut genau hin und begründet eure Vermutung.';};
const seasons=['Frühling','Sommer','Herbst','Winter'],seasonIcons=['🌷','☀️','🍂','❄️'];
const activities=[['❄️','Der Igel hält Winterschlaf.',3],['🍂','Der Igel frisst sich Fettreserven an und sucht ein Winterquartier.',2],['🌷','Der Igel erwacht aus dem Winterschlaf und sucht Nahrung.',0],['🌙','In warmen Nächten sucht der Igel Nahrung. Viele Igel bekommen jetzt Junge.',1]];
let selectedCard=null;const assigned=new Set();
activities.forEach(([icon,label],i)=>{const b=document.createElement('button');b.className='year-card';b.innerHTML='<span aria-hidden="true">'+icon+'</span><span>'+label+'</span>';b.setAttribute('aria-pressed','false');b.onclick=()=>{if(assigned.has(i))return;selectedCard=i;[...$('year-cards').children].forEach((c,j)=>c.setAttribute('aria-pressed',String(j===i)));$('year-feedback').textContent='Welche Jahreszeit passt?';};$('year-cards').append(b);});
seasons.forEach((name,i)=>{const b=document.createElement('button');b.className='season';b.innerHTML='<span aria-hidden="true">'+seasonIcons[i]+'</span><strong>'+name+'</strong><div class="season-answer"></div>';b.onclick=()=>{if(selectedCard===null){$('year-feedback').textContent='Wählt zuerst eine Karte.';return;}const card=activities[selectedCard];if(card[2]!==i){$('year-feedback').textContent='Überlegt noch einmal: Welche Jahreszeit passt am besten?';return;}assigned.add(selectedCard);const c=$('year-cards').children[selectedCard];c.disabled=true;c.setAttribute('aria-pressed','false');b.querySelector('.season-answer').textContent=card[1];selectedCard=null;$('year-feedback').textContent=assigned.size===4?'Ihr habt das Igeljahr geordnet! Erzählt: Wie verändert sich das Leben des Igels?':'Das passt! Wählt die nächste Karte.';};$('year-seasons').append(b);});
$('year-reset').onclick=()=>{assigned.clear();selectedCard=null;[...$('year-cards').children].forEach(c=>{c.disabled=false;c.setAttribute('aria-pressed','false');});document.querySelectorAll('.season-answer').forEach(c=>c.textContent='');$('year-feedback').textContent='Was macht der Igel im Laufe des Jahres?';};
const gardenTasks = [
  {before:'🧹', after:'🍂', name:'Die aufgeräumte Ecke', done:'Laub und Äste', question:'Wo kann sich der Igel verstecken?', options:['Laub und Äste in einer ruhigen Ecke lassen','Alles Laub wegtragen'], answer:0, yes:'Laub und Äste bieten ein geschütztes Versteck. Lasst bewohnte Verstecke in Ruhe.', no:'Wenn alles weggeräumt ist, fehlen Verstecke. Was könnten wir liegen lassen?'},
  {before:'🚧', after:'🦔', name:'Der geschlossene Zaun', done:'Ein freier Durchgang', question:'Wie kommt der Igel in den nächsten Garten?', options:['Den Zaun überall schließen','Mit Erwachsenen einen Durchgang am Boden schaffen'], answer:1, yes:'Ein Durchgang verbindet die Gärten. So kann der Igel weiter nach Nahrung suchen.', no:'Ein ganz geschlossener Zaun versperrt den Weg. Wie könnte der Igel hindurchkommen?'},
  {before:'🥛', after:'💧', name:'Die Trinkstelle', done:'Frisches Wasser', question:'Was stellen wir zum Trinken hin?', options:['Eine flache Schale mit frischem Wasser','Eine Schale Milch'], answer:0, yes:'Frisches Wasser in einer flachen Schale hilft. Erwachsene reinigen die Schale regelmäßig. Milch verträgt der Igel nicht.', no:'Milch verträgt der Igel nicht. Welches andere Getränk passt?'},
  {before:'⚙️', after:'🌼', name:'Der Mähroboter bei Nacht', done:'Eine ruhige Gartennacht', question:'Der Igel ist nachts unterwegs. Was hilft ihm?', options:['Den Mähroboter nachts fahren lassen','Den Mähroboter nachts und in der Dämmerung ausschalten'], answer:1, yes:'Nachts und in der Dämmerung bleibt der Mähroboter aus. Er kann Igel schwer verletzen. Eine wilde Ecke bietet zusätzlich Nahrungstieren Platz.', no:'Ein Mähroboter kann Igel verletzen. Wann sollte er ausgeschaltet bleiben?'}
];
const improved = new Set();
let activeGardenTask = null;
function renderHelpGarden(){
  $('help-spots').replaceChildren();
  gardenTasks.forEach((task,i)=>{
    const b=document.createElement('button');b.className='help-spot';
    b.setAttribute('aria-pressed',String(activeGardenTask===i));
    const icon=document.createElement('span');icon.setAttribute('aria-hidden','true');icon.textContent=improved.has(i)?task.after:task.before;
    const name=document.createElement('strong');name.textContent=improved.has(i)?task.done:task.name;
    const status=document.createElement('small');status.textContent=improved.has(i)?'✓ Geholfen':'Hier helfen';
    b.classList.toggle('improved',improved.has(i));b.append(icon,name,status);
    b.onclick=()=>openHelpTask(i);$('help-spots').append(b);
  });
  $('help-progress').textContent=improved.size+' von 4 Gartenstellen verbessert';
}
function openHelpTask(i){
  activeGardenTask=i;renderHelpGarden();const task=gardenTasks[i];
  $('help-task').hidden=false;$('help-question').textContent=task.question;$('help-options').replaceChildren();
  task.options.forEach((label,j)=>{
    const b=document.createElement('button');b.textContent=label;
    b.onclick=()=>{
      if(j!==task.answer){$('help-feedback').textContent=task.no;return;}
      improved.add(i);activeGardenTask=null;renderHelpGarden();$('help-task').hidden=true;
      $('help-feedback').textContent=task.yes+(improved.size===4?' Ihr habt alle vier Stellen verbessert! Welche Idee könnt ihr mit Erwachsenen zu Hause ausprobieren?':' Findet die nächste Gartenstelle.');
      $('help-spots').children[i].focus();
    };$('help-options').append(b);
  });
  $('help-feedback').textContent=improved.has(i)?task.yes:'Besprecht eure Idee und wählt eine Hilfe.';
  $('help-question').focus();
}
$('help-reset').onclick=()=>{improved.clear();activeGardenTask=null;$('help-task').hidden=true;renderHelpGarden();$('help-feedback').textContent='Wo könnt ihr dem Igel helfen? Begründet eure Ideen.';};
renderHelpGarden();

const stationQuizzes={
 enemies:[['🦉','Welches Tier ist ein natürlicher Fressfeind des Igels?',['Der Uhu','Der Schmetterling'],0,'Der Uhu kann Igel erbeuten. Auch er ist Teil der Natur.'],['🛡️','Schützt Einrollen vor einem fahrenden Auto?',['Ja, immer','Nein'],1,'Die Stacheln schützen nicht vor Autos. Geschützte Wege und Lebensräume helfen dem Igel.']],
 body:[['🦔','Was schützt den Rücken des Igels?',['Stacheln','Federn'],0,'Auf dem Rücken trägt der Igel Stacheln.'],['👃','Womit riecht der Igel?',['Mit den Pfoten','Mit der Nase'],1,'Mit seiner Nase kann der Igel Nahrung riechen.']],
 food:[['🪲','Was gehört zur natürlichen Nahrung des Igels?',['Ein Käfer','Ein Keks'],0,'Käfer gehören zu den Nahrungstieren des Igels.'],['🐛','Was findet der Igel auf seiner Nahrungssuche?',['Bonbons','Raupen'],1,'Raupen gehören zur natürlichen Nahrung. Süßigkeiten passen nicht.']],
 habitat:[['🍂','Wo findet der Igel ein geschütztes Versteck?',['Mitten auf der Straße','Unter Laub und Ästen'],1,'Laub und Äste bieten Schutz. Eine Straße ist gefährlich.'],['🌳','Was bietet eine dichte Hecke?',['Ein Versteck','Eine Trinkschale'],0,'Unter einer dichten Hecke kann sich der Igel verstecken.']],
 year:[['❄️','Was macht der Igel im Winter?',['Er hält Winterschlaf','Er baut einen Schneemann'],0,'Der Igel hält Winterschlaf in einem geschützten Nest.'],['🍂','Warum frisst der Igel im Herbst viel?',['Er sammelt Fettreserven','Er legt Vorräte in einen Schrank'],0,'Fettreserven helfen dem Igel, den Winter zu überstehen.']],
 help:[['💧','Was ist eine passende Trinkstelle?',['Eine flache Wasserschale','Eine Schale Milch'],0,'Frisches Wasser hilft. Milch verträgt der Igel nicht.'],['🚧','Was hilft dem Igel auf seinen Wegen?',['Ein Durchgang im Zaun','Ein ganz geschlossener Zaun'],0,'Durchgänge verbinden Gärten und ermöglichen die Nahrungssuche.']]
};
Object.entries(stationQuizzes).forEach(([station,questions])=>{
  const box=document.createElement('details');box.className='station-quiz';
  const summary=document.createElement('summary');summary.textContent='Forscherquiz · 2 Fragen';box.append(summary);
  const area=document.createElement('div');area.className='quiz-content';box.append(area);$(station).append(box);
  let question=0,answered=false;
  function renderQuiz(){
    area.replaceChildren();answered=false;
    const data=questions[question],progress=document.createElement('p');progress.className='quiz-progress';progress.textContent='Frage '+(question+1)+' von '+questions.length;
    const title=document.createElement('h2');title.textContent=data[1];
    const icon=document.createElement('div');icon.className='quiz-icon';icon.textContent=data[0];icon.setAttribute('aria-hidden','true');
    const options=document.createElement('div');options.className='quiz-options';
    const feedback=document.createElement('p');feedback.className='feedback';feedback.setAttribute('aria-live','polite');feedback.textContent='Besprecht euch und wählt eine Antwort.';
    const next=document.createElement('button');next.className='sun';next.hidden=true;next.textContent=question===questions.length-1?'Noch einmal forschen':'Nächste Frage';
    data[2].forEach((label,i)=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>{
      if(answered)return;
      if(i!==data[3]){feedback.textContent='Überlegt noch einmal. Welche andere Antwort passt?';return;}
      answered=true;b.classList.add('quiz-correct');options.querySelectorAll('button').forEach(a=>a.disabled=true);
      feedback.textContent='Das passt! '+data[4]+(question===questions.length-1?' Beide Fragen geschafft!':'');next.hidden=false;
    };options.append(b);});
    next.onclick=()=>{question=(question+1)%questions.length;renderQuiz();area.querySelector('h2').focus();};
    title.tabIndex=-1;area.append(progress,title,icon,options,feedback,next);
  }
  renderQuiz();
});

let assessmentActive=false;
window.addEventListener('igel-check-state',e=>{assessmentActive=e.detail.active;document.querySelectorAll('[data-view]').forEach(b=>b.disabled=assessmentActive&&b.dataset.view!=='check');if(assessmentActive)showView('check');});
let sortIndex=0,sortFirst=0,sortAttempted=false;
function renderFoodSort(){const area=$('food-sort');area.replaceChildren();if(sortIndex===catchFoods.length){const result=document.createElement('p');result.textContent='Alle sechs Karten sortiert! Beim ersten Versuch: '+sortFirst+' von 6 richtig. Welche Nahrungstiere kennt ihr?';area.append(result);return;}
const [icon,name,good]=catchFoods[sortIndex];const progress=document.createElement('p');progress.textContent='Karte '+(sortIndex+1)+' von 6 · Ohne Zeitdruck';const card=document.createElement('h2');card.textContent=icon+' '+name;const feedback=document.createElement('p');feedback.className='feedback';feedback.setAttribute('aria-live','polite');feedback.textContent='Gehört das zur Nahrung des Igels?';const options=document.createElement('div');options.className='check-actions';const next=document.createElement('button');next.className='sun';next.textContent='Nächste Karte';next.hidden=true;next.onclick=()=>{sortIndex++;sortAttempted=false;renderFoodSort();};
[true,false].forEach(value=>{const b=document.createElement('button');b.textContent=value?'Nahrung':'Keine geeignete Nahrung';b.onclick=()=>{if(value===good){if(!sortAttempted)sortFirst++;options.querySelectorAll('button').forEach(x=>x.disabled=true);feedback.textContent=good?name+' ist ein Nahrungstier des Igels.':name+' ist keine geeignete Igelnahrung.';next.hidden=false;}else feedback.textContent='Überlegt noch einmal. Der Igel frisst vor allem kleine Tiere.';sortAttempted=true;};options.append(b);});area.append(progress,card,readButton(()=>name+'. Gehört das zur Nahrung des Igels?','Karte vorlesen'),options,feedback,readButton(()=>feedback.textContent,'Rückmeldung vorlesen'),next);}
$('food-sort-reset').onclick=()=>{sortIndex=0;sortFirst=0;sortAttempted=false;renderFoodSort();};
['sort','catch'].forEach(mode=>$('food-mode-'+mode).onclick=()=>{stopSpeech();$('sort-mode').hidden=mode!=='sort';$('catch-mode').hidden=mode!=='catch';['sort','catch'].forEach(m=>$('food-mode-'+m).setAttribute('aria-pressed',String(mode===m)));if(running&&!paused){paused=true;$('catch-pause').textContent='Weiter';}});renderFoodSort();
for(const id of ['body','food','habitat','year','help','enemies']){const section=$(id),intro=section.querySelector('.section-title + p'),controls=document.createElement('div');controls.className='reading-controls';const instructions=()=>id==='body'?$('body-instruction').textContent:id==='food'?'Sortiert die Karten. Was frisst der Igel? Ihr habt so viel Zeit, wie ihr braucht.':id==='help'?intro.textContent+' '+($('help-task').hidden?'':$('help-task').innerText):id==='year'?intro.textContent+' '+$('year-cards').innerText:intro.textContent;
controls.append(readButton(instructions,'Aufgabe vorlesen'),readButton(()=>id==='food'&&!$('sort-mode').hidden?$('food-sort').querySelector('.feedback')?.textContent||$('food-sort').innerText:id==='enemies'?$('enemy-shield-text').textContent+' '+$('enemy-feedback').textContent:$(id==='food'?'catch-feedback':id+'-feedback').textContent,'Rückmeldung vorlesen'));const stop=document.createElement('button');stop.className='quiet';stop.textContent='Vorlesen stoppen';stop.onclick=stopSpeech;controls.append(stop);section.querySelector('.section-title').after(controls);section.querySelectorAll('.quiz-content').forEach(area=>area.before(readButton(()=>area.innerText,'Quiz vorlesen')));}
