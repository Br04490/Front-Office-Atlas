# FRONT OFFICE ATLAS

**NBA Front-Office Intelligence & General-Manager Decision Platform**

Front Office Atlas is a private-grade basketball operations and cap strategy platform engineered for NBA general managers, assistant GMs, capologists, personnel directors, scouts, and analytics departments.

---

## 🏛️ Core Capabilities

- **All 30 NBA Franchises**: Dynamic, universal team-page architecture organized by conference and division.
- **Houston Rockets Pilot**: Featured pilot organization demonstrating full multi-year cap modeling, G League development pipeline (Rio Grande Valley Vipers), and strategic outlook.
- **Official 2026–27 CBA Thresholds**:
  - **Salary Cap**: `$164,961,000`
  - **Salary Floor**: `$148,465,000` (90% minimum team salary)
  - **Luxury Tax Level**: `$200,428,000`
  - **First Apron**: `$209,015,000`
  - **Second Apron**: `$221,686,000`
- **Cap & Apron Dashboard**: Separate tracking for **Team Salary**, **Apron Team Salary**, and **Tax Team Salary** across the 2026–2032 horizon.
- **ATLAS CBA**: Persistent Collective Bargaining Agreement intelligence assistant providing structured answers, Article/Section rule basis, calculations, and legal screening disclaimers.
- **Executive Trade Lab**: Multi-team trade workbench supporting Team A, Team B, and facilitating clubs with 10 automated CBA compliance tests.
- **G League Development Pipeline**: 11-stage organizational pipeline with strict financial separation walls and independent club support (Capitanes de Ciudad de México).
- **Draft Ledger (2027–2034)**: Tracking future obligations, Ted Stepien rule compliance, and Second-Apron frozen pick penalties.
- **Prospect Pipeline (2027–2034)**: Strict separation between *Ranked Prospects* and *NBA Draft Eligible* entrants.
- **Source Desk & Data Provenance**: Audited data lineage tracking refresh intervals, authority levels, and canonical source references.

---

## 🛡️ Data Governance & Zero-Fabrication Protocol

In strict adherence to NBA front-office protocol:
- **No Fabricated Player Contracts or Medical Diagnoses**: Player data and rosters display authentic states (`VERIFIED_CURRENT`, `REPORTED_CURRENT`, `CALCULATED`, `SCENARIO`, `INCOMPLETE`, or `UNAVAILABLE`).
- **Context Date**: October 1, 2026 (2026–27 Preseason / Training Camp period). Roster snapshots distinguish training camp invitees from final opening-night rosters.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/front-office-atlas.git
cd front-office-atlas

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to access Front Office Atlas.

---

## 🧱 Future PostgreSQL / Supabase Schema

The service abstraction layer (`src/services/index.ts`) is designed for seamless transition to Supabase/PostgreSQL tables:
- `teams`
- `affiliates`
- `players`
- `roster_memberships`
- `contracts`
- `contract_seasons`
- `dead_money`
- `cap_holds`
- `exceptions`
- `team_cap_snapshots`
- `cap_thresholds`
- `transactions`
- `draft_assets`
- `injury_events`
- `gleague_relationships`
- `prospects`
- `cba_rules`
- `source_records`
- `trade_scenarios`
- `recommendations`

---

## 📄 License
Internal Basketball Operations Platform · 2023–2030 NBA-NBPA Collective Bargaining Agreement Compliant.
