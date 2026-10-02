# FRONT OFFICE ATLAS — VERIFIED DATA IMPORT SPECIFICATION

This guide details the procedure for ingesting official, verified NBA player rosters, contracts, and front-office data into Front Office Atlas via Supabase / PostgreSQL.

---

## 🛡️ Zero-Fabrication Protocol

In strict compliance with Front Office Atlas data governance:
1. **Never fabricate player records**: Every ingested record must have verified provenance (`source_url`, `retrieved_at`, and `effective_date`).
2. **Never fabricate contracts or medical diagnoses**: Unverified fields must remain `null` or carry `INCOMPLETE` / `SOURCE PENDING` status.
3. **Temporal Discipline**: Context date is **October 1, 2026** (2026–27 Preseason / Training Camp period). Roster cuts prior to opening night must carry `roster_phase: "training_camp"`.

---

## 📋 Required Record Schema

Both **JSON** and **CSV** formats are supported. Each record must supply the following fields:

| Field Name | Type | Description | Required? | Example |
| :--- | :--- | :--- | :--- | :--- |
| `nba_player_id` | String | Official NBA player registration ID | **Required** | `"1630162"` |
| `full_name` | String | Full legal player name | **Required** | `"Amen Thompson"` |
| `team_identifier` | String | Team slug, 3-letter abbreviation, or name | **Required** | `"houston-rockets"` or `"HOU"` |
| `jersey_number` | String | Official active jersey number | Optional | `"1"` |
| `position` | String | Primary on-court position | **Required** | `"Guard / Forward"` |
| `secondary_position`| String | Secondary positional capability | Optional | `"Guard"` |
| `date_of_birth` | String | ISO Date (YYYY-MM-DD) | Optional | `"2003-01-30"` |
| `height` | String | Listed official combine height | Optional | `"6-7"` |
| `weight` | String | Listed official combine weight | Optional | `"200 lbs"` |
| `college_or_origin` | String | College, Overtime Elite, or international origin | Optional | `"Overtime Elite"` |
| `roster_status` | String | Standard roster status | Optional | `"Active Roster"` |
| `contract_type` | String | Contract archetype | Optional | `"Rookie Scale (Standard NBA)"` |
| `two_way_status` | Boolean | True if signed to Two-Way deal | Optional | `false` |
| `headshot_url` | String | Canonical URL to player headshot | Optional | `"https://cdn.nba.com/headshots/nba/latest/1040x760/1630162.png"` |
| `roster_phase` | String | Snapshot phase | Optional | `"training_camp"` |
| `effective_date` | String | Effective date (YYYY-MM-DD) | Optional | `"2026-10-01"` |
| `source_url` | String | Provenance URL of official release or feed | **Required** | `"https://data.nba.com/v1/league_operations"` |
| `retrieved_at` | String | Ingestion ISO timestamp | **Required** | `"2026-10-01T12:00:00Z"` |

---

## 💻 Ingestion Command Line

Run the import script using `tsx`:

### Dry Run (Validates Integrity Without Touching Database)
```bash
npx tsx scripts/import-rosters.ts --dry-run data/2026_preseason_rosters.json
```

### Production Ingest (Inserts & Updates Supabase Tables)
```bash
# Ensure server-side credentials exist in .env or environment
export SUPABASE_SECRET_KEY="your-supabase-secret-key"

npx tsx scripts/import-rosters.ts data/2026_preseason_rosters.json
```

### CSV Format Example (`data/rosters.csv`)
```csv
nba_player_id,full_name,team_identifier,jersey_number,position,secondary_position,height,weight,college_or_origin,two_way_status,headshot_url,source_url,retrieved_at
1630162,Amen Thompson,houston-rockets,1,Guard / Forward,Guard,6-7,200 lbs,Overtime Elite,false,,https://data.nba.com/v1/league_operations,2026-10-01T12:00:00Z
```

---

## 🔄 Dynamic Automatic Rendering in UI

Once records are imported into the `players` and `roster_memberships` tables in Supabase:
1. Every team in **Front Office Atlas** queries its roster dynamically by `team_id`.
2. The universal, reusable `PlayerCard` component handles rendering for every player without hard-coding individual card components.
3. If no verified records have been imported yet or if Supabase is temporarily unreachable, Front Office Atlas automatically activates its **graceful local fallback mode**, cleanly displaying:
   `CURRENT VERIFIED ROSTER DATA AWAITING IMPORT`
   and allowing GMs to inspect the layout using the non-destructive **Architectural Specimen** preview.
