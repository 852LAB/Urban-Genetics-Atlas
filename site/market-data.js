/* Urban Genetics Atlas — compact market browser delivery + market analysis */
'use strict';
const MARKET_PIPELINE_VERSION = 'market-v1.3';
const MARKET_ANALYSIS_VERSION = 'market-analysis-v1.0';
const MARKET_R2_BASE = 'https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev';
const MARKET_LOCAL_URL = './data/market/site/market-context.json';
const MARKET_REMOTE_URL = `${MARKET_R2_BASE}/market/latest/market-context.json`;

let marketContext = null;
let marketContextUrl = null;
let selectedMarketFeature = null;

const HK_MARKET_DISTRICTS = new Set(['Central and Western','Eastern','Southern','Wan Chai']);
const KOWLOON_MARKET_DISTRICTS = new Set(['Kowloon City','Kwun Tong','Sham Shui Po','Wong Tai Sin','Yau Tsim Mong']);

function marketCleanDistrict(v){ return String(v || '').trim().replace(/\s+District$/i,'').trim(); }
function marketRegionFor(d){ d=marketCleanDistrict(d); if(!d)return null; if(HK_MARKET_DISTRICTS.has(d))return 'Hong Kong'; if(KOWLOON_MARKET_DISTRICTS.has(d))return 'Kowloon'; return 'New Territories'; }
function marketEsc(v){ return String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function marketClamp(v,lo=0,hi=1){ return Math.max(lo,Math.min(hi,v)); }
function marketFormatValue(v,unit){
    const n=Number(v); if(!Number.isFinite(n)) return '—';
    if(unit==='HKD_per_m2') return `HK$${Math.round(n).toLocaleString()}/m²`;
    if(unit==='HKD_per_m2_per_month') return `HK$${Math.round(n).toLocaleString()}/m²/mo`;
    if(unit==='percent') return `${n.toLocaleString(undefined,{maximumFractionDigits:1})}%`;
    if(unit==='units') return `${Math.round(n).toLocaleString()} units`;
    return n.toLocaleString();
}
function marketFormatTrend(v){ const n=Number(v); if(!Number.isFinite(n))return '—'; return `${n>0?'+':''}${n.toFixed(1)}%`; }
function marketTrendArrow(v){ const n=Number(v); if(!Number.isFinite(n) || Math.abs(n)<0.25)return '→'; return n>0?'↑':'↓'; }
function marketScore(v){ const n=Number(v); return Number.isFinite(n)?`${Math.round(marketClamp(n)*100)}/100`:'—'; }
function marketExposureLabel(v){ const n=Number(v); if(!Number.isFinite(n))return 'Unassessed'; if(n>=0.50)return 'Very high'; if(n>=0.35)return 'High'; if(n>=0.20)return 'Moderate'; return 'Low'; }
function marketIsLocal(){ return location.protocol==='file:' || ['localhost','127.0.0.1','::1'].includes(location.hostname); }

function marketRefreshExposureTheme(){
    const select=document.getElementById('theme');
    if(select?.value==='Market Exposure'){
        select.dispatchEvent(new Event('change'));
    }
}

async function marketFetch(){
    const urls=marketIsLocal()?[MARKET_LOCAL_URL,MARKET_REMOTE_URL]:[MARKET_REMOTE_URL]; let lastError=null;
    for(const url of urls){
        try{
            const r=await fetch(url,{cache:'no-store'}); if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
            const data=await r.json();
            if(data.pipeline_version!==MARKET_PIPELINE_VERSION) throw new Error(`pipeline mismatch: ${data.pipeline_version}`);
            if(data.analytics?.version!==MARKET_ANALYSIS_VERSION) throw new Error(`market analysis mismatch: ${data.analytics?.version||'missing'}`);
            marketContext=data; marketContextUrl=url;
            window.UGA_MARKET_CONTEXT=data;
            window.UGA_MARKET_ANALYTICS=data.analytics;
            marketRenderIdle();
            marketRefreshExposureTheme();
            window.UGARefreshOpenInfoPanel?.();
            return;
        }catch(e){ lastError=e; }
    }
    marketSetStatus(`Market data unavailable${lastError?`: ${lastError.message}`:''}`,'error');
}
function marketSetStatus(html,state='ready'){
    const el=document.getElementById('marketDataStatus'); if(!el)return; el.dataset.state=state; el.innerHTML=html;
}
function marketRenderIdle(){
    if(!marketContext)return;
    const c=marketContext.counts||{};
    marketSetStatus(`<div class="market-ready"><strong>Market data ready</strong><span>${Number(c.latest_observations||0).toLocaleString()} current observations · 12-month trends · 24-month history</span><span>Select a hex to see regional and district market context, plus local Market Exposure.</span></div>`);
}
function marketNumericProperty(p,key){ const raw=p?.[key]; if(raw===null||raw===undefined||raw==='')return null; const n=Number(raw); return Number.isFinite(n)?n:null; }
function marketExposureFor(feature,analytics){
    const p=feature?.properties||{};
    const dp=marketNumericProperty(p,'Development Pressure'); const luc=marketNumericProperty(p,'Latent Urban Capacity'); const rawMomentum=analytics?.market_momentum; const momentum=(rawMomentum===null||rawMomentum===undefined||rawMomentum==='')?null:Number(rawMomentum);
    if(dp===null||luc===null||!Number.isFinite(momentum))return null;
    const pressure=marketClamp(Math.max(0,dp));
    const capacity=marketClamp(luc);
    const localOpportunity=(pressure+capacity)/2;
    const exposure=marketClamp(momentum*localOpportunity);
    return {development_pressure:dp,pressure_component:pressure,latent_capacity:luc,capacity_component:capacity,local_opportunity:localOpportunity,market_momentum:momentum,market_exposure:exposure};
}
function marketObsFor(feature){
    if(!marketContext || !feature)return null;
    const p=feature.properties||{}; const hexId=p['Hex ID'] ?? p['Hex_ID'] ?? p['hex_id'];
    const district=marketCleanDistrict(p.HAD_EN || p['HAD_EN']); const region=marketRegionFor(district);
    const analytics=region?(marketContext.analytics?.regions?.[region]||null):null;
    return {hexId,district:district||null,region,analytics,exposure:marketExposureFor(feature,analytics),
        districtObs:district?(marketContext.districts?.[district]||[]):[],
        regionObs:region?(marketContext.regions?.[region]||[]):[],
        territoryObs:marketContext.territory?.['Hong Kong']||[]};
}
function marketBySource(obs,source){ return (obs||[]).filter(x=>x.source_id===source); }
function marketClassGrid(title,obs){
    if(!obs.length)return '';
    const by={}; for(const o of obs){ if(o.property_class)by[o.property_class]=o; }
    const classes=['A','B','C','D','E'];
    return `<div class="market-group"><div class="market-group-title">${marketEsc(title)}</div><div class="market-class-grid">${classes.map(c=>{const o=by[c];return `<div class="market-class-cell"><span>${c}</span><strong>${o?marketEsc(marketFormatValue(o.value,o.unit)):'—'}</strong></div>`}).join('')}</div><div class="market-date">${marketEsc(obs[0]?.date||'')}</div></div>`;
}
function marketDistrictGrid(obs){
    if(!obs.length)return '';
    const preferred=['Stock at 2024 year-end','Completions in 2024','No. Vacant at 2024 year-end','% Vacant','Completions as a % of 2023 Stock','Stock at 2023 year-end'];
    const by=new Map(obs.map(o=>[o.label,o]));
    const ordered=[...preferred.map(k=>by.get(k)).filter(Boolean),...obs.filter(o=>!preferred.includes(o.label))];
    return `<div class="market-group"><div class="market-group-title">District stock / activity</div><div class="market-stat-list">${ordered.map(o=>`<div><span>${marketEsc(o.label)}</span><strong>${marketEsc(marketFormatValue(o.value,o.unit))}</strong><small>${marketEsc(o.date||'')}</small></div>`).join('')}</div></div>`;
}
function marketSparkline(series,label){
    const rows=(series||[]).filter(d=>Number.isFinite(Number(d.index)));
    if(rows.length<2)return '';
    const vals=rows.map(d=>Number(d.index)); let lo=Math.min(...vals),hi=Math.max(...vals); if(hi===lo){lo-=1;hi+=1;}
    const points=vals.map((v,i)=>{const x=2+(i/(vals.length-1))*96; const y=25-((v-lo)/(hi-lo))*22; return `${x.toFixed(2)},${y.toFixed(2)}`;}).join(' ');
    const start=rows[0]?.date||''; const end=rows.at(-1)?.date||'';
    return `<div class="market-spark"><div class="market-spark-head"><span>${marketEsc(label)}</span><small>${marketEsc(start)} → ${marketEsc(end)}</small></div><svg viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true"><line x1="2" y1="25" x2="98" y2="25"></line><polyline points="${points}"></polyline></svg></div>`;
}
function marketAnalyticsBlock(ctx){
    const a=ctx.analytics; if(!a)return '';
    const e=ctx.exposure; const momentum=Number(a.market_momentum);
    const method=e?`<details class="market-method-detail"><summary>How is Market Exposure calculated?</summary><div><p><strong>Market Momentum</strong> = 50% normalised 12-month regional price trend + 50% normalised 12-month regional rent trend.</p><p><strong>Local Opportunity</strong> = 50% positive Development Pressure + 50% Latent Urban Capacity.</p><p><strong>Market Exposure</strong> = Market Momentum × Local Opportunity.</p><div class="market-exposure-meta">Local opportunity ${marketScore(e.local_opportunity)} · pressure ${marketScore(e.pressure_component)} · latent capacity ${marketScore(e.capacity_component)}</div></div></details>`:'';
    return `<div class="market-analytics"><div class="market-analytics-head"><div><span>Market Momentum</span><strong>${marketScore(momentum)}</strong><small>${marketEsc(a.momentum_label||'')}</small></div><div><span>Market Exposure</span><strong>${e?marketScore(e.market_exposure):'—'}</strong><small>${e?marketEsc(marketExposureLabel(e.market_exposure)):'Unassessed'}</small></div></div><div class="market-trend-cards"><div><span>Price trend · 12m</span><strong>${marketTrendArrow(a.price_trend_12m_pct)} ${marketEsc(marketFormatTrend(a.price_trend_12m_pct))}</strong></div><div><span>Rent trend · 12m</span><strong>${marketTrendArrow(a.rent_trend_12m_pct)} ${marketEsc(marketFormatTrend(a.rent_trend_12m_pct))}</strong></div></div><div class="market-spark-grid">${marketSparkline(a.price_series,'Price · Class A–E composite')}${marketSparkline(a.rent_series,'Rent · Class A–E composite')}</div>${method}</div>`;
}
function marketPanelHtml(ctx){
    const prices=marketBySource(ctx.regionObs,'rvd_pd_price_class_monthly'); const rents=marketBySource(ctx.regionObs,'rvd_pd_rent_class_monthly'); const yields=marketBySource(ctx.territoryObs,'rvd_pd_yield_monthly'); const district=marketBySource(ctx.districtObs,'rvd_pd_stock_completions_vacancy_district');
    return `<div class="market-selection"><div class="market-selection-head"><strong>Hex ${marketEsc(ctx.hexId ?? '—')}</strong><span>${marketEsc([ctx.district,ctx.region].filter(Boolean).join(' · ')||'Territory context only')}</span></div>${marketAnalyticsBlock(ctx)}${marketClassGrid('Regional private domestic prices',prices)}${marketClassGrid('Regional private domestic rents',rents)}${marketClassGrid('Hong Kong private domestic yields',yields)}${marketDistrictGrid(district)}</div>`;
}
function marketRenderFeature(feature){ selectedMarketFeature=feature; const ctx=marketObsFor(feature); if(!ctx)return marketRenderIdle(); marketSetStatus(marketPanelHtml(ctx)); marketAppendPopup(ctx); }
function marketAppendPopup(ctx){
    const popup=document.getElementById('popup'); if(!popup || !popup.classList.contains('visible'))return;
    const existing=popup.querySelector('.market-popup-section'); if(existing)existing.remove();
    const prices=marketBySource(ctx.regionObs,'rvd_pd_price_class_monthly'); const rents=marketBySource(ctx.regionObs,'rvd_pd_rent_class_monthly'); const yields=marketBySource(ctx.territoryObs,'rvd_pd_yield_monthly'); const district=marketBySource(ctx.districtObs,'rvd_pd_stock_completions_vacancy_district');
    const classA=(xs)=>xs.find(o=>o.property_class==='A'); const vacancy=district.find(o=>o.label==='% Vacant'); const a=ctx.analytics; const e=ctx.exposure;
    const section=document.createElement('div'); section.className='ugs-section market-popup-section';
    section.innerHTML=`<div class="ugs-section-title">MARKET CONTEXT</div><div class="market-popup-grid">${ctx.region?`<div><span>Region</span><strong>${marketEsc(ctx.region)}</strong></div>`:''}${ctx.district?`<div><span>District</span><strong>${marketEsc(ctx.district)}</strong></div>`:''}${a?`<div><span>Price trend · 12m</span><strong>${marketTrendArrow(a.price_trend_12m_pct)} ${marketEsc(marketFormatTrend(a.price_trend_12m_pct))}</strong></div><div><span>Rent trend · 12m</span><strong>${marketTrendArrow(a.rent_trend_12m_pct)} ${marketEsc(marketFormatTrend(a.rent_trend_12m_pct))}</strong></div><div><span>Market momentum</span><strong>${marketScore(a.market_momentum)}</strong></div>`:''}${e?`<div><span>Market exposure</span><strong>${marketScore(e.market_exposure)} · ${marketEsc(marketExposureLabel(e.market_exposure))}</strong></div>`:''}${classA(prices)?`<div><span>Class A price</span><strong>${marketEsc(marketFormatValue(classA(prices).value,classA(prices).unit))}</strong></div>`:''}${classA(rents)?`<div><span>Class A rent</span><strong>${marketEsc(marketFormatValue(classA(rents).value,classA(rents).unit))}</strong></div>`:''}${classA(yields)?`<div><span>Class A yield</span><strong>${marketEsc(marketFormatValue(classA(yields).value,classA(yields).unit))}</strong></div>`:''}${vacancy?`<div><span>District vacancy</span><strong>${marketEsc(marketFormatValue(vacancy.value,vacancy.unit))}</strong></div>`:''}</div><div class="market-popup-note">Price, rent and yield retain the geography of their official source. Market Exposure combines that wider market movement with this hex's local Atlas conditions; it is not a property valuation or forecast.</div>`;
    const target=popup.querySelector('.ugs-popup') || popup;
    const methodology=target.querySelector('.ugs-methodology');
    if(methodology){
        target.insertBefore(section,methodology);
    }else{
        target.appendChild(section);
    }
}
function marketBindModule(){
    const section=document.getElementById('marketSection'); const chevron=document.getElementById('marketSectionToggle'); if(!section || !chevron)return;
    const toggle=()=>{ const willCollapse=!section.classList.contains('collapsed'); section.classList.toggle('collapsed',willCollapse); section.classList.toggle('expanded',!willCollapse); chevron.setAttribute('aria-expanded',String(!willCollapse)); chevron.setAttribute('aria-label',willCollapse?'Expand Market Data':'Collapse Market Data'); chevron.textContent=willCollapse?'▸':'▾'; };
    chevron.addEventListener('click',toggle);
}
function marketBindMap(){
    if(typeof map==='undefined')return;
    const bind=()=>map.on('click',(e)=>{ const f=map.queryRenderedFeatures(e.point,{layers:['atlas']})[0]||null; if(f) setTimeout(()=>marketRenderFeature(f),0); else {selectedMarketFeature=null;marketRenderIdle();} });
    if(map.loaded())bind(); else map.on('load',bind);
}
marketBindModule(); marketFetch(); marketBindMap();
