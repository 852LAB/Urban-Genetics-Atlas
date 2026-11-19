/* Urban Genetics — internal DEV SRPE source-context report extension. */
(function(root,factory){
    const api=factory(root);
    if(typeof module==='object'&&module.exports) module.exports=api;
    if(root){root.UGA_V2_SRPE_REGISTERS=api;if(root.UGA_V2_REPORT)api.install(root.UGA_V2_REPORT);}
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
    'use strict';
    const VERSION='V2_SRPE_SOURCE_CONTEXT_REPORT_V0_1';
    const REVIEWED_BUILDING='3540718286T20160720';
    const REVIEWED_SHA='db06ce4da4e00194c1fb975267575a8e116a95f767f8b559222234c44e954463';
    const scriptUrl='https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/releases/V2RC-20261106T052258Z/site/market-srpe/v0.1/srpe-registers.js';
    const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function getRecord(id){
        if(typeof id!=='string'||id!==REVIEWED_BUILDING)return null;
        const data=root?.UGA_V2_SRPE_REGISTER_DATA;
        const r=data?.buildings?.[id];
        if(data?.schema!=='SRPE_DEV_REPORT_DATA_V0_1'||r?.building_csuid!==id||r?.source_snapshot_sha256!==REVIEWED_SHA)return null;
        if(r.scope!=='REVIEWED_SOURCE_CONTEXT_ONLY'||!Array.isArray(r.entries)||!Array.isArray(r.exclusions))return null;
        if(r.entries.length!==64||r.event_count!==67||r.exclusions.length!==8)return null;
        return r;
    }
    function localDev(){
        const location=root?.location;
        return !location||location.protocol==='file:'||(['localhost','127.0.0.1','::1','[::1]'].includes(location.hostname)||(root.location?.hostname==='852lab.github.io'&&root.location?.pathname?.startsWith('/Urban-Genetics-Atlas/previews/V2RC-20261106T052258Z/')));
    }
    function lookup(id){
        if(!localDev())return {state:'DISABLED_OUTSIDE_LOCAL_DEV',record:null};
        if(!root?.UGA_V2_SRPE_REGISTER_DATA)return {state:'NOT_CONNECTED',record:null};
        const record=getRecord(id);
        const expected=typeof id==='string'&&id===REVIEWED_BUILDING;
        return {state:record?'REVIEWED_SOURCE_CONTEXT':expected?'INVALID_PAYLOAD':'NOT_LINKED',record};
    }
    function date(value){return value?esc(value):'—';}
    function money(value){return typeof value==='number'&&Number.isFinite(value)?value.toLocaleString('en-HK',{maximumFractionDigits:0}):'Not available';}
    function sourceReportUrl(){
        try{return new URL('paseo-source-report.html',scriptUrl||new URL('site/market-srpe/v0.1/srpe-registers.js',root.document.baseURI).href).href;}
        catch(error){return 'site/market-srpe/v0.1/paseo-source-report.html';}
    }
    function renderSection(id){
        const {record:r}=lookup(id);if(!r)return '';
        const counts=r.entries.reduce((a,x)=>{a[x.lifecycle]=(a[x.lifecycle]||0)+1;return a;},{});
        const rows=r.entries.map(x=>`<tr data-srpe-entry="${esc(x.observation_id)}"><td>${esc(x.floor||'—')} / ${esc(x.unit||'—')}</td><td>${date(x.pasp_date)}</td><td>${date(x.asp_date)}</td><td class="v2-srpe-money">${esc(money(x.price_hkd))}</td><td>${date(x.asp_termination_date)}</td><td>${x.lifecycle==='PASP_NOT_PROCEEDED_ENTRY'?'PASP not proceeded':'ASP recorded'}<details><summary>Source notes</summary><p>${esc(x.locator)}</p><pre>${esc(x.payment_terms_raw)}</pre></details></td></tr>`).join('');
        const exclusions=r.exclusions.map(x=>`<li><span>${esc(x.locator)}</span> — ${esc(x.reason)}</li>`).join('');
        return `<section class="v2-sheet-card v2-srpe-register" data-srpe-context="${esc(id)}" aria-labelledby="v2-srpe-heading">
            <p class="v2-srpe-kicker">Property evidence · historical first-hand register</p>
            <h3 id="v2-srpe-heading">THE PASEO · 匯萃</h3>
            <p class="v2-srpe-date">Register updated <strong>10 February 2017</strong> · partial coverage · internal DEV pilot</p>
            <div class="v2-srpe-counts"><div><strong>64</strong><span>Admitted entries</span></div><div><strong>67</strong><span>Dated events</span></div><div><strong>8</strong><span>Held rows</span></div></div>
            <p>${counts.ASP_DATE_ENTRY||0} entries have ASP dates; ${counts.PASP_NOT_PROCEEDED_ENTRY||0} PASPs are explicitly non-proceeded. The events include 3 ASP terminations. These counts do not establish distinct, completed or net sales.</p>
            <p>Prices retain the register’s original HKD transaction-price values. Areas and incentive-adjusted prices are unavailable. Payment wording is retained without deducting listed benefits.</p>
            <details class="v2-srpe-entry-list"><summary>Browse 64 register entries</summary><div class="v2-srpe-table-scroll"><table><thead><tr><th>Floor / unit</th><th>PASP</th><th>ASP</th><th>Price · HKD</th><th>ASP termination</th><th>Register state</th></tr></thead><tbody>${rows}</tbody></table></div></details>
            <details><summary>Eight excluded rows and coverage</summary><p>Three revision-wording rows, four date-format rows and one bundled-property row remain held. They are excluded from the admitted entry table.</p><ul>${exclusions}</ul></details>
            <details><summary>Source and identity evidence</summary><p>The bilingual register name and 7 Kwun Chung Street address match the canonical Tower record. This is a reviewed source-context association. Original transaction rows retain their unresolved canonical fields.</p><p>Building ${esc(r.building_csuid)} · intersecting KIL 11229 · Hex 206247. The Lot has three Building intersections; this register is not assigned to the other two Buildings. Polygon intersection does not establish ownership or exclusive occupation.</p><p class="v2-srpe-pin">Source snapshot SHA256: ${esc(r.source_snapshot_sha256)}</p><p>Source-native context: SRPE ${esc(r.source_native_id)}. The 2017 register remains separate from any later Macro/Meso context shown elsewhere.</p></details>
            <p><a href="${esc(sourceReportUrl())}" target="_blank" rel="noopener">Open the complete source report</a></p>
        </section>`;
    }
    function install(original){
        if(!original||typeof original.renderReportHtml!=='function'||typeof original.buildReportViewModel!=='function')throw new Error('Existing V2 report renderer required.');
        if(original.srpeIntegrationVersion===VERSION)return original;
        const wrapped=Object.freeze({...original,srpeIntegrationVersion:VERSION,coreReportVersion:original.version,
            renderReportHtml(model){
                const html=original.renderReportHtml(model);
                if(model?.entityType!=='building'||model?.focus?.type!=='building')return html;
                const section=renderSection(model.focus.id);if(!section)return html;
                if(html.includes('data-srpe-context='))return html;
                const marker='<footer class="v2-sheet-footer">';const index=html.indexOf(marker);
                if(index<0)throw new Error('SRPE report insertion marker unavailable; existing renderer preserved.');
                return html.slice(0,index)+section+html.slice(index);
            }});
        root.UGA_V2_REPORT=wrapped;
        return wrapped;
    }
    return Object.freeze({version:VERSION,lookup,renderSection,install});
});
