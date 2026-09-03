let camStream=null;
function stopCam(){ camStream?.getTracks()?.forEach(t=>t.stop()); camStream=null; state.scan.streamOn=false; }
async function startCam(){
  state.scan.error='';
  try{
    camStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}}});
    state.scan.streamOn=true; render();
    const v=document.getElementById('cam'); if(v){ v.srcObject=camStream; await v.play(); }
  }catch{ state.scan.error='No camera, or permission denied. Pick a photo or search by name.'; render(); }
}
function capture(){
  const v=document.getElementById('cam'); if(!v) return;
  const canvas=document.createElement('canvas'); canvas.width=v.videoWidth||720; canvas.height=v.videoHeight||960;
  canvas.getContext('2d').drawImage(v,0,0); state.scan.shot=canvas.toDataURL('image/jpeg',0.85); stopCam(); render();
}
async function lookup(){
  const q=(document.getElementById('q')?.value||state.scan.query||'Charizard').trim();
  state.scan.query=q; state.scan.busy=true; state.scan.error=''; render();
  const cards=await searchCards(q);
  state.scan.busy=false; state.scan.matches=cards; state.scan.selected=cards[0]||null; state.scan.finish=cards[0]?.best.label||'';
  if(!cards.length) state.scan.error='No cards named \u201c'+q+'\u201d.'; render();
}
function sendOffer(){
  const listing=state.trade.offerFor;
  const cards=state.store.binder.filter(c=>state.trade.picked.includes(c.id));
  const offer={id:uid(), listingId:listing.id, listingName:listing.name, listingImg:listing.img, owner:listing.owner, country:listing.country, offered:cards.map(c=>c.name), images:cards.map(c=>c.image), cash:Number(state.trade.cash)||0, message:state.trade.message, reply:'', status:'pending', at:Date.now()};
  state.store.offers.unshift(offer); save(); state.trade.offerFor=null; state.trade.picked=[]; state.trade.inbox=true; render();
  setTimeout(()=>{
    const roll=Math.random(), o=state.store.offers.find(x=>x.id===offer.id); if(!o) return;
    if(roll<0.55){ o.status='accepted'; o.reply="Deal. I'll sleeve it and ship with tracking this week."; }
    else if(roll<0.8){ o.status='countered'; o.reply='Close \u2014 can you add a little cash or a bulk holo?'; }
    else { o.status='declined'; o.reply='Going to pass on this one. Thanks for the offer.'; }
    save(); render();
  }, 4000+Math.random()*4000);
}
function bind(){
  const root=document.getElementById('app');
  root.onclick=async e=>{
    const tab=e.target.closest('[data-tab]');
    if(tab){ state.tab=tab.dataset.tab; if(state.tab!=='scan') stopCam(); render(); return; }
    const btn=e.target.closest('[data-act]'); if(!btn) return;
    const act=btn.dataset.act;
    if(act==='shutter'){ state.scan.streamOn?capture():startCam(); return; }
    if(act==='lookup'){ await lookup(); return; }
    if(act==='rescan'){ state.scan.selected=null; state.scan.matches=[]; state.scan.shot=null; render(); return; }
    if(act==='pick-match'){ const m=state.scan.matches[+btn.dataset.i]; state.scan.selected=m; state.scan.finish=m.best.label; render(); return; }
    if(act==='finish'){ state.scan.finish=btn.dataset.v; render(); return; }
    if(act==='cond'){ state.scan.condition=btn.dataset.v; render(); return; }
    if(act==='add'||act==='add-list'){ const card=state.scan.selected; const variant=card.variants.find(v=>v.label===state.scan.finish)||card.best;
      addToBinder(card,{market:variant.market,low:variant.low,high:variant.high,finish:variant.label,condition:state.scan.condition,quantity:state.scan.qty,listed:act==='add-list'}); return; }
    if(act==='bfilter'){ state.binder.filter=btn.dataset.v; render(); return; }
    if(act==='bopen'){ state.binder.open=btn.dataset.id; render(); return; }
    if(act==='binder-back'){ state.binder.open=null; render(); return; }
    if(act==='remove'){ state.store.binder=state.store.binder.filter(c=>c.id!==state.binder.open); state.binder.open=null; save(); render(); return; }
    if(act==='lopen'){ state.trade.open=btn.dataset.id; render(); return; }
    if(act==='trade-back'){ state.trade.open=null; render(); return; }
    if(act==='inbox'){ state.trade.inbox=true; render(); return; }
    if(act==='inbox-back'){ state.trade.inbox=false; render(); return; }
    if(act==='propose'){ state.trade.offerFor=state.store.listings.find(l=>l.id===state.trade.open); render(); return; }
    if(act==='offer-back'){ state.trade.offerFor=null; render(); return; }
    if(act==='toggle-pick'){ const id=btn.dataset.id; const p=state.trade.picked; state.trade.picked=p.includes(id)?p.filter(x=>x!==id):[...p,id]; render(); return; }
    if(act==='send-offer'){ sendOffer(); return; }
    if(act==='complete'){ const o=state.store.offers.find(x=>x.id===btn.dataset.id); if(o) o.status='completed'; save(); render(); return; }
    if(act==='tcountry'){ state.trade.country=btn.dataset.v; render(); return; }
  };
  root.oninput=e=>{
    if(e.target.id==='q') state.scan.query=e.target.value;
    if(e.target.id==='bq'){ state.binder.q=e.target.value; render(); const el=document.getElementById('bq'); if(el){ el.focus(); el.selectionStart=el.value.length; } }
    if(e.target.id==='tq'){ state.trade.q=e.target.value; render(); const el=document.getElementById('tq'); if(el){ el.focus(); el.selectionStart=el.value.length; } }
    if(e.target.id==='cash') state.trade.cash=e.target.value;
    if(e.target.id==='msg') state.trade.message=e.target.value;
    if(e.target.id==='pname'){ state.store.profile.name=e.target.value; save(); }
    if(e.target.id==='pcity'){ state.store.profile.city=e.target.value; save(); }
    if(e.target.id==='bcond'){ const c=state.store.binder.find(x=>x.id===state.binder.open); if(c){ c.condition=e.target.value; save(); render(); } }
    if(e.target.id==='blist'){ const c=state.store.binder.find(x=>x.id===state.binder.open); if(c){ c.listed=e.target.checked; save(); } }
  };
  root.onchange=e=>{
    if(e.target.id==='pcountry'){ state.store.profile.country=e.target.value; save(); render(); }
    if(e.target.id==='file'){ const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=()=>{ state.scan.shot=String(reader.result); stopCam(); render(); }; reader.readAsDataURL(file); }
  };
  root.onkeydown=e=>{ if(e.key==='Enter' && e.target.id==='q') lookup(); };
}
function render(){
  const p=pending();
  document.getElementById('app').innerHTML='<div class="screen">'+(state.tab==='scan'?renderScan():state.tab==='binder'?renderBinder():state.tab==='trade'?renderTrade():renderYou())+'</div><nav class="tabbar"><button class="tab '+(state.tab==='scan'?'on':'')+'" data-tab="scan"><span class="ico">⌖</span>Scan</button><button class="tab '+(state.tab==='binder'?'on':'')+'" data-tab="binder"><span class="ico">▣</span>Binder</button><button class="tab '+(state.tab==='trade'?'on':'')+'" data-tab="trade"><span class="ico">🌐'+(p?'<span class="badge">'+p+'</span>':'')+'</span>Trade</button><button class="tab '+(state.tab==='you'?'on':'')+'" data-tab="you"><span class="ico">☺</span>You</button></nav>';
  bind();
  if(state.tab==='scan' && state.scan.streamOn && !state.scan.selected){ const v=document.getElementById('cam'); if(v&&camStream) v.srcObject=camStream; }
}
render();
