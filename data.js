const CONDITIONS = [
  {id:'NM', title:'Near Mint', multiplier:1},
  {id:'LP', title:'Lightly Played', multiplier:.85},
  {id:'MP', title:'Moderately Played', multiplier:.65},
  {id:'HP', title:'Heavily Played', multiplier:.45},
  {id:'DMG', title:'Damaged', multiplier:.25},
];
const COUNTRIES = [
  ['US','United States','🇺🇸'],['JP','Japan','🇯🇵'],['GB','United Kingdom','🇬🇧'],['NL','Netherlands','🇳🇱'],
  ['DE','Germany','🇩🇪'],['FR','France','🇫🇷'],['CA','Canada','🇨🇦'],['AU','Australia','🇦🇺'],
  ['KR','South Korea','🇰🇷'],['IT','Italy','🇮🇹'],['ES','Spain','🇪🇸'],['BR','Brazil','🇧🇷'],
  ['MX','Mexico','🇲🇽'],['SG','Singapore','🇸🇬'],['AE','United Arab Emirates','🇦🇪'],
];
const flag = c => COUNTRIES.find(x=>x[0]===c)?.[2] ?? '🌍';
const countryName = c => COUNTRIES.find(x=>x[0]===c)?.[1] ?? c;
const money = n => (n==null||Number.isNaN(n)) ? '—' : new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const compact = n => n>=1000 ? `$${(n/1000).toFixed(1)}k` : n>=100 ? `$${Math.round(n)}` : money(n);
const uid = () => crypto.randomUUID();
const adjusted = card => (CONDITIONS.find(c=>c.id===card.condition)?.multiplier ?? 1) * (card.market||0) * (card.quantity||1);

const LOCAL = [
  {id:'sv3pt5-199', name:'Charizard ex', setName:'151', setId:'sv3pt5', number:'199', printedTotal:165, rarity:'Special Illustration Rare', market:280, low:220, mid:275, high:400, finish:'Holofoil'},
  {id:'base1-4', name:'Charizard', setName:'Base', setId:'base1', number:'4', printedTotal:102, rarity:'Rare Holo', market:4200, low:2800, mid:4100, high:9000, finish:'Unlimited Holo'},
  {id:'sv3pt5-6', name:'Charizard', setName:'151', setId:'sv3pt5', number:'6', printedTotal:165, rarity:'Rare Holo', market:18, low:12, mid:17, high:35, finish:'Holofoil'},
  {id:'swsh7-215', name:'Umbreon VMAX', setName:'Evolving Skies', setId:'swsh7', number:'215', printedTotal:203, rarity:'Rare Rainbow', market:420, low:340, mid:410, high:650, finish:'Holofoil'},
  {id:'base1-58', name:'Pikachu', setName:'Base', setId:'base1', number:'58', printedTotal:102, rarity:'Common', market:8, low:3, mid:7, high:25, finish:'Normal'},
  {id:'sv2-215', name:'Gardevoir ex', setName:'Paldea Evolved', setId:'sv2', number:'215', printedTotal:193, rarity:'Special Illustration Rare', market:110, low:80, mid:105, high:180, finish:'Holofoil'},
  {id:'base1-2', name:'Blastoise', setName:'Base', setId:'base1', number:'2', printedTotal:102, rarity:'Rare Holo', market:280, low:180, mid:260, high:600, finish:'Unlimited Holo'},
].map(c => ({
  ...c,
  imageSmall:`https://images.pokemontcg.io/${c.setId}/${c.number}.png`,
  imageLarge:`https://images.pokemontcg.io/${c.setId}/${c.number}_hires.png`,
  variants:[{label:c.finish, market:c.market, low:c.low, mid:c.mid, high:c.high}],
  best:{label:c.finish, market:c.market, low:c.low, mid:c.mid, high:c.high},
}));

const SEED = [
  {id:'l1', owner:'Hana K.', city:'Tokyo', country:'JP', rating:4.9, apiId:'swsh7-215', name:'Umbreon VMAX', set:'Evolving Skies', number:'215', total:203, rarity:'Rare Rainbow', img:'https://images.pokemontcg.io/swsh7/215.png', market:420, asking:400, finish:'Holofoil', condition:'NM', wants:'Moonbreon, Base Charizard', note:'Tracked shipping from Japan. Prefer NM only.'},
  {id:'l2', owner:'Marcus W.', city:'Austin', country:'US', rating:4.8, apiId:'sv3pt5-199', name:'Charizard ex', set:'151', number:'199', total:165, rarity:'Special Illustration Rare', img:'https://images.pokemontcg.io/sv3pt5/199.png', market:280, asking:265, finish:'Holofoil', condition:'NM', wants:'151 SIR, Iono SIR', note:'USPS Priority. Open to cash on top.'},
  {id:'l3', owner:'Elena V.', city:'Madrid', country:'ES', rating:4.7, apiId:'base1-4', name:'Charizard', set:'Base', number:'4', total:102, rarity:'Rare Holo', img:'https://images.pokemontcg.io/base1/4.png', market:4200, asking:3900, finish:'Unlimited Holo', condition:'LP', wants:'Vintage holos, Fossil set', note:'EU shipping with tracking.'},
  {id:'l4', owner:'Jun Park', city:'Seoul', country:'KR', rating:5.0, apiId:'sv3pt5-6', name:'Charizard', set:'151', number:'6', total:165, rarity:'Rare Holo', img:'https://images.pokemontcg.io/sv3pt5/6.png', market:18, asking:16, finish:'Holofoil', condition:'NM', wants:'Japanese 151', note:'Sleeved + toploader always.'},
  {id:'l5', owner:'Amelia C.', city:'London', country:'GB', rating:4.6, apiId:'swsh12pt5gg-GG68', name:'Umbreon VMAX', set:'Crown Zenith', number:'GG68', total:70, rarity:'Trainer Gallery', img:'https://images.pokemontcg.io/swsh12pt5gg/GG68.png', market:95, asking:90, finish:'Holofoil', condition:'NM', wants:'Paldea Evolved IRs', note:'Royal Mail tracked.'},
  {id:'l6', owner:'Luca B.', city:'Milan', country:'IT', rating:4.8, apiId:'sv2-215', name:'Gardevoir ex', set:'Paldea Evolved', number:'215', total:193, rarity:'Special Illustration Rare', img:'https://images.pokemontcg.io/sv2/215.png', market:110, asking:105, finish:'Holofoil', condition:'NM', wants:'Charizard VMAX, Umbreon VMAX', note:'Will add cash to even a deal.'},
  {id:'l7', owner:'Sofia R.', city:'São Paulo', country:'BR', rating:4.5, apiId:'base1-58', name:'Pikachu', set:'Base', number:'58', total:102, rarity:'Common', img:'https://images.pokemontcg.io/base1/58.png', market:8, asking:7, finish:'Normal', condition:'LP', wants:'Vintage Pikachu', note:'International only with tracking.'},
  {id:'l8', owner:'Noah T.', city:'Toronto', country:'CA', rating:4.9, apiId:'sv4-199', name:'Iono', set:'Paradox Rift', number:'199', total:182, rarity:'Special Illustration Rare', img:'https://images.pokemontcg.io/sv4/199.png', market:85, asking:80, finish:'Holofoil', condition:'NM', wants:'Gengar, Dragapult', note:'Canada Post tracked.'},
  {id:'l15', owner:'Lars N.', city:'Amsterdam', country:'NL', rating:4.8, apiId:'sm12-247', name:'Reshiram & Charizard-GX', set:'Cosmic Eclipse', number:'247', total:236, rarity:'Rare Rainbow', img:'https://images.pokemontcg.io/sm12/247.png', market:130, asking:120, finish:'Holofoil', condition:'NM', wants:'Modern SIRs', note:'EU-friendly. Fast replies.'},
];
