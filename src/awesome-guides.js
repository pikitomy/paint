// Non-destructive perspective guides, in document coordinates.
let mode=0, visible=true, lines=[], horizon=null, points=[], drag=null;
let refresh=()=>{}, sync=()=>{};
export function clearGuides(){lines=[];horizon=null;points=[];drag=null;refresh();}
export function toggleGuides(){visible=!visible;sync();refresh();}
export function drawGuides(ctx,scale,x,y,w,h){
 if(!visible)return;
 ctx.save();ctx.scale(scale,scale);ctx.translate(-x,-y);
 ctx.lineWidth=1/scale;ctx.setLineDash([5/scale,3/scale]);
 function line(a,b,color){ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
 if(horizon!==null)line({x:0,y:horizon},{x:w,y:horizon},'#e34b4b');
 for(const p of points){if(!p)continue;for(let i=0;i<=8;i++){line(p,{x:i*w/8,y:0},'#3989d5');line(p,{x:i*w/8,y:h},'#3989d5');line(p,{x:0,y:i*h/8},'#3989d5');line(p,{x:w,y:i*h/8},'#3989d5');}ctx.fillStyle='#e34b4b';ctx.beginPath();ctx.arc(p.x,p.y,4/scale,0,Math.PI*2);ctx.fill();}
 for(const l of lines)line(l.a,l.b,'#3989d5');
 if(drag?.kind==='line')line(drag.a,drag.b,'#3989d5');
 ctx.restore();
}
export function createGuideTool(update){
 refresh=update;
 const $options=$('<div>').css({display:'flex',flexDirection:'column',gap:'3px',width:'94%'});
 const buttons=[];
 const labels=['Línea libre','Horizonte','1 punto','2 puntos','3 puntos'];
 labels.forEach((label,i)=>{const b=$('<button type="button">').text(label).attr('title',label).css({fontSize:'10px',padding:'3px 0'}).appendTo($options);buttons.push(b);b.on('click',()=>{mode=i;visible=true;drag=null;if(i>=2){points=points.slice(0,i-1);}sync();refresh();});});
 const $eye=$('<button type="button">').appendTo($options).on('click',toggleGuides);
 $('<button type="button">Limpiar guías</button>').css('font-size','10px').appendTo($options).on('click',clearGuides);
 sync=()=>{buttons.forEach((b,i)=>b.attr('aria-pressed',String(mode===i)).css('font-weight',mode===i?'bold':'normal'));$eye.text(visible?'Ocultar guías':'Mostrar guías').css('font-size','10px');};sync();
 function move(x,y){if(!drag)return;if(drag.kind==='line')drag.b={x,y};else if(drag.kind==='horizon'){horizon=y;points.slice(0,2).forEach(p=>{if(p)p.y=y;});}else{const p=points[drag.index];p.x=x;p.y=drag.index<2?horizon:y;}refresh();}
 return {id:'TOOL_GUIDES',name:'Guías de perspectiva',description:'Dibuja guías auxiliares sin modificar la imagen.',cursor:['precise',[16,16],'crosshair'],help_icon:'awesome-emoji.svg',$options,
 pointerdown(_ctx,x,y){visible=true;sync();if(mode===0)drag={kind:'line',a:{x,y},b:{x,y}};else if(mode===1)drag={kind:'horizon'};else{const count=mode-1;let index=points.findIndex(p=>p&&Math.hypot(p.x-x,p.y-y)<12);if(index<0){index=points.length<count?points.length:points.reduce((best,p,i)=>Math.hypot(p.x-x,p.y-y)<Math.hypot(points[best].x-x,points[best].y-y)?i:best,0);}if(horizon===null)horizon=y;points[index]={x,y:index<2?horizon:y};drag={kind:'point',index};}move(x,y);},
 paint(_ctx,x,y){move(x,y);},pointerup(_ctx,x,y){if(!drag)return;move(x,y);if(drag.kind==='line')lines.push({a:drag.a,b:drag.b});drag=null;refresh();},cancel(){drag=null;refresh();}};
}
