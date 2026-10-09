const get = id => document.getElementById(id);
const cards = [
 ['🦉','Uhu',0,'Der Uhu ist eine große Eule. Er kann Igel erbeuten. Seine kräftigen Krallen können ihm dabei helfen.'],
 ['🦡','Dachs',0,'Der Dachs kann auch einen eingerollten Igel erbeuten. Die Stacheln schützen also nicht vor jedem Fressfeind.'],
 ['🦊','Fuchs',0,'Auch ein Fuchs kann Igel erbeuten. Ein fest eingerollter Igel ist für ihn schwerer zu packen.'],
 ['⚙️','Mähroboter',1,'Ein Mähroboter kann Igel schwer verletzen. Einrollen hilft hier nicht. Nachts und in der Dämmerung bleibt er aus.'],
 ['🚗','Fahrendes Auto',2,'Auf der Straße ist der Igel durch Fahrzeuge gefährdet. Seine Stacheln schützen ihn nicht vor einem Auto.'],
 ['💧','Teich ohne Ausstieg',1,'Igel können schwimmen. Bei steilen, glatten Ufern kommen sie aber manchmal nicht heraus. Ein flacher Ausstieg hilft.']
];
const groups = ['Natürliche Fressfeinde','Gefahren im Garten','Gefahren auf der Straße'];
const assigned = new Set();
let selected = null, rolled = false;
function element(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function render(){
 get('enemy-cards').replaceChildren();
 cards.forEach(([icon,name],i)=>{
  const b=element('button',undefined,'enemy-card');b.type='button';b.disabled=assigned.has(i);b.setAttribute('aria-pressed',String(selected===i));
  const visual=element('span',icon);visual.setAttribute('aria-hidden','true');b.append(visual,element('strong',name),element('small',assigned.has(i)?'✓ Zugeordnet':'Karte auswählen'));
  b.onclick=()=>{selected=i;render();get('enemy-cards').children[i].focus();get('enemy-feedback').textContent=cards[i][3]+' Welche Gruppe passt?';};get('enemy-cards').append(b);
 });
 get('enemy-groups').replaceChildren();groups.forEach((name,g)=>{
  const b=element('button',undefined,'enemy-group');b.type='button';b.append(element('strong',name));
  const labels=cards.filter((c,i)=>assigned.has(i)&&c[2]===g).map(c=>c[1]);b.append(element('span',labels.length?labels.join(' · '):'Hier zuordnen'));
  b.onclick=()=>{
   if(selected===null){get('enemy-feedback').textContent='Wählt zuerst eine Karte.';return;}
   if(cards[selected][2]!==g){get('enemy-feedback').textContent='Überlegt noch einmal: Ist es ein Tier, eine Gefahr im Garten oder eine Gefahr auf der Straße?';return;}
   const explanation=cards[selected][3];assigned.add(selected);selected=null;render();const next=get('enemy-cards').querySelector('button:not(:disabled)');if(next)next.focus();get('enemy-feedback').textContent=assigned.size===cards.length?'Alle sechs Karten sind zugeordnet! '+explanation+' Erzählt: Wann helfen die Stacheln und wann helfen Menschen?':'Das passt! '+explanation+' Wählt die nächste Karte.';
  };get('enemy-groups').append(b);
 });
 get('enemy-progress').textContent=assigned.size+' von 6 Karten zugeordnet';
}
get('enemy-roll').onclick=()=>{
 rolled=!rolled;get('enemy-roll').setAttribute('aria-pressed',String(rolled));get('enemy-roll').textContent=rolled?'Igel wieder öffnen':'Igel einrollen';
 get('enemy-hedgehog').classList.toggle('rolled',rolled);get('enemy-hedgehog').textContent=rolled?'':'🦔';
 if(rolled){
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 140 140');
  const circle=document.createElementNS(ns,'circle');circle.setAttribute('cx','70');circle.setAttribute('cy','70');circle.setAttribute('r','61');circle.setAttribute('fill','#98734e');circle.setAttribute('stroke','#60462d');circle.setAttribute('stroke-width','3');svg.append(circle);
  for(let row=0;row<7;row++)for(let col=0;col<7;col++){
   const x=22+col*15+(row%2?7:0),y=24+row*15;if((x-70)**2+(y-70)**2>49**2)continue;
   const spike=document.createElementNS(ns,'path');spike.setAttribute('d',`M ${x-5} ${y+6} L ${x+2} ${y-7} L ${x+5} ${y+4}`);spike.setAttribute('fill','#c7ad87');spike.setAttribute('stroke','#63472e');spike.setAttribute('stroke-width','1.5');svg.append(spike);
  }
  get('enemy-hedgehog').append(svg);
 }

 get('enemy-shield-text').textContent=rolled?'Die Stacheln zeigen nach außen. Kopf und Bauch sind geschützt. Das hilft gegen viele Angreifer. Uhu und Dachs können trotzdem gefährlich werden. Vor Autos und Mährobotern schützt Einrollen nicht.':'Bei Gefahr kann sich der Igel zusammenrollen. Was passiert dann mit seinem Bauch und seinem Kopf?';
};
get('enemy-reset').onclick=()=>{assigned.clear();selected=null;render();get('enemy-feedback').textContent='Welche Tiere und Gefahren kennt ihr schon?';};
render();
