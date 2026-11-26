// Approximate traditional RYB pigment mixing, independent of drawing tools.
// White background is neutral; applied white pigment lightens existing colors.
export function rgbToRyb(r,g,b) {
  const white=Math.min(r,g,b); r-=white; g-=white; b-=white;
  const max=Math.max(r,g,b); let y=Math.min(r,g); r-=y; g-=y;
  if(b>0 && g>0){b/=2;g/=2;}
  y+=g;b+=g; const m=Math.max(r,y,b);
  if(m){const n=max/m;r*=n;y*=n;b*=n;}
  return [r+white,y+white,b+white];
}
export function rybToRgb(r,y,b) {
  const white=Math.min(r,y,b);r-=white;y-=white;b-=white;
  const max=Math.max(r,y,b);let g=Math.min(y,b);y-=g;b-=g;
  if(b>0 && g>0){b*=2;g*=2;}
  r+=y;g+=y;const m=Math.max(r,g,b);
  if(m){const n=max/m;r*=n;g*=n;b*=n;}
  return [r+white,g+white,b+white];
}
export function mixPigments(a,b) {
  if(a.every((v,i)=>v===b[i])) return a;
  if(a.every(v=>v===255)) return b;
  // a is the existing pixel; b is the newly applied pigment.
  if(b.every(v=>v===255)) return a.map(v=>Math.round((v+255)/2));
  // Mix chromatic pigment channels, retaining the mean brightness range.
  const p=rgbToRyb(...a),q=rgbToRyb(...b);
  const m=p.map((v,i)=>(v+q[i])/2);
  const target=(Math.max(...p)+Math.max(...q))/2;
  const peak=Math.max(...m), low=Math.min(...m);
  if(peak>low){for(let i=0;i<3;i++)m[i]=low+(m[i]-low)*(target-low)/(peak-low);}
  return rybToRgb(...m).map(v=>Math.max(0,Math.min(255,Math.round(v))));
}
// Replace only the shape's covered pixels with their mixed color. The same
// overlay is used for preview and commit, preserving undo and transparency.
export function mixShapeOverlay(base,overlay,x=0,y=0,w=overlay.width,h=overlay.height) {
  const left=Math.max(0,Math.floor(x)),top=Math.max(0,Math.floor(y));
  const right=Math.min(overlay.width,Math.ceil(x+w)),bottom=Math.min(overlay.height,Math.ceil(y+h));
  if(right<=left||bottom<=top)return;
  const ctx=overlay.ctx, src=ctx.getImageData(left,top,right-left,bottom-top);
  const dst=base.getImageData(left,top,right-left,bottom-top).data;
  const d=src.data, cache=new Map();
  for(let i=0;i<d.length;i+=4){
    if(!d[i+3]||!dst[i+3])continue;
    const key=`${dst[i]},${dst[i+1]},${dst[i+2]},${d[i]},${d[i+1]},${d[i+2]}`;
    let c=cache.get(key);
    if(!c){c=mixPigments([dst[i],dst[i+1],dst[i+2]],[d[i],d[i+1],d[i+2]]);if(cache.size<8192)cache.set(key,c);}
    const a=dst[i+3]/255;
    for(let j=0;j<3;j++)d[i+j]=d[i+j]*(1-a)+c[j]*a;
  }
  ctx.putImageData(src,left,top);
}
