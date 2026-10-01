(function(root,factory){
    const api=factory();
    if(typeof module==='object'&&module.exports) module.exports=api;
    if(root) root.UGA_V2_SITE_CONFIG=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
    'use strict';
    const CONFIG=Object.freeze({
        version:'V2_SITE_RUNTIME_CONFIG_V0_3_1',
        contractStatus:'FROZEN_AUTHORITATIVE_PUBLIC_HEX_BINDING',
        map:Object.freeze({pmtilesUrl:'https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/v2/v2-public-hex-map-v0.1.pmtiles',sourceLayer:'atlas_v2',minzoom:10,maxzoom:14,idField:'hex_id',properties:57}),
        hexReport:Object.freeze({manifestUrl:'https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/v2/hex-report/v0.2/manifest.json',shardUrlPattern:'https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/v2/hex-report/v0.2/shards/{shard}.json',shards:1024,idField:'hex_id'}),
        entities:Object.freeze({
            baseUrl:'https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/v2/entity-market-demographics/v0.1/',
            manifestUrl:'https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/v2/entity-market-demographics/v0.1/manifest.json',
            provider:'V2_ENTITY_SEARCH_PROVIDER_V0_1',
            scope:'ADDRESS_BUILDING_NAME_BUILDING_CSU_ID_LOT_ID_LOT_CSU_ID',
            buildings:342223,lots:375004,addressBearingBuildings:46557,
            hexBuildingRelationships:437602,hexLotRelationships:558124,buildingLotRelationships:397214
        }),
        buildingSearch:Object.freeze({
            provider:'V2_ENTITY_SEARCH_PROVIDER_V0_1',scope:'SUPERSEDED_BY_ENTITY_SEARCH_V0_1',
            streetAddressCoverage:'CONNECTED_WHERE_AUTHORITATIVE',hexRelationshipRole:'POLYGON_INTERSECTION'
        }),
        demographics:Object.freeze({
            nativeCensusPmtilesUrl:'https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/v2/entity-market-demographics/v0.1/demographics/v0.1/v2-census-context-v0.1.pmtiles',
            sourceLayer:'census_context',features:1561,geography:'2021_CENSUS_BUILDING_GROUP'
        }),
        market:Object.freeze({contextUrl:'https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/v2/entity-market-demographics/v0.1/market/v0.1/market-context.json',role:'CONTEXT_NOT_VALUATION'}),
        climate:Object.freeze({
            provider:'V2_CLIMATE_PROVIDER_V0_2',
            manifestUrl:'https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/v2/climate/v0.1/site-lookup/climate_lookup_manifest_v0.1.json',
            profileUrl:'https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/v2/climate/v0.1/profile/climate_profile_calibration_v0.1.json',
            role:'INDEPENDENT_HEX_CONTEXT',
            evidenceFamilies:Object.freeze(['HEAT','TERRAIN','COASTAL']),
            masterHexes:374784,contextHexes:158113,chunkSize:10000,chunks:38,maxCachedChunks:4,
            map:Object.freeze({
                pmtilesUrl:'https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/v2/climate/v0.1/site-map/climate_hex_map_v0.1.pmtiles',
                manifestUrl:'https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/v2/climate/v0.1/site-map/climate_hex_map_manifest_v0.1.json',
                sourceLayer:'climate_v0_1',minzoom:10,maxzoom:14,features:158113,
                persistentHeatFeatures:153919
            }),
            mapStatus:'CONNECTED_V0_1'
        }),
        layers:Object.freeze([
            {layerId:'urban_signature',displayLabel:'Urban Genetic Signature',valueField:'signature_code',supportField:'signature_confidence',format:'categorical',interpretationRole:'DESCRIPTIVE',publicRoleLabel:'Lens · Descriptive',question:'What kind of urban place is this?',siteStatus:'ACTIVE'},
            {layerId:'development_pressure',displayLabel:'Development Pressure',valueField:'development_pressure_raw_01',supportField:'development_pressure_evidence_state',format:'unit_interval',interpretationRole:'DIAGNOSTIC',publicRoleLabel:'Lens · Diagnostic',question:'Where do structural conditions and recorded development activity combine most strongly?',siteStatus:'ACTIVE'},
            {layerId:'mtr_built',displayLabel:'MTR Built Accessibility',valueField:'mtr_index_built',supportField:null,format:'numeric',interpretationRole:'ACCESSIBILITY_CONTEXT',publicRoleLabel:'Supporting indicator · Accessibility',question:'How strongly is this place connected to the existing MTR network?',siteStatus:'ACTIVE'},
            {layerId:'renewal_potential',displayLabel:'Renewal Potential',valueField:'renewal_observed_base_01',supportField:'renewal_evidence_state',format:'unit_interval',interpretationRole:'STRATEGIC_LENS',publicRoleLabel:'Lens · Strategic screening',question:'Where do established urban conditions combine to make renewal worth investigating?',siteStatus:'ACTIVE'},
            {layerId:'genesis_potential',displayLabel:'Genesis Potential',valueField:'genesis_observed_base_01',supportField:'genesis_evidence_state',format:'unit_interval',interpretationRole:'STRATEGIC_LENS',publicRoleLabel:'Lens · Strategic screening',question:'Where do capacity and enabling conditions combine to suggest emerging growth conditions?',siteStatus:'ACTIVE'},
            {layerId:'capacity_opportunity',displayLabel:'Capacity Context',valueField:'capacity_opportunity_mid_01',supportField:'capacity_opportunity_evidence_state',format:'unit_interval',interpretationRole:'SCREENING_CONTEXT',publicRoleLabel:'Lens · Screening context',question:'How does observed form compare with the supported planning-envelope context?',siteStatus:'ACTIVE'},
            {layerId:'dominant_use',displayLabel:'Dominant Use',valueField:'baseline_dominant_use',supportField:null,format:'categorical',interpretationRole:'FABRIC_CONTEXT',publicRoleLabel:'Evidence · Built form',question:'What use is most strongly represented in the local built-form evidence?',siteStatus:'ACTIVE'},
            {layerId:'planning_zone',displayLabel:'Planning Zone',valueField:'planning_dominant_zone_label',supportField:null,format:'categorical',interpretationRole:'PLANNING_CONTEXT',publicRoleLabel:'Evidence · Planning',question:'Which statutory planning-zone label is dominant in this local context?',siteStatus:'ACTIVE_MUTED'},
            {layerId:'population_context',displayLabel:'Allocated Population',valueField:'population_allocated',supportField:null,format:'population_context',interpretationRole:'DEMOGRAPHIC_CONTEXT',publicRoleLabel:'Modelled evidence · Population',question:'How is the accepted 2021 population model distributed across the city?',siteStatus:'ACTIVE'}
        ]),
        boundaries:Object.freeze({
            source_analysis_values_modified:false,source_publication_eligibility_modified:false,
            demographics_choropleth:'ALLOCATED_POPULATION_PLUS_NATIVE_CENSUS_BUILDING_GROUP_THEMES',
            census_native_geography_preserved:true,living_space_choropleth:false,population_per_building:false,
            gfa_saturation_alias:false,legacy_latent_capacity_label:false,
            entity_search:'CONNECTED_V0_1',street_address_search:'CONNECTED_WHERE_AUTHORITATIVE',
            building_hex_relationship:'POLYGON_INTERSECTION',lot_hex_relationship:'POLYGON_INTERSECTION',
            building_lot_relationship:'DERIVED_POLYGON_INTERSECTION_FROM_ACCEPTED_FOUNDATIONS',
            public_hex_rendering:'PATTERN_FIRST_BOUNDARIES_CLOSE_ZOOM_ONLY',
            public_hex_identifiers:'INTERNAL_AND_TECHNICAL_PROVENANCE_ONLY',
            public_hex_values_or_geometry_modified:false
        })
    });
    return CONFIG;
});
