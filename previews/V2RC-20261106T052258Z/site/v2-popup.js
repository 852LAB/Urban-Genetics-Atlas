(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.UGA_V2_POPUP=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const VERSION='V2_POPUP_VIEW_MODEL_V0_8_0';
  const UGS_COLOURS=Object.freeze({TC:'#D25B48',EC:'#D89A43',AT:'#A95F68',VM:'#786AA0',LF:'#8F7862',CF:'#518882',SF:'#7D8790',C:'#A8ADB2',U:'#D0D3D7'});
  const PROFILE=Object.freeze([
    ['Intensity','intensity_axis_01','intensity_band'],
    ['Accessibility','accessibility_axis_01','accessibility_band'],
    ['Height / Form','height_form_axis_01','height_form_band'],
    ['Change','change_axis_01','change_band'],
    ['Age','age_axis_01','age_band']
  ]);
  function missing(value){ return value===null||value===undefined||value===''; }
  function number(value){ if(missing(value)) return null; const n=Number(value); return Number.isFinite(n)?n:null; }
  function escapeHtml(value){ return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function activeLayer(config,layerId){ return (config.layers||[]).find(x=>x.layerId===layerId&&String(x.siteStatus).startsWith('ACTIVE'))||null; }
  function buildViewModel(properties,layerId,config){
    const layer=activeLayer(config,layerId);
    if(!layer) throw new Error(`Unsupported V2 public layer: ${layerId}`);
    const raw=properties||{};
    const layerValue=layer.valueField?raw[layer.valueField]:null;
    return Object.freeze({
      version:VERSION,
      hexId:String(raw.hex_id??''),
      district:missing(raw.had_name_en)?'Not available':String(raw.had_name_en),
      signatureCode:missing(raw.signature_code)?null:String(raw.signature_code),
      signatureName:missing(raw.signature_name)?'Unassessed':String(raw.signature_name),
      signatureLabel:missing(raw.signature_popup_label)?null:String(raw.signature_popup_label),
      summary:missing(raw.signature_plain_language_summary)?null:String(raw.signature_plain_language_summary),
      profile:PROFILE.map(([label,valueField,bandField])=>({label,value:number(raw[valueField]),band:missing(raw[bandField])?'Not assessed':String(raw[bandField])})),
      activeLayer:{id:layer.layerId,label:layer.displayLabel,role:layer.publicRoleLabel||layer.interpretationRole,question:layer.question||null,format:layer.format,value:missing(layerValue)?null:layerValue,evidence:layer.supportField&&!missing(raw[layer.supportField])?String(raw[layer.supportField]):null},
      reportAvailable:true
    });
  }
  function formattedLayerValue(layer){
    if(!missing(layer?.formatted)) return String(layer.formatted);
    if(layer?.value===null) return 'Not assessed';
    const n=Number(layer?.value);
    if(layer?.format==='population_context'&&Number.isFinite(n)){
      return `${Math.round(n).toLocaleString('en-GB')} model-allocated`;
    }
    if(layer?.format==='unit_interval'&&Number.isFinite(n)) return `${Math.round(n*100)}%`;
    if(layer?.format==='numeric'&&Number.isFinite(n)) return n.toLocaleString('en-GB',{maximumFractionDigits:3});
    return String(layer?.value);
  }
  function signedDegrees(value,digits=1){
    const n=number(value);
    if(n===null) return 'Not available';
    const magnitude=Math.abs(n).toLocaleString('en-HK',{minimumFractionDigits:digits,maximumFractionDigits:digits});
    return `${n>0?'+':n<0?'−':''}${magnitude} °C`;
  }
  function percentilePhrase(kind,metric){
    const percentile=number(metric?.percentile);
    if(percentile===null) return 'Comparison unavailable';
    const p=Math.max(0,Math.min(100,Math.round(percentile)));
    if(kind==='heat'){
      if(p===50) return 'Near the supported midpoint';
      return p>50?`Warmer than ~${p}%`:`Cooler than ~${100-p}%`;
    }
    if(kind==='variability'){
      if(p===50) return 'Near the supported midpoint';
      return p>50?`More variable than ~${p}%`:`More consistent than ~${100-p}%`;
    }
    return `${p}th percentile`;
  }
  function climateMiniBar(label,value,metric,kind,{left,right,zeroReference=false}={}){
    const position=number(metric?.position);
    const zero=number(metric?.zeroPosition);
    return `<div class="v2-popup-climate-row">
      <div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>
      ${position===null?'':`<i class="v2-popup-climate-bar" aria-hidden="true">${zeroReference&&zero!==null?`<em style="left:${Math.max(0,Math.min(100,zero)).toFixed(1)}%"></em>`:''}<b style="left:${Math.max(0,Math.min(100,position)).toFixed(1)}%"></b></i>`}
      <small><span>${escapeHtml(left||'')}</span><b>${escapeHtml(percentilePhrase(kind,metric))}</b><span>${escapeHtml(right||'')}</span></small>
    </div>`;
  }
  function climateContextHtml(climate){
    if(!climate) return '';
    const heat=number(climate.heat_persistent_relative_c);
    const variability=number(climate.heat_interannual_mad_c);
    if(heat===null&&variability===null) return '';
    const p=climate.climate_profile||{};
    return `<div class="v2-popup-climate-context">
      <div class="v2-popup-climate-title">Climate context</div>
      ${climateMiniBar('Relative surface heat',signedDegrees(heat,1),p.heatRelative,'heat',{left:'Cooler',right:'Warmer',zeroReference:true})}
      ${climateMiniBar('Heat variability',variability===null?'Not available':`${variability.toFixed(2)} °C`,p.heatVariability,'variability',{left:'More consistent',right:'More variable'})}
    </div>`;
  }
  function render(view,options={}){
    const signatureCode=String(view.signatureCode||'U').toUpperCase();
    const signatureColour=UGS_COLOURS[signatureCode]||UGS_COLOURS.U;
    const hasPlaceProfile=Array.isArray(view.profile)&&view.profile.length>0;
    const profile=hasPlaceProfile?view.profile.map(item=>{const pct=item.value===null?null:Math.max(0,Math.min(100,Math.round(item.value*100)));return `<li><span>${escapeHtml(item.label)}</span><strong>${pct===null?'Not assessed':pct+'%'}</strong><small>${escapeHtml(item.band)}</small><i class="v2-popup-profile-bar" aria-hidden="true"><b style="width:${pct===null?0:pct}%"></b></i></li>`;}).join(''):'';
    const value=escapeHtml(formattedLayerValue(view.activeLayer));
    const climateContext=climateContextHtml(options.climate||null);
    const header=options.climateOnly&&!view.signatureCode
      ? `<header><small>Climate context</small><h3>LAB-ID-${escapeHtml(view.hexId)}</h3></header>`
      : `<header><small>${escapeHtml(view.district)}</small><div class="v2-popup-signature"><span class="v2-popup-ugs-icon">${escapeHtml(signatureCode)}</span><h3>${escapeHtml(view.signatureName)}</h3></div></header>`;
    return `<section class="v2-popup" data-hex-id="${escapeHtml(view.hexId)}" data-signature-code="${escapeHtml(signatureCode)}" style="--v2-popup-ugs:${escapeHtml(signatureColour)}">${header}${view.summary?`<p>${escapeHtml(view.summary)}</p>`:''}${profile?`<ul class="v2-popup-profile">${profile}</ul>`:''}${climateContext}<div class="v2-popup-active"><span>${escapeHtml(view.activeLayer.label)}</span><strong>${value}</strong><small>${escapeHtml(view.activeLayer.role)}</small>${view.activeLayer.evidence?`<p class="v2-popup-evidence">${escapeHtml(view.activeLayer.evidence)}</p>`:''}${view.activeLayer.question?`<p class="v2-popup-question">${escapeHtml(view.activeLayer.question)}</p>`:''}</div><button type="button" data-v2-action="view-hex-report">View place details</button></section>`;
  }
  return Object.freeze({VERSION,PROFILE,buildViewModel,formattedLayerValue,climateContextHtml,render});

});
