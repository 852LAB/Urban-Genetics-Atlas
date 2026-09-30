/* =============================================================
   Urban Genetics Atlas V2 — selection + entity-route contract
   Version: V2_SELECTION_STATE_V0_3

   PURPOSE
   -------
   Presentation-only state for map/search selections and report navigation.
   The selection keeps Building, Lot, Hex, planning, Census and market grains
   distinct while allowing the report panel to move between related entities.

   IMPORTANT
   ---------
   - This module stores identifiers and display-safe relationship context only.
   - It does not calculate analytical values.
   - It does not infer one-to-one Building/Lot/Hex relationships.
   - A Hex click starts at Hex focus; an address/entity search starts at
     Building or Lot focus and may carry several related entities.
   - Report navigation is a route stack, not a mutation of source evidence.
   ============================================================= */

(function attachUGAV2Selection(root, factory){
    const api = factory();

    if(typeof module === 'object' && module.exports){
        module.exports = api;
    }

    if(root){
        root.UGA_V2_SELECTION = api;
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function createUGAV2Selection(){
    'use strict';

    const VERSION = 'V2_SELECTION_STATE_V0_3';
    const ENTITY_TYPES = Object.freeze(['hex','building','lot']);
    const listeners = new Set();

    let currentSelection = null;
    let currentFocus = null;
    let focusHistory = [];
    let reportOpen = false;

    function cleanKey(value){
        if(value === undefined || value === null) return null;
        const text = String(value).trim();
        return text === '' || text === 'Not available' || text === 'Not connected'
            ? null
            : text;
    }

    function finiteNumber(value){
        if(value === undefined || value === null || value === '') return null;
        const number = Number(value);
        return Number.isFinite(number) ? number : null;
    }

    function freezeArray(values){
        return Object.freeze((values || []).map(value => cleanKey(value)).filter(Boolean));
    }

    function freezeObject(value){
        if(!value || typeof value !== 'object') return Object.freeze({});
        return Object.freeze({...value});
    }

    function freezeEntityRows(rows, type){
        return Object.freeze((rows || []).map(row => {
            const source = row && typeof row === 'object' ? row : {};
            const id = type === 'hex'
                ? cleanKey(source.hexId ?? source.id)
                : type === 'building'
                    ? cleanKey(source.buildingCsuid ?? source.id)
                    : cleanKey(source.lotCsuid ?? source.lotId ?? source.id);

            if(!id){
                return null;
            }

            const share = finiteNumber(source.share ?? source.relationshipShare);

            return Object.freeze({
                ...source,
                id,
                type,
                relationshipRole:cleanKey(source.relationshipRole) || null,
                share
            });
        }).filter(Boolean));
    }

    function entityId(type, entity){
        if(!entity || typeof entity !== 'object') return null;
        if(type === 'hex') return cleanKey(entity.hexId ?? entity.id);
        if(type === 'building') return cleanKey(entity.buildingCsuid ?? entity.id);
        if(type === 'lot') return cleanKey(entity.lotCsuid ?? entity.lotId ?? entity.id);
        return null;
    }

    function makeFocus(type, id, label=null){
        if(!ENTITY_TYPES.includes(type)){
            throw new Error(`Unsupported V2 report entity type: ${type}`);
        }
        const cleanId = cleanKey(id);
        if(!cleanId){
            throw new Error(`A stable ${type} identifier is required for report focus.`);
        }
        return Object.freeze({
            type,
            id:cleanId,
            label:cleanKey(label)
        });
    }

    function coordinatesFrom(source, role){
        const lng = finiteNumber(source?.lng ?? source?.longitude);
        const lat = finiteNumber(source?.lat ?? source?.latitude);
        if(lng === null || lat === null) return null;
        return Object.freeze({lng, lat, role});
    }

    function createHexSelection(placeViewModel, options={}){
        if(!placeViewModel || typeof placeViewModel !== 'object'){
            throw new Error('A place view model is required to create a Hex selection.');
        }

        const hexId = cleanKey(placeViewModel.identity?.hexId);
        if(!hexId){
            throw new Error('A stable Hex ID is required for a map-Hex selection.');
        }

        const clickedLngLat = coordinatesFrom(options, 'map_click');
        const hexEntity = Object.freeze({
            id:hexId,
            type:'hex',
            hexId,
            relationshipRole:'selected',
            share:null
        });

        return Object.freeze({
            version:VERSION,
            origin:'map',
            selectionType:'hex',
            searchRecordId:null,
            buildingCsuid:null,
            geoRefNo:null,
            displayLabelEn:null,
            displayLabelZh:null,
            lotIds:Object.freeze([]),
            lotCsuids:Object.freeze([]),
            hexIds:Object.freeze([hexId]),
            primaryHexId:hexId,
            clickedLngLat,
            trustedCentroid:null,
            ambiguityState:null,
            source:null,
            methodVersion:null,
            initialFocus:makeFocus('hex', hexId, `Hex ${hexId}`),
            entities:Object.freeze({
                buildings:Object.freeze([]),
                lots:Object.freeze([]),
                hexes:Object.freeze([hexEntity])
            }),
            grains:Object.freeze({
                building:Object.freeze({state:'not_connected', ids:Object.freeze([])}),
                lot:Object.freeze({state:'not_connected', ids:Object.freeze([])}),
                hex:Object.freeze({state:'selected', ids:Object.freeze([hexId])}),
                planningScope:Object.freeze({state:'not_connected', ids:Object.freeze([])}),
                census:Object.freeze({state:'not_connected', ids:Object.freeze([])}),
                market:Object.freeze({state:'context_only', ids:Object.freeze([])})
            }),
            place:Object.freeze({
                sourceBinding:cleanKey(placeViewModel.sourceBinding),
                hexId,
                landUse:cleanKey(placeViewModel.identity?.landUse) || 'Not available',
                signature:freezeObject(placeViewModel.signature),
                activeLayer:freezeObject(placeViewModel.activeLayer),
                geography:freezeObject(placeViewModel.geography)
            })
        });
    }

    function createBuildingSelection(resolution){
        if(!resolution || typeof resolution !== 'object'){
            throw new Error('A resolved Building record is required for a search selection.');
        }

        const building = resolution.entity && typeof resolution.entity === 'object'
            ? resolution.entity
            : resolution.building && typeof resolution.building === 'object'
                ? resolution.building
                : resolution;
        const buildingCsuid = cleanKey(
            building.buildingCsuid ?? building.building_csuid ?? building.id ?? resolution.buildingCsuid
        );
        if(!buildingCsuid){
            throw new Error('A stable BuildingCSUID is required for a Building selection.');
        }

        const lotRows = freezeEntityRows(resolution.lots, 'lot');
        const hexRows = freezeEntityRows(resolution.hexes, 'hex');
        const primaryHex = hexRows.find(row => row.primary === true) || hexRows[0] || null;
        const primaryHexId = primaryHex ? entityId('hex', primaryHex) : cleanKey(resolution.primaryHexId);
        const lotIds = Object.freeze(lotRows.map(row => cleanKey(row.lotId)).filter(Boolean));
        const lotCsuids = Object.freeze(lotRows.map(row => cleanKey(row.lotCsuid)).filter(Boolean));
        const hexIds = Object.freeze(hexRows.map(row => entityId('hex', row)).filter(Boolean));
        const displayLabelEn = cleanKey(
            building.displayLabelEn ?? building.name_en ?? building.address ?? resolution.displayLabelEn
        );
        const displayLabelZh = cleanKey(building.displayLabelZh ?? resolution.displayLabelZh);
        const trustedCentroid = coordinatesFrom(
            building.coordinates || resolution.coordinates || building,
            'trusted_building_centroid'
        );

        const buildingEntity = Object.freeze({
            ...building,
            id:buildingCsuid,
            type:'building',
            buildingCsuid,
            displayLabelEn,
            displayLabelZh
        });

        return Object.freeze({
            version:VERSION,
            origin:'search',
            selectionType:'building',
            searchRecordId:cleanKey(resolution.searchRecordId),
            buildingCsuid,
            geoRefNo:cleanKey(building.geoRefNo ?? resolution.geoRefNo),
            displayLabelEn,
            displayLabelZh,
            lotIds,
            lotCsuids,
            hexIds,
            primaryHexId,
            clickedLngLat:null,
            trustedCentroid,
            ambiguityState:cleanKey(resolution.ambiguityState) || 'resolved',
            source:cleanKey(resolution.source),
            methodVersion:cleanKey(resolution.methodVersion),
            initialFocus:makeFocus(
                'building',
                buildingCsuid,
                displayLabelEn || displayLabelZh || buildingCsuid
            ),
            entities:Object.freeze({
                buildings:Object.freeze([buildingEntity]),
                lots:lotRows,
                hexes:hexRows
            }),
            grains:Object.freeze({
                building:Object.freeze({state:'selected', ids:Object.freeze([buildingCsuid])}),
                lot:Object.freeze({state:lotRows.length ? 'related' : 'not_connected', ids:Object.freeze(lotRows.map(row => row.id))}),
                hex:Object.freeze({state:hexRows.length || primaryHexId ? 'related' : 'not_connected', ids:hexIds}),
                planningScope:Object.freeze({state:'not_connected', ids:Object.freeze([])}),
                census:Object.freeze({state:'not_connected', ids:Object.freeze([])}),
                market:Object.freeze({state:'not_connected', ids:Object.freeze([])})
            }),
            place:Object.freeze({})
        });
    }

    function createLotSelection(resolution){
        if(!resolution || typeof resolution !== 'object'){
            throw new Error('A resolved Lot record is required for a search selection.');
        }

        const lot = resolution.entity && typeof resolution.entity === 'object'
            ? resolution.entity
            : resolution.lot && typeof resolution.lot === 'object'
                ? resolution.lot
                : resolution;
        const lotCsuid = cleanKey(lot.lotCsuid ?? lot.lot_csuid ?? lot.id ?? resolution.lotCsuid);
        if(!lotCsuid){
            throw new Error('A stable LotCSUID is required for a Lot selection.');
        }

        const buildingRows = freezeEntityRows(resolution.buildings, 'building');
        const hexRows = freezeEntityRows(resolution.hexes, 'hex');
        const primaryHex = hexRows.find(row => row.primary === true) || hexRows[0] || null;
        const primaryHexId = primaryHex ? entityId('hex', primaryHex) : cleanKey(resolution.primaryHexId);
        const hexIds = Object.freeze(hexRows.map(row => entityId('hex', row)).filter(Boolean));
        const lotId = cleanKey(lot.lotId ?? lot.lot_id ?? resolution.lotId);
        const displayLabelEn = cleanKey(
            lot.displayLabelEn ?? resolution.displayLabelEn ?? (lotId ? `Lot ${lotId}` : `Lot ${lotCsuid}`)
        );
        const trustedCentroid = coordinatesFrom(
            lot.coordinates || resolution.coordinates || lot,
            'trusted_lot_centroid'
        );
        const lotEntity = Object.freeze({
            ...lot,
            id:lotCsuid,
            type:'lot',
            lotCsuid,
            lotId,
            displayLabelEn
        });

        return Object.freeze({
            version:VERSION,
            origin:'search',
            selectionType:'lot',
            searchRecordId:cleanKey(resolution.searchRecordId),
            buildingCsuid:null,
            lotCsuid,
            geoRefNo:null,
            displayLabelEn,
            displayLabelZh:null,
            lotIds:Object.freeze(lotId ? [lotId] : []),
            lotCsuids:Object.freeze([lotCsuid]),
            hexIds,
            primaryHexId,
            clickedLngLat:null,
            trustedCentroid,
            ambiguityState:cleanKey(resolution.ambiguityState) || 'resolved',
            source:cleanKey(resolution.source),
            methodVersion:cleanKey(resolution.methodVersion),
            initialFocus:makeFocus('lot', lotCsuid, displayLabelEn),
            entities:Object.freeze({
                buildings:buildingRows,
                lots:Object.freeze([lotEntity]),
                hexes:hexRows
            }),
            grains:Object.freeze({
                building:Object.freeze({state:buildingRows.length ? 'related' : 'not_connected', ids:Object.freeze(buildingRows.map(row => row.id))}),
                lot:Object.freeze({state:'selected', ids:Object.freeze([lotCsuid])}),
                hex:Object.freeze({state:hexRows.length || primaryHexId ? 'related' : 'not_connected', ids:hexIds}),
                planningScope:Object.freeze({state:'not_connected', ids:Object.freeze([])}),
                census:Object.freeze({state:'not_connected', ids:Object.freeze([])}),
                market:Object.freeze({state:'context_only', ids:Object.freeze([])})
            }),
            place:Object.freeze({})
        });
    }

    function normaliseSelection(selection){
        if(!selection || typeof selection !== 'object'){
            throw new Error('Selection must be an object.');
        }
        if(selection.version !== VERSION){
            throw new Error('Selection version mismatch.');
        }

        const primaryHexId = cleanKey(selection.primaryHexId);
        const buildingCsuid = cleanKey(selection.buildingCsuid);
        const lotCsuid = cleanKey(selection.lotCsuid);
        const hexIds = freezeArray(selection.hexIds);
        const lotIds = freezeArray(selection.lotIds);
        const lotCsuids = freezeArray(selection.lotCsuids);

        if(!primaryHexId && !buildingCsuid && !lotCsuid){
            throw new Error('Selection requires at least a primary Hex ID, BuildingCSUID or LotCSUID.');
        }

        const initialFocus = selection.initialFocus
            ? makeFocus(selection.initialFocus.type, selection.initialFocus.id, selection.initialFocus.label)
            : buildingCsuid
                ? makeFocus('building', buildingCsuid, selection.displayLabelEn || selection.displayLabelZh || buildingCsuid)
                : lotCsuid
                    ? makeFocus('lot', lotCsuid, selection.displayLabelEn || lotCsuid)
                    : makeFocus('hex', primaryHexId, `Hex ${primaryHexId}`);

        return Object.freeze({
            ...selection,
            primaryHexId,
            buildingCsuid,
            lotCsuid,
            hexIds,
            lotIds,
            lotCsuids,
            initialFocus
        });
    }

    function snapshot(eventType='snapshot'){
        return Object.freeze({
            version:VERSION,
            eventType,
            selection:currentSelection,
            focus:currentFocus,
            historyDepth:focusHistory.length,
            reportOpen
        });
    }

    function emit(eventType){
        const state = snapshot(eventType);
        for(const listener of listeners){
            try{
                listener(state);
            }catch(error){
                console.error('[UGA V2] Selection listener failed.', error);
            }
        }
        return state;
    }

    function setSelection(selection){
        currentSelection = normaliseSelection(selection);
        currentFocus = currentSelection.initialFocus;
        focusHistory = [];
        return emit('selection_changed');
    }

    function clearSelection(){
        currentSelection = null;
        currentFocus = null;
        focusHistory = [];
        reportOpen = false;
        return emit('selection_cleared');
    }

    function openReport(){
        if(!currentSelection){
            return snapshot('report_open_ignored');
        }
        reportOpen = true;
        return emit('report_opened');
    }

    function closeReport(){
        reportOpen = false;
        return emit('report_closed');
    }

    function focusEntity(type, id, options={}){
        if(!currentSelection){
            throw new Error('Cannot change report focus without a selection.');
        }

        const next = makeFocus(type, id, options.label || null);
        if(currentFocus && currentFocus.type === next.type && currentFocus.id === next.id){
            return snapshot('focus_unchanged');
        }

        if(currentFocus){
            focusHistory = [...focusHistory, currentFocus];
        }
        currentFocus = next;
        reportOpen = true;
        return emit('focus_changed');
    }

    function backFocus(){
        if(!currentSelection){
            return snapshot('focus_back_ignored');
        }
        if(!focusHistory.length){
            return snapshot('focus_back_at_root');
        }

        currentFocus = focusHistory[focusHistory.length - 1];
        focusHistory = focusHistory.slice(0, -1);
        return emit('focus_back');
    }

    function getSelection(){
        return currentSelection;
    }

    function getFocus(){
        return currentFocus;
    }

    function isReportOpen(){
        return reportOpen;
    }

    function subscribe(listener){
        if(typeof listener !== 'function'){
            throw new Error('Selection subscriber must be a function.');
        }
        listeners.add(listener);
        return () => listeners.delete(listener);
    }

    function toUrlParams(selection=currentSelection, options={}){
        if(!selection) return '';

        const params = new URLSearchParams();
        if(selection.primaryHexId){
            params.set('hex', selection.primaryHexId);
        }
        if(selection.buildingCsuid){
            params.set('building', selection.buildingCsuid);
        }
        const focus = currentFocus;
        if(focus && focus.type === 'lot'){
            params.set('lot', focus.id);
        }
        if(options.includeView && reportOpen){
            params.set('view', focus?.type || selection.selectionType || 'place');
        }
        return params.toString();
    }

    return Object.freeze({
        version:VERSION,
        entityTypes:ENTITY_TYPES,
        createHexSelection,
        createBuildingSelection,
        createLotSelection,
        setSelection,
        clearSelection,
        openReport,
        closeReport,
        focusEntity,
        backFocus,
        getSelection,
        getFocus,
        isReportOpen,
        subscribe,
        snapshot,
        toUrlParams
    });
});
