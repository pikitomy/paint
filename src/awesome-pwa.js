// Offline preparation status, independent of the editor's UI.
if ('serviceWorker' in navigator && window.isSecureContext) {
 window.addEventListener('load', async () => {
  const box=document.createElement('div');
  box.style.cssText='position:fixed;right:12px;bottom:40px;z-index:99999;background:#fff;color:#222;border:1px solid #777;padding:12px;max-width:320px;font:13px Arial;box-shadow:0 2px 8px #0004';
  box.setAttribute('role','status');
  const label=document.createElement('div'), bar=document.createElement('progress'), close=document.createElement('button');
  bar.style.cssText='width:100%;margin:8px 0';close.textContent='Cerrar';close.hidden=true;close.onclick=()=>box.remove();
  box.append(label,bar,close);document.body.append(box);label.textContent='Preparando Awesome Paint sin conexión…';
  let reg;
  function update(e){const d=e.data||{};if(d.type==='AP_PROGRESS'){bar.max=d.total;bar.value=d.done;label.textContent=`Descargando recursos: ${d.done} de ${d.total} (${Math.floor(d.done/d.total*100)}%). No cierres la aplicación.`;}
   if(d.type==='AP_READY'){bar.max=1;bar.value=1;label.textContent='Todos los recursos descargados. Disponible sin conexión cuando se active esta versión.';close.hidden=false;}
   if(d.type==='AP_ERROR'){label.textContent='No se completó la descarga. Recargá con Internet para reintentar. '+d.message;close.hidden=false;}}
  navigator.serviceWorker.addEventListener('message',update);
  try{reg=await navigator.serviceWorker.register('./sw.js');
   const worker=reg.installing||reg.waiting||reg.active;worker?.postMessage({type:'AP_STATUS'});
   reg.addEventListener('updatefound',()=>reg.installing?.postMessage({type:'AP_STATUS'}));
   if(navigator.storage?.persist) navigator.storage.persist().catch(()=>{});
  }catch(e){update({data:{type:'AP_ERROR',message:String(e)}});}
 });
}
