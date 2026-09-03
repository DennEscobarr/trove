const STORAGE = 'trove.iphone.v1';
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE) || '{}');
    return {
      binder: raw.binder ?? [],
      listings: raw.listings ?? SEED.map(l => ({...l})),
      offers: raw.offers ?? [],
      profile: raw.profile ?? {name:'Denn', city:'', country:'NL', bio:'Scanning cards and hunting fair trades.'},
    };
  } catch {
    return {binder:[], listings:SEED.map(l=>({...l})), offers:[], profile:{name:'Denn', city:'', country:'NL', bio:''}};
  }
}
const state = { tab:'scan', store:load(), scan:{query:'', busy:false, error:'', matches:[], selected:null, finish:'', condition:'NM', qty:1, shot:null, streamOn:false}, trade:{q:'', country:'ALL', open:null, inbox:false, offerFor:null, picked:[], cash:'', message:'Fair trade — photos on request, tracked shipping.'}, binder:{q:'', filter:'all', open:null} };
function save(){ localStorage.setItem(STORAGE, JSON.stringify(state.store)); }
function h(s){ return String(s??'').replace(/[&<>"']/g, c=>({'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'}[c])); }
async function searchCards(name){
  const q = name.trim();
  if(q.length<2) return [];
  try {
    const res = await fetch('https://api.pokemontcg.io/v2/cards?q=name:"' + encodeURIComponent(q) + '"&pageSize=12', {signal:AbortSignal.timeout(5000)});
    if(res.ok){
      const json = await res.json();
      const cards = (json.data||[]).map(raw=>{
        const p = raw.tcgplayer?.prices || {};
        const order = [['holofoil','Holofoil'],['unlimitedHolofoil','Unlimited Holo'],['reverseHolofoil','Reverse Holo'],['1stEditionHolofoil','1st Edition Holo'],['normal','Normal']];
        const variants = order.filter(([k])=>p[k] && (p[k].market||p[k].mid||p[k].low)).map(([k,label])=>({label, market:p[k].market??p[k].mid??0, low:p[k].low??0, mid:p[k].mid??0, high:p[k].high??0}));
        const best = variants[0] || {label:'Normal', market:raw.cardmarket?.prices?.averageSellPrice??0, low:0, mid:0, high:0};
        return {id:raw.id, name:raw.name, setName:raw.set?.name||'', number:raw.number, printedTotal:raw.set?.printedTotal||raw.set?.total||0, rarity:raw.rarity||'', imageSmall:raw.images?.small||'', imageLarge:raw.images?.large||'', variants:variants.length?variants:[best], best};
      });
      if(cards.length) return cards;
    }
  } catch {}
  const low = q.toLowerCase();
  return LOCAL.filter(c => c.name.toLowerCase().includes(low) || low.includes(c.name.toLowerCase().split(' ')[0]));
}
function addToBinder(card, extra){
  const owned = {id:uid(), apiId:card.id, name:card.name, setName:card.setName, number:card.number, printedTotal:card.printedTotal, rarity:card.rarity, image:card.imageSmall, imageLarge:card.imageLarge, market:extra.market, low:extra.low, high:extra.high, finish:extra.finish, condition:extra.condition, quantity:extra.quantity, listed:extra.listed, notes:''};
  if(extra.listed){
    state.store.listings.unshift({id:uid(), owner:state.store.profile.name, city:state.store.profile.city, country:state.store.profile.country, rating:5, apiId:card.id, name:card.name, set:card.setName, number:card.number, total:card.printedTotal, rarity:card.rarity, img:card.imageSmall, market:extra.market, asking:adjusted(owned), finish:extra.finish, condition:extra.condition, wants:'Fair trades near ' + money(adjusted(owned)), note:'Listed from my binder.', local:true});
  }
  state.store.binder.unshift(owned);
  save();
  state.tab='binder'; state.scan.selected=null; state.scan.matches=[];
  render();
}
function pending(){ return state.store.offers.filter(o=>o.status==='pending'||o.status==='countered').length; }
