// Awesome Paint: independent appearance settings, without changing the drawing engine.
import { get_theme, set_theme } from './theme.js';
const key = 'awesome-paint-appearance-v1';
const defaults = { surface:'#c0c0c0', text:'#174a8b', accent:'#2563eb', font:'Calibri', size:14 };
const fonts = ['Segoe UI','Arial','Tahoma','Verdana','Calibri','Courier New'];
let profiles = {};
try { profiles = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) {}
const root = document.documentElement;
// Icon sizing is independent of custom colors and applies across themes.
const iconKey = 'awesome-paint-icon-size';
let iconSize = 'normal';
try { iconSize = localStorage.getItem(iconKey) || 'normal'; } catch (_) {}
function applyIconSize(value) {
 iconSize = ['normal','medium','large'].includes(value) ? value : 'normal';
 root.dataset.apIconSize = iconSize;
 try { localStorage.setItem(iconKey, iconSize); } catch (_) {}
}
applyIconSize(iconSize);
const vars = ['--ap-surface','--ap-text','--ap-accent','--ap-accent-text','--ap-font','--ap-size'];
function contrast(hex) { const rgb = hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4); return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2] > .179 ? '#000000':'#ffffff'; }
function apply(p) {
 root.classList.toggle('ap-custom', !!p);
 vars.forEach(v=>root.style.removeProperty(v));
 if (!p) return;
 const c = {...defaults,...p};
 for (const k of ['surface','text','accent']) if (!/^#[0-9a-f]{6}$/i.test(c[k])) c[k]=defaults[k];
 const values=[c.surface,c.text,c.accent,contrast(c.accent),fonts.includes(c.font)?`"${c.font}", sans-serif`:'sans-serif',`${Math.max(10,Math.min(18,Number(c.size)||14))}px`];
 vars.forEach((v,i)=>root.style.setProperty(v,values[i]));
}
function save(){try{localStorage.setItem(key,JSON.stringify(profiles));}catch(_){}}
function refresh(){apply(profiles[get_theme()]);}
$(window).on('theme-load',refresh);
refresh();
let openDialog;
export function openAppearance() {
 if (!openDialog) installAppearance();
 openDialog();
}
function installAppearance() {
 const dialog=document.createElement('dialog'); dialog.className='ap-dialog';
 dialog.innerHTML=`<form method="dialog"><h2>Apariencia de Awesome Paint</h2><label>Modo <select name="mode"><option value="classic.css">Clásico</option><option value="dark.css">Clásico oscuro</option><option value="modern.css">Moderno claro</option><option value="modern-dark.css">Moderno oscuro</option><option value="winter.css">Invierno</option><option value="occult.css">Oculto</option><option value="bubblegum.css">Chicle</option></select></label><label>Tamaño de los íconos <select name="iconSize"><option value="normal">Normal</option><option value="medium">Mediano</option><option value="large">Grande</option></select></label><label><span>Personalizar colores y texto</span><input type="checkbox" name="custom"></label><fieldset><label>Fondo de interfaz y menús <input type="color" name="surface"></label><label>Color del texto <input type="color" name="text"></label><label>Color de resaltado y título <input type="color" name="accent"></label><label>Tipografía <select name="font">${fonts.map(f=>`<option>${f}</option>`).join('')}</select></label><label>Tamaño del texto <input type="number" name="size" min="10" max="18" step="1"></label></fieldset><div class="ap-actions"><button type="button" name="reset">Restaurar tema</button><button type="submit">Cerrar</button></div></form>`;
 document.body.append(dialog);
 const form=dialog.querySelector('form'), e=form.elements, fields=form.querySelector('fieldset');
 function sync(){e.iconSize.value=iconSize; e.mode.value=get_theme(); const p=profiles[get_theme()]; const c={...defaults,...p}; e.custom.checked=!!p; fields.disabled=!p; for(const k of Object.keys(defaults))e[k].value=c[k];}
 openDialog=()=>{sync();if(!dialog.open)dialog.showModal();};
 form.addEventListener('input',ev=>{if(ev.target===e.mode || ev.target===e.iconSize)return; const mode=get_theme(); if(e.custom.checked){profiles[mode]=Object.fromEntries(Object.keys(defaults).map(k=>[k,e[k].value]));}else delete profiles[mode]; fields.disabled=!e.custom.checked; save();refresh();});
 e.iconSize.addEventListener('change',()=>applyIconSize(e.iconSize.value));
 e.mode.addEventListener('change',()=>{set_theme(e.mode.value);sync();});
 e.reset.addEventListener('click',()=>{delete profiles[get_theme()];save();refresh();sync();});
 // Keep editor shortcuts from acting on settings inputs.
 for(const event of ['keydown','keyup','keypress']) dialog.addEventListener(event,e=>e.stopPropagation());
}
