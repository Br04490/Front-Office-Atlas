# Execution Planner upgrade — local preview

## What is implemented

- The six homepage cards, their order, the Crystal visual system, 30 team portals, roster photos, and 18 protected Scenario Lab templates remain in place.
- Execution Planner has six internal sections: Ask & Upload; Audience Selector; Knowledge & RAG Studio; Presentation & Video Studio; Proactive Preparation; Review & Distribution.
- Roster actions, an actionable Scenario Lab working copy, Trade Lab / Intelligence Lab's Trade Case Builder, Ask CBA's proposed-action follow-up, and Automated Sheets can offer temporary preparation. Viewing a roster card alone does not offer it.
- YES starts a real local-server job. NO creates nothing. The job can finish while navigating the site. The packet includes three editable **Atlas supporting** drafts: transaction context worksheet, CBA and approval checklist, and internal briefing.
- Temporary jobs stay in server memory for 30 minutes. Discard, Cancel, or expiry removes the packet from memory. Minimal status/context metadata remains until the local server restarts; this implementation has no durable audit log. A browser refresh loses the handle to an unaccepted temporary job, which still expires on the server.
- Save explicitly writes the reviewed packet to `.atlas-private/saved-packets/` with restrictive file permissions where supported. Saved Documents lists those files and reopens them. There is no automatic signing, sending, filing, or publishing.
- Audience drafts preserve the exact author-entered source evidence and citation notes across selected audience variants. The audience changes only the focus text. A PowerPoint export is an actual editable `.pptx` file, generated on demand by `pptxgenjs`.
- The local HTTP server listens on `127.0.0.1:3000`, serves same-origin preparation and presentation endpoints, and blocks static access to `.atlas-private`, `node_modules`, and `services`.

## Official form registry

The reference is the [NBPA's 2023 NBA–NBPA CBA](https://nbpa.com/cba) and its [official 676-page PDF](https://imgix.cosmicjs.com/25da5eb0-15eb-11ee-b5b3-fbd321202bdf-Final-2023-NBA-Collective-Bargaining-Agreement-6-28-23.pdf), effective July 1, 2023. The registry identifies Uniform Player Contract (Exhibit A), minimum-salary compensation (Exhibit 1A), Trade Payments (Exhibit 4), Physical Exam (Exhibit 6), and Sign and Trade (Exhibit 8). These are **references only**. Their legal language is never recreated or auto-populated by Atlas. The only generated documents are labeled Atlas supporting worksheets, checklists, and briefings. Public league-office transaction templates are not claimed.

## Current limits

- File selection validates extension, size, and user authorization acknowledgment in the browser. Contents are not parsed, uploaded, retrieved, or retained by the server. Ownership cannot be independently verified.
- The Knowledge & RAG Studio is an evidence/permission map, not a connected RAG service. Private contracts, licensed tracking data, medical material, film, and team documents need a real identity/access-control layer and source connectors.
- No deterministic salary-matching, cap, tax, exception, eligibility, or transaction validation engine is connected. Ask CBA does not make a legal determination. No official form generation is available.
- Film, narrated video, animation, and external distribution are not implemented. The local presentation tool produces an editable draft and PowerPoint; it does not invent clips or results.
- The local single-user server has no account authentication or encrypted at-rest storage. Do not put sensitive team records into it or expose it to a network. Production use needs authentication, authorization, encryption, durable jobs, versioning, and policy-based retention.
- The original NBA roster/photo snapshot is dated November 15, 2026; it is not a live feed. Its unresolved photo and jersey flags remain documented in the player audit.

## API and testing

- `POST /api/preparations`: authorize a temporary draft job.
- `GET /api/preparations/:id`: actual status and packet.
- `POST /api/preparations/:id/cancel|discard|save`: explicit state transitions.
- `GET /api/preparations/:id/export?format=txt|pptx`: real downloads.
- `GET /api/preparations/saved` and `/saved/:id`: saved packet listing and retrieval.
- `POST /api/presentations`: editable audience PowerPoint download.

Run `node --test tests/*.test.mjs` for packet, discard, expiry, and PowerPoint tests. Browser verification covered all 30 rosters, 511 approved local thumbnails, six homepage cards, the consent flow, background navigation, review, Save, audience adaptation, and the form registry with no page errors.
