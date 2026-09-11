# Urban Genetics Atlas — Public AI Context

> Curated public context for AI systems and researchers reviewing the live Atlas.
> Generated automatically for each release from public project files and the current curated methodology notes.

## Live Atlas

https://852lab.github.io/Urban-Genetics-Atlas/

## Public review resources

- Live interface: https://852lab.github.io/Urban-Genetics-Atlas/
- AI index: https://852lab.github.io/Urban-Genetics-Atlas/llms.txt
- Full AI context: https://852lab.github.io/Urban-Genetics-Atlas/llms-full.txt
- Detailed context: https://852lab.github.io/Urban-Genetics-Atlas/atlas-context.md
- Plain-text context: https://852lab.github.io/Urban-Genetics-Atlas/atlas-context.txt
- Main HTML: https://852lab.github.io/Urban-Genetics-Atlas/index.html
- Map/application logic: https://852lab.github.io/Urban-Genetics-Atlas/atlas.js
- Interface styling: https://852lab.github.io/Urban-Genetics-Atlas/styles.css
- Market browser logic: https://852lab.github.io/Urban-Genetics-Atlas/site/market-data.js
- Market module styling: https://852lab.github.io/Urban-Genetics-Atlas/site/market-data.css
- Public release manifest: https://852lab.github.io/Urban-Genetics-Atlas/release-manifest.json
- Repository: https://github.com/852LAB/Urban-Genetics-Atlas

## Current snapshot

- Page title: **Urban Genetics Atlas**
- UI version label: **Beta**
- Release ID: **V1.6-20260912-000148**
- Generated: **2026-09-11 16:04 UTC**
- PMTiles: **atlas/852LAB_V1.6.pmtiles**
- Public GeoJSON resources: **3**
- Terrain objects: **51941**
- Terrain status: **unchanged**

## Project character

The Urban Genetics Atlas is a map-first exploratory system for reading Hong Kong through data. It is intended to work as both a sophisticated functioning prototype and an intuitive public-facing shop window into the Lab.

Its intended character is **Windy + Wiki for cities**: immediate and spatial at first glance, with deeper explanation available when a user wants to understand the evidence, analysis and assumptions behind the map.

The intended progression is:

**data → pattern → interpretation → understanding → better questions**

The Atlas is not intended to reduce the city to a single score.

## Public information architecture

The Atlas separates:

- **Urban Fabric** — recorded physical, infrastructural and historical evidence.
- **Urban Analysis** — derived diagnostic and strategic patterns.
- **Urban Genetic Signature (UGS)** — a rule-based classification describing recognisable combinations of urban characteristics.
- **Market Data** — official market observations at their source geography, plus a separate Market Exposure analysis linking wider market movement to local Atlas conditions.

Recorded evidence, derived analysis, strategic assumptions and predictions are not the same thing. The Atlas should make clear which kind of information is being shown.

## Urban Analysis modes currently present

- `Urban Genetic Signature` — Urban Genetic Signature
- `Development Pressure` — Development Pressure
- `GFA - Saturation` — GFA Saturation
- `MTR - Index (Built)` — MTR Built Accessibility
- `Renewal Potential` — Renewal Potential
- `Genesis Potential` — Genesis Potential
- `GFA per Capita` — Living Space (m² per resident)
- `Population per Building` — Population Intensity
- `Latent Urban Capacity` — Latent Urban Capacity
- `Market Exposure` — Market Exposure
- `All` — All Contexts
- `Residential` — Residential
- `Commercial / Mixed` — Commercial / Mixed
- `Industrial` — Industrial
- `Comprehensive Development` — Comprehensive Development
- `Village / Other Development` — Village / Other Development
- `Constrained / Non-urban` — Constrained / Non-urban
- `Other / Unclassified` — Other / Unclassified

## Current analytical interpretation

Development Pressure is a diagnostic model. Renewal Potential and Genesis Potential are strategic lenses containing explicit assumptions. UGS is a descriptive classification, not a redevelopment forecast or overall score. Market Exposure is a separate combined market-and-urban indicator and does not feed back into Development Pressure, Renewal, Genesis or UGS.

Missing data is not treated as low performance. A genuine numeric zero remains a valid value. Where model components are unavailable, current analytical models retain separate support/confidence logic rather than silently replacing missing structural evidence with zero.

## Spatial interpretation

The current Atlas uses a 100 m hexagonal reference system. The hex is a common analytical unit for comparing places and should not be treated as a precise statement about every building, lot or property inside it.

The present spatial set is the current prototype reference set, not a claim that it is the final canonical Hong Kong grid. A future ground-up rebuild is expected to preserve a fuller immutable base grid and explicit lineage for source records and spatial joins.

## Public implementation

The Atlas is a static HTML/CSS/JavaScript application using MapLibre GL JS. The primary hexagonal atlas is delivered using PMTiles. Supporting datasets and terrain are delivered separately. Market context is maintained as a compact browser payload that retains official source geographies rather than inventing 100 m market values.

## Data caveats

The Atlas is an analytical and exploratory tool rather than a definitive representation of Hong Kong. Source datasets differ in date, scale, completeness and coverage. Missing values, outliers and uneven source coverage exist.

- **CONSTRAINED** is a special planning/context state.
- **UNASSESSED** means insufficient analytical context, not low performance.
- Recorded approvals and land activity are observed evidence, not certainty about future development.
- Strategic models should be read as lenses for investigation rather than predictions.
- Market values retain their official territory, region or district geography; display against a selected hex is contextual inheritance, not a direct hex-level valuation.

## Recommended AI review

Review the live Atlas first, then use this context and the public implementation files. Focus on whether the Atlas reveals useful spatial patterns, makes its analytical distinctions intelligible, supports comparison between neighbouring places, handles missing evidence honestly and remains understandable without specialist GIS knowledge.

## Public implementation boundary

This release intentionally excludes credentials, API keys, private endpoints, raw source data and other non-public development material.

## Current curated methodology and language notes

# Urban Genetics Atlas — Public AI Context Notes

## What the Atlas is

The Urban Genetics Atlas is a map-first exploratory system for reading Hong Kong through data.

Its intended character is **Windy + Wiki for cities**: visual and intuitive at first glance, with deeper explanation available when a user wants to understand what sits behind the map.

The Atlas is both a sophisticated working prototype and a public-facing learning tool. It brings different spatial datasets into a common 100 m reference so users can compare places, see relationships and ask better questions about how the city is built, connected and changing.

The intended progression is:

**data → pattern → interpretation → understanding → better questions**

It is not intended to reduce the city to a single score.

## How to read the Atlas

The Atlas separates several kinds of information:

- **Urban Fabric** — recorded physical, infrastructural and historical evidence such as terrain, reclamation, buildings, heritage, rail and roads.
- **Descriptive / diagnostic analysis** — derived patterns such as GFA Saturation, accessibility, living space, population intensity, capacity and Development Pressure.
- **Strategic analysis** — assumption-led lenses such as Renewal Potential and Genesis Potential.
- **Urban Genetic Signature** — a rule-based classification describing a recognisable combination of urban characteristics.
- **Market Data** — property-market observations that retain the geography of their official source, plus a separate Market Exposure analysis linking wider market movement to local Atlas conditions.

Recorded activity, modelled signals and predictions are not the same thing. The Atlas should state which kind of information is being shown.

## Urban Genetic Signature

The Urban Genetic Signature (UGS) describes **what kind of urban condition a place resembles when several characteristics are read together**.

A Signature is not an overall score, a judgement of quality or a redevelopment prediction.

The five-part profile is:

- **Intensity** — how built-up the place is relative to other meaningful urban cells.
- **Accessibility** — relative pedestrian, road and built-MTR connectivity.
- **Height / Form** — how tall and vertically built the recorded fabric is.
- **Change** — the relative Development Pressure signal.
- **Age** — the age of the recorded building stock where building-year data is available.

The bars form a profile; they are not averaged into a single Signature-strength score.

### Signature classes

The current public classes are:

- **AGEING TRANSITION (AT)** — older building fabric with a high Change signal.
- **TRANSFORMING CORE (TC)** — high-intensity urban fabric with a high Change signal.
- **EMERGING CHANGE (EC)** — lower-intensity urban fabric with a high Change signal.
- **VERTICAL MATURE (VM)** — high-intensity, taller fabric without a high Change signal.
- **LEGACY FABRIC (LF)** — older established fabric without a high Change signal.
- **CONNECTED FABRIC (CF)** — highly connected fabric without a high Change signal.
- **STABLE FABRIC (SF)** — meaningful urban fabric without another Signature-defining combination. “Stable” does not mean permanently unchanged.
- **CONSTRAINED (C)** — constrained or non-urban planning context, read separately from the urban Signatures.
- **UNASSESSED (U)** — not enough analytical context to assign a Signature.

The classification is rule-based and uses a priority order. Not every characteristic is used to assign every Signature.

Renewal Potential and Genesis Potential remain separate strategic analyses and do not feed into the Signature classification.

## Development Pressure

Development Pressure is a **diagnostic model** asking where structural urban conditions and recorded development activity combine into a stronger pressure signal.

It combines:

- **35% Age Stress**
- **30% Capacity Opportunity**
- **20% Form Susceptibility**
- **15% Approval Activity**

Approval Activity gives more weight to recent building approvals while also recognising repeated recorded events. Each year entry in the approval-history field is treated as one recorded approval event, including repeated years if they occur.

A blank approval history is treated as zero recorded approval events within that source history. This differs from a genuinely missing structural input, which remains missing.

Development Pressure does **not** mean redevelopment is planned, approved or imminent.

## Renewal Potential

Renewal Potential is a **strategic lens for established urban fabric**. It asks where age, existing intensity, built-out capacity, accessibility and policy relevance combine strongly enough to make renewal worth investigating.

It combines:

- **30% Age Stress**
- **25% Existing Intensity**
- **20% GFA Saturation**
- **15% Existing Accessibility**
- **10% Renewal Policy Alignment**

Renewal Policy Alignment is an explicit analytical assumption rather than an observed physical property.

Renewal Potential does not mean redevelopment will occur.

## Genesis Potential

Genesis Potential is a **strategic lens for under-used or more mutable urban conditions**. It asks where remaining capacity, lower existing intensity, planning flexibility and new accessibility catalysts combine more strongly.

It combines:

- **35% Capacity Opportunity**
- **25% Low Existing Intensity**
- **20% Policy Flexibility**
- **20% Planned Accessibility Additionality**

Planned Accessibility Additionality counts only positive accessibility added by the planned MTR network over the built network. Policy Flexibility is an explicit analytical assumption.

Genesis is intentionally distinct from Renewal: Renewal looks for established / built-out conditions, while Genesis looks for room to grow plus enabling conditions.

## Capacity measures

**GFA Saturation** estimates how much of a hex's modelled development capacity has already been realised.

**Latent Urban Capacity** estimates the share of modelled development capacity that remains unrealised.

They describe opposite sides of the same capacity relationship, but neither should be read as a direct statement of development feasibility, land ownership, vacant land or permission to build.

Where absolute remaining capacity matters, the strategic models also consider the quantity of remaining GFA rather than only the proportional share.

## Accessibility

MTR Built Accessibility is a relative measure based on proximity and network connectivity to the built MTR system.

It is not a direct measure of journey time, service frequency or passenger volume.

The broader accessibility profile used by the Signature combines pedestrian, road and built-MTR connectivity.

## Living Space and Population Intensity

**Living Space** is estimated residential floor area per resident within a hex. It is not a direct measure of dwelling size, crowding or housing quality.

**Population Intensity** estimates the number of residents associated with buildings in a hex. It is intended for spatial comparison rather than as an exact building-level headcount.

## Market Data

Market observations retain the geography of their official source. Regional price and rent series are not converted into invented 100 m market prices.

**Market Momentum** summarises the direction of 12-month regional private-domestic price and rent movement.

**Market Exposure** is a separate combined market-and-urban indicator asking where wider market movement overlaps with Development Pressure and Capacity Opportunity.

**Local Opportunity** is formed equally from Development Pressure and Capacity Opportunity. Capacity Opportunity combines the proportional share of capacity remaining with the absolute amount of remaining GFA. Market Exposure = Market Momentum × Local Opportunity.

Market Exposure is not a property valuation, investment recommendation or forecast.

Market data is kept separate from Development Pressure, Renewal Potential, Genesis Potential and the Urban Genetic Signature so that market behaviour can be compared with urban conditions rather than silently embedded within those models.

## Missing data and confidence

A low analytical value and a lack of data are different things.

Where structural analytical inputs are missing, available component weights are rebalanced rather than silently replacing the missing value with zero. Derived models retain a separate measure of data support where applicable.

A genuine numeric zero remains a valid value.

## Spatial interpretation

The 100 m hex is a common analytical reference cell. It should not be treated as a precise statement about every building, lot or property inside it.

The Atlas is intended to reveal patterns, clusters, contrasts and relationships across the city. The most useful question is often not “what is this score?” but:

**Why does this place differ from the places around it?**

## Interface character

The map is the primary interface. Public language should remain concise and intuitive, with deeper explanation available through information panels and selected-hex details.

The interface should feel like a **shop window into the Lab**: easy to enter, but backed by increasingly sophisticated data, analysis and testing.

## Data caveats

The Atlas is an analytical and exploratory tool rather than a definitive representation of Hong Kong.

Source datasets differ in date, scale, completeness and coverage. Missing values, outliers and uneven source coverage exist.

- **CONSTRAINED** is a special planning/context state.
- **UNASSESSED** means insufficient analytical context, not low performance.
- Recorded approvals and land activity are observed evidence, not certainty about future development.
- Strategic models contain explicit assumptions and should be read as lenses for investigation rather than predictions.

## Public/private boundary

This file contains public conceptual context only. It must not contain credentials, API keys, private endpoints, confidential working data or unreleased proprietary source material.
