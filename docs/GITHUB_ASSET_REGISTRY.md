# Front Office Atlas — Open-Source Asset Registry

This registry documents all third-party open-source repositories evaluated, integrated, or referenced by Front Office Atlas. Each entry clarifies its architectural role, license compliance, reuse policy, and operational boundaries.

---

### 1. Offensive Scouting Reference
- **Repository**: [adamgood3/nba-offensive-scouting-schemes-2025-26](https://github.com/adamgood3/nba-offensive-scouting-schemes-2025-26)
- **Purpose**: Spatial shot density, shot geography, league percentile profiling, team offensive identity, tactical scouting concepts.
- **License Status**: No explicit reusable license verified.
- **Reuse Policy**: **Reference-Only / Zero Code Copy**.
- **Front Office Atlas Integration**: 
  - Front Office Atlas independently implements native court-rendering components and shot zone profiling in TypeScript/React (`src/components/scouting/`).
  - No source code or proprietary assets are imported or copied from this repository.
  - Tactical concepts (rim attempt rates, corner three frequency, paint density) inform our schema design in `supabase/migrations/003_player_intelligence_expansion.sql`.

---

### 2. NBA Stats API (Python ETL Ingestion Layer)
- **Repository**: [swar/nba_api](https://github.com/swar/nba_api)
- **Purpose**: Python ETL ingestion layer for official NBA data (teams, active rosters, game logs, traditional box scores, advanced metrics, shot tracking, live scoreboard).
- **License**: **MIT License**.
- **Reuse Policy**: **Direct Backend / ETL Ingestion Utility**.
- **Front Office Atlas Integration**:
  - Encapsulated strictly in the server-side ingestion layer under `/etl/nba/`.
  - **Never called directly from React/browser client code**.
  - Reads raw data from upstream NBA endpoints, normalizes records with full provenance envelopes (`source_url`, `retrieved_at`, `effective_date`, `verification_status`), and stages data for Supabase ingestion.
  - Rate-limit protection, jittered exponential backoff, and caching are enforced.

---

### 3. Play-by-Play & Possession Analytics (NBA & G League)
- **Repository**: [dblackrun/pbpstats](https://github.com/dblackrun/pbpstats)
- **Purpose**: Ingestion and parsing of play-by-play data, possession counts, lineup on/off net ratings, shot distance zones, two-way player tracking, and possession context across both NBA and NBA G League.
- **License**: **MIT License**.
- **Reuse Policy**: **Direct Ingestion & Analytics Pipeline**.
- **Front Office Atlas Integration**:
  - Located under `/etl/pbp/`.
  - Computes possessions, 2-man, 3-man, and 5-man lineup metrics, and clutch splits.
  - Feeds the Lineup Intelligence and Two-Way Command Center modules.
  - Adheres to provenance standards; only finalized game logs are committed to permanent storage.

---

### 4. Secondary & Historical Multi-Sport Data Ingestion
- **Repository**: [sportsdataverse/hoopR](https://github.com/sportsdataverse/hoopR)
- **Purpose**: Secondary cross-validation, ESPN live play-by-play, box scores, shot locations, and historical bulk data verification.
- **License**: **MIT License**.
- **Reuse Policy**: **Secondary / Fallback / Verification Tooling**.
- **Front Office Atlas Integration**:
  - Positioned in `/etl/hoopr/` as an offline audit and verification script suite.
  - The React frontend is **never written in R**.
  - Used strictly to reconcile contradictory box score records or verify injury report timelines prior to database commits.

---

### 5. Source Discovery & Authority Index
- **Repository**: [JovaniPink/awesome-nba-data](https://github.com/JovaniPink/awesome-nba-data)
- **Purpose**: Ecosystem survey of basketball data providers, APIs, feeds, and historical databases.
- **License**: **MIT License**.
- **Reuse Policy**: **Inspirational & Source Registry Discovery**.
- **Front Office Atlas Integration**:
  - Informs the `SourceDeskView` catalog and source authority levels (`OFFICIAL_LEAGUE`, `COLLECTIVE_BARGAINING`, `VERIFIED_OUTLET`, `REPORTED`).
  - Inclusion in this list does not imply scrapability; each upstream provider requires explicit licensing verification before production pipeline onboarding.

---

### 6. Computer Vision & Court Mapping
- **Repository**: [sketscripter/Computer-vision-basketball-court-mapping-and-player-tracking](https://github.com/sketscripter/Computer-vision-basketball-court-mapping-and-player-tracking)
- **Purpose**: Court line detection, player tracking bounding boxes, homography transformation, and 2D court movement mapping.
- **License**: **Apache-2.0 License**.
- **Reuse Policy**: **Future Video Intelligence Architecture (with required Apache-2.0 attribution preserved)**.
- **Front Office Atlas Integration**:
  - Forms the foundation for the `/etl/vision/` tracking coordinates pipeline.
  - All derived coordinates must be strictly labeled as `DERIVED TRACKING` (never presented as official NBA Second Spectrum tracking data).

---

### 7. CBA & Cap Room Architecture Reference
- **Repository**: [aaguasvivas/the-cap-room](https://github.com/aaguasvivas/the-cap-room)
- **Purpose**: CBA rule architecture reference, multi-year cap sheets, explainable trade ledger models, and contract-aware player evaluation.
- **License Status**: No verified reusable license.
- **Reuse Policy**: **Reference-Only / Zero Code Copy**.
- **Front Office Atlas Integration**:
  - Front Office Atlas independently authors all CBA calculation formulas in TypeScript (`src/services/` and `src/data/cbaRules.ts`), strictly grounded in the official 2023 NBA-NBPA Collective Bargaining Agreement text.
  - No code or styling is reused from this project.

---

### 8. Video Analysis & Object Detection Reference
- **Repository**: [CyrilleAD/basketball-analysis-system](https://github.com/CyrilleAD/basketball-analysis-system)
- **Purpose**: YOLO-based player detection, basketball tracking, court keypoint identification, possession estimation, and speed/distance metrics.
- **License Status**: No verified reusable license.
- **Reuse Policy**: **Architectural Reference Only**.
- **Front Office Atlas Integration**:
  - Informs data schemas for frame-by-frame player movement tracking (`derived_tracking_points`).
  - No code is copied; Front Office Atlas maintains independent video intelligence contracts.

---

## Architectural Principles
1. **Frontend Isolation**: The React/Vite web application connects exclusively to Supabase via `@supabase/supabase-js`. It never invokes Python or R scripts in the browser.
2. **Provenance Traceability**: Every changing statistical, contractual, or scouting observation must carry a full evidence envelope.
3. **Auditability**: Unverified models are marked as `MODELED` or `CALCULATED`, keeping them strictly distinguished from `VERIFIED CURRENT DATA`.
