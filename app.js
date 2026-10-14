'use strict';
const $=id=>document.getElementById(id),data=window.REPUESTOS;
const fmt=n=>new Intl.NumberFormat('es-CL',{maximumFractionDigits:2}).format(n);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const steps=[
 {label:'Demanda',title:'Unidades y pedidos responden preguntas distintas',message:'4.459 unidades se abastecen en 974 pedidos. La cantidad por intervención determina cuántas unidades contiene cada pedido.',measure:'demand',scenario:'a',team:'all',view:'analysis'},
 {label:'Impacto A',title:'La bomba de agua encabeza la lectura A',message:'Si el tiempo corresponde a la intervención completa, la bomba de agua acumula $5.923.200 de pérdida asociada anual.',measure:'loss',scenario:'a',team:'all',view:'analysis'},
 {label:'Impacto B',title:'La tuerca pasa al primer lugar en la lectura B',message:'Si el tiempo corresponde a cada unidad, las 34 tuercas por intervención elevan su pérdida asociada a $29.127.375 al año.',measure:'loss',scenario:'b',team:'all',view:'analysis'},
 {label:'Equipo 2',title:'El rodillo domina el tiempo del Equipo 2',message:'Con la lectura B, 45 rodillos por intervención y 15 intervenciones generan 13.500 minutos anuales. El filtro cambia el conjunto de comparación.',measure:'time',scenario:'b',team:'Equipo 2',view:'analysis'},
 {label:'Reposición',title:'Cada ciclo muestra consumo y reposición',message:'La bomba de agua utiliza un lote de una unidad y 20 pedidos anuales. El ciclo ideal dura 0,6 meses. Es un modelo didáctico.',measure:'loss',scenario:'a',team:'all',view:'cycle-section',component:'Bomba de Agua'},
 {label:'Costos',title:'El subtotal de compra todavía está incompleto',message:'USD 178.345 corresponden a 43 componentes con precio. Falta incorporar 24 ventiladores y completar las bases del costo de gestión y bodega.',measure:'loss',scenario:'a',team:'all',view:'cost-section'},
 {label:'Conclusión',title:'Cuatro componentes aparecen en ambos grupos prioritarios',message:'Bomba de agua, sensor de temperatura, resistencia y unión omega permanecen entre los cinco de mayor pérdida. Conviene revisar su abastecimiento mientras se aclaran los datos pendientes.',measure:'loss',scenario:'a',team:'all',view:'analysis'}
];
let step=0,view='analysis',manual=false;
for(const team of [...new Set(data.map(x=>x.e))].sort())$('team').add(new Option(team,team));
for(const x of [...data].sort((a,b)=>a.name.localeCompare(b.name,'es')))$('component').add(new Option(x.name,x.name));
$('steps').innerHTML=steps.map((x,i)=>`<button type="button" data-step="${i}">${String(i+1).padStart(2,'0')} ${x.label}</button>`).join('');
function current(){const a=$('scenario').value;return{rows:data.filter(x=>$('team').value==='all'||x.e===$('team').value),time:'t'+a,loss:'l'+a,key:$('measure').value==='loss'?'l'+a:$('measure').value==='time'?'t'+a:'d',unit:$('measure').value==='loss'?'CLP/año':$('measure').value==='time'?'min/año':'unidades/año'};}
function render(){const{rows,time,loss,key,unit}=current(),sum=k=>rows.reduce((n,x)=>n+x[k],0),sorted=[...rows].sort((a,b)=>b[key]-a[key]||a.name.localeCompare(b.name,'es')),top=sorted.slice(0,10),max=top[0]?.[key]||1;
 $('demand').textContent=fmt(sum('d'));$('orders').textContent=fmt(sum('f'))+' pedidos anuales';$('time').textContent=fmt(sum(time));$('loss').textContent='$'+fmt(sum(loss));
 $('filter-summary').textContent=(manual?'Exploración libre · ':'Recorrido guiado · ')+rows.length+' componentes · '+($('team').value==='all'?'todos los equipos':$('team').value)+' · lectura '+$('scenario').value.toUpperCase();
 $('view-title').textContent=view==='cycle-section'?'Consumo y reposición':view==='cost-section'?'Compra y gestión':{loss:'Impacto económico',time:'Tiempo de intervención',demand:'Demanda anual'}[$('measure').value];
 $('unit').textContent=unit;$('ranking-title').textContent='Los '+top.length+' componentes de mayor '+{loss:'pérdida',time:'detención',demand:'demanda'}[$('measure').value];
 $('ranking').innerHTML=top.map((x,i)=>`<div class="rank-row"><button class="rank-label" data-component="${esc(x.name)}" aria-label="Ver consumo de ${esc(x.name)}">${i+1}. ${esc(x.name)}</button><div class="track" aria-hidden="true"><i style="width:${100*x[key]/max}%"></i></div><span class="rank-value">${fmt(x[key])}</span></div>`).join('');
 const five=sorted.slice(0,5).reduce((n,x)=>n+x[key],0);$('concentration').textContent=`Los ${Math.min(5,rows.length)} primeros concentran ${fmt(five/sum(key)*100)}% del indicador filtrado. Selecciona un componente para ver su consumo.`;
 const mk=$('measure').value,va=sum(mk==='loss'?'la':mk==='time'?'ta':'d'),vb=sum(mk==='loss'?'lb':mk==='time'?'tb':'d'),mx=Math.max(va,vb,1);
 $('compare-a').textContent=fmt(va);$('compare-b').textContent=fmt(vb);$('compare-unit').textContent=unit;$('compare-a-bar').style.width=100*va/mx+'%';$('compare-b-bar').style.width=100*vb/mx+'%';
 const groups=[...new Set(rows.map(x=>x.e))].map(e=>({e,n:rows.filter(x=>x.e===e).reduce((v,x)=>v+x[key],0)})),gm=Math.max(...groups.map(x=>x.n),1);
 $('teams-chart').innerHTML=groups.map(x=>`<div class="team-row"><div><span>${esc(x.e)}</span><span>${fmt(x.n)}</span></div><div class="track"><i style="width:${100*x.n/gm}%"></i></div></div>`).join('');
 $('data-table').innerHTML=sorted.map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.e)}</td><td>${fmt(x.d)}</td><td>${fmt(x.f)}</td><td>${fmt(x[time])}</td><td>${fmt(x[loss])}</td><td>${x.price===null?'Pendiente':fmt(x.price*x.d)}</td></tr>`).join('');
 const missing=rows.filter(x=>x.price===null);$('purchase').textContent='USD '+fmt(rows.reduce((n,x)=>n+(x.price===null?0:x.price*x.d),0));$('missing').textContent=missing.length?'Subtotal filtrado: falta '+missing.map(x=>fmt(x.d)+' unidades de '+x.name.toLowerCase()).join(', ')+'.':'Todos los precios de compra del filtro están disponibles; el costo total de stock sigue pendiente.';
 $('workload').innerHTML=[['Compra','hbuy'],['Descarga y almacenamiento','hunload'],['Inspección','hinspect']].map(([n,k])=>`<div><dt>${n}</dt><dd>${fmt(sum(k))} h/año</dd></div>`).join('');
 for(const id of ['analysis','cycle-section','cost-section'])$(id).hidden=view!==id;
 if(view==='cycle-section')drawCycle();
}
function drawCycle(){const x=data.find(x=>x.name===$('component').value);if(!x)return;const filtered=$('team').value==='all'||$('team').value===x.e;if(!filtered){const a=data.find(x=>x.e===$('team').value);$('component').value=a.name;return drawCycle();}
 $('cycle-meta').textContent=x.name+' · '+x.e+' · lote '+fmt(x.q)+' un. · '+fmt(x.f)+' pedidos/año · ciclo '+fmt(12/x.f)+' meses';
 const w=Math.max(300,$('cycle').clientWidth),h=280,l=55,r=w-25,t=25,b=230;let pts=[];for(let k=0;k<x.f;k++)pts.push(`${l+(r-l)*k/x.f},${t}`,`${l+(r-l)*(k+1)/x.f},${b}`);
 $('cycle').innerHTML=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Inventario de ${esc(x.name)}: ${x.f} ciclos al año de ${x.q} unidades"><path d="M${l} ${t}V${b}H${r}" fill="none" stroke="#b4c4c6"/><polyline points="${pts.join(' ')}" fill="none" stroke="#007b78" stroke-width="2"/>${[0,3,6,9,12].map(m=>`<text x="${l+(r-l)*m/12}" y="252" text-anchor="middle">${m}</text>`).join('')}<text x="${l-10}" y="${t+5}" text-anchor="end">${fmt(x.q)}</text><text x="${l-10}" y="${b}" text-anchor="end">0</text><text x="${w/2}" y="275" text-anchor="middle">Meses</text><text x="10" y="15">Unidades</text></svg>`;
}
function go(i){step=Math.max(0,Math.min(steps.length-1,i));const x=steps[step];manual=false;view=x.view;$('team').value=x.team;$('scenario').value=x.scenario;$('measure').value=x.measure;if(x.component)$('component').value=x.component;$('step-count').textContent=String(step+1).padStart(2,'0')+' / 07';$('step-title').textContent=x.title;$('step-message').textContent=x.message;$('prev').disabled=step===0;$('next').disabled=step===steps.length-1;document.querySelectorAll('[data-step]').forEach(b=>{if(Number(b.dataset.step)===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});render();}
$('steps').addEventListener('click',e=>{const b=e.target.closest('[data-step]');if(b)go(Number(b.dataset.step));});$('prev').onclick=()=>go(step-1);$('next').onclick=()=>go(step+1);$('reset').onclick=()=>go(0);
for(const id of ['team','scenario','measure'])$(id).addEventListener('change',()=>{manual=true;view='analysis';$('step-title').textContent='Exploración libre de los datos';$('step-message').textContent='Todos los resultados responden al filtro activo. Selecciona un paso del recorrido para recuperar su configuración y explicación.';document.querySelectorAll('[data-step]').forEach(b=>b.removeAttribute('aria-current'));render();});
$('ranking').addEventListener('click',e=>{const b=e.target.closest('[data-component]');if(b){$('component').value=b.dataset.component;view='cycle-section';manual=true;render();}});$('component').onchange=drawCycle;
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('fullscreen').textContent='Usa F11 para ampliar';}};
document.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes(document.activeElement?.tagName)||e.ctrlKey||e.altKey||e.metaKey)return;if(e.key==='ArrowRight'){e.preventDefault();go(step+1);}if(e.key==='ArrowLeft'){e.preventDefault();go(step-1);}});
new ResizeObserver(()=>{if(view==='cycle-section')drawCycle();}).observe($('cycle'));
go(0);
