TRUSTTRIP — INDEPENDENT ASTRA BUILD

AI USAGE LIMITS
Server-side usage controls are described in COST_CONTROLS.txt; all settings and defaults are in .env.example. Defaults: 5 chat attempts per rolling minute, 30 chats/day/user, 5 itineraries/day/user, 200 model attempts/day globally, and at most 2 explanation attempts/trip. Daily reset is 00:00 UTC. Set AI_ENABLED=false to pause new AI calls. Counters persist in Firestore; failed attempts count. These controls do not cap hosting/database bills or guarantee a currency amount. Deploy/sync the new source to enable them in AI Studio.

REVISION CHRONOLOGY — 8 October 2026
The independent build originally used the AI-chat-first experience in BUILD_PROMPT.txt. Harsh briefly requested a form-first revision, recorded before that attempt in FORM_FIRST_REVISION_PROMPT.txt. Before a verified form-first preview restart, Harsh cancelled it and explicitly restored AI as the main experience. The active implementation is again AI chat first, with an optional editable summary. The cancelled form-first prompt is retained only as history; BUILD_PROMPT.txt governs the active experience. No separate older implementation was consulted during either change.


Run locally (Node 22+):
  npm install
  npm run check
  npm test
  npm run build
  npm start
Default preview: http://localhost:4179
The server serves dist and the API from the same origin. No fake sign-in, memory database or canned AI response is used in the app. Test doubles exist only under tests/.

SOURCE AND CHRONOLOGY
BUILD_PROMPT.txt is the exact supplied six-part prompt read before this independent implementation. ASSIGNMENT_PART2.txt is the assignment excerpt. No earlier TrustTrip implementation, archives, source files or earlier localhost previews were inspected or copied by this build agent. Public official docs and runtime dependencies were used. This local build is not evidence of building or publishing in Google AI Studio.

CONFIGURATION (NOT PERFORMED)
1. Copy .env.example to .env inside this folder. Never commit .env or service credentials. Enter secrets only through the platform's secure environment/secret settings, not chat.
2. Supply your own public Firebase web settings. Enable authorized email/password and/or Google sign-in. Add the eventual app domain to Firebase Authentication's authorized domains.
3. Choose/create the authorized Firestore database. Set FIRESTORE_DATABASE_ID explicitly, including named databases. Supply hosting-authorized Application Default Credentials with access to that project/database; public client config is not an Admin credential. Set ENABLE_FIREBASE_ADMIN=true only after setup. Deploy firestore.rules to that exact database (all browser reads/writes denied; all app access uses owner-checked server routes).
4. Set GEMINI_API_KEY and GEMINI_MODEL in secure server settings. Select a model actually available to the account that supports generateContent structured JSON; no model name is invented or assumed by default. Test quota before evals.
5. Set APP_ORIGIN to the exact app origin. Set PORT to the hosting-assigned port and HOST=0.0.0.0 for container/cloud hosting. The local default binds 127.0.0.1 only.
6. Restart and sign in. 'Configured' never means 'verified'. Record successful real checks separately.

CATALOGUE LIMITATION
catalogue/catalogue.json deliberately starts empty. Every destination currently receives a coverage-limited plan of general daily suggestions, with no suggested hotel, route, clinic, bathroom stop, local event or verified cost. This is not a complete useful travel inventory. The AI selects general activities by ID, which the server resolves into explicit generic text; it cannot introduce factual free text in saved itinerary plans. Prices remain null, never zero. Affordability must fail until a complete sourced cost engine and price inventory exist. The current code does not total partial hotel prices or claim them as complete costs.
To expand coverage, independently research properties and validate catalogueSchema in server/domain.js. Every non-Unverified claim needs a real URL, source date and checked date. Inspect source substance manually; schema validation proves structure, not truth. Adverse lift/step-free reports conflict with no-stairs requests. Other adverse reports remain visible and are not recast as lift evidence. Unknown lift evidence remains unknown. Room groups are requests; physical capacity and availability are unverified.

HUMAN-REVIEWED AUTOMATION (IMPLEMENTED; EXTERNAL SETUP DEFERRED)
The current generation flow explicitly accepts fictional evaluation inputs only, because the specified Airtable base is public for grading. A required user checkbox is reinforced by evaluationOnly:true on the server. Do not enter actual private traveller data for this evaluation.
Authorize external setup separately. Supply AIRTABLE_TOKEN with data.records read/write and schema.bases read access only to appV8g3WvLNKVEPom. Itinerary_Log must already exist with Timestamp (date/time), Persona (Linked Record to Personas), Itinerary Summary (long text), AI Explanation (long text), Review Status (single select containing Pending, Approved, Rejected). This experiment does not mutate table schemas.
The server verifies the real link target and resolves Persona Name dynamically, allowing descriptive suffixes after Meena Agarwal/Arjun Rao and rejecting missing/ambiguous matches. No persona record ID environment variables are used.
Import automation/n8n-workflow.json into an authorized self-hosted n8n instance. Configure TRUSTTRIP_BASE_URL in its environment and a Header Auth credential with Authorization: Bearer <AUTOMATION_TOKEN> on BOTH HTTP nodes and the webhook. Set the same token securely on the server, ENABLE_AUTOMATION=true, and N8N_WEBHOOK_URL to the n8n production webhook URL. Verify the workflow is activated only after authorization. Self-hosted n8n can run locally without buying n8n Cloud; free third-party hosting is not claimed. A manual local execution is a manual demonstration, not an automatically deployed workflow.
Each saved trip and its automation event are created atomically. Immediate webhook delivery plus scheduled polling recovers queued events. n8n calls the server endpoint; that endpoint calls Gemini, stores the private draft, and creates a Pending Airtable row with AI Explanation blank. This is an HTTP node invoking an LLM server endpoint, not a native LLM node.
Assign the Firebase custom claim trusttripReviewer:true server-side using an authorized Admin process to Harsh's reviewer account only, then refresh sign-in. Never permit users to grant their own role. The review desk shows the full itinerary, evidence gaps and private draft. Harsh explicitly approves/rejects. Approval PATCHes Airtable, reads it back, then publishes that exact approved text. Rejection keeps the public explanation blank. Review drafts and reviewer identifiers never appear in traveller routes.
Jobs use leases and fenced failure writes. Completed work is idempotent. A previously attempted Airtable create without a known result is reconciled by the unique trip marker; if no row is found, the server blocks automatic re-creation. An administrator must inspect Airtable and resolve the ambiguous state, never blindly retry it. No insecure reconciliation endpoint is exposed. Failed approval syncs retain the chosen decision/text for a consistent retry.

REAL VERIFICATION CHECKLIST — ALL PENDING
- Sign in as test account A, discuss and correct a trip, edit room allocation, confirm a new trip.
- Verify same preferences and exact trip ID after sign-out and new sign-in/browser session.
- Sign in as B: attempt GET on A's trip ID, PUT draft with forged owner fields, review access and approval. Expect 404/422/403 as applicable. Confirm A unchanged.
- Open two tabs on one draft, issue competing chat/manual edits. One succeeds, stale version receives 409; reload and reconcile.
- Test successful generation creates exactly one trip/event; verify unauthenticated webhook fails.
- Execute at least 3 real explanation runs. Check Pending Airtable explanations are empty. Harsh must perform actual human decisions; no agent substitutes. Record exact typed input, model itinerary, private LLM draft in a reviewer-private working record, linked record ID, actual human decision and traveller-visible result. Before copying the final submission transcript, redact private reviewer/account data and use fictional inputs only.
- Run all 8 evaluation inputs through the app, preserve actual outputs before any repair, then score every rubric and assertion. Unknown totals fail affordability.
- Owner-authorized deletion requires a recent sign-in. It blocks active jobs and unresolved external writes. It removes linked Airtable rows, trips, events, private drafts and Firebase account. If an external deletion fails, it keeps a deleting tombstone and reports failure for retry; do not claim success. Independently test successful deletion and partial-failure recovery. Provider logs/backups may retain data under their policies.

GOOGLE AI STUDIO HANDOFF — NOT DONE
Import this source into an authorized Google AI Studio Build workspace using its available project import flow (or recreate from BUILD_PROMPT.txt and include these source files). Retain the Node server; a static frontend alone cannot protect Gemini/Admin secrets. Configure supported server secrets, Firebase Auth and the named database. Set HOST/PORT/origin correctly. Rebuild, run the real acceptance checklist and eight evals in the builder. Publish only after Harsh authorizes deployment; do not enable billing. If deployment asks for paid resources, stop and record the exact blocker. Paste the actual public working app URL into the final Google Doc only after verification. localhost and a private repository are not that link. Builder import/deployment availability has not been verified in this experiment.

OFFICIAL REFERENCES USED
https://ai.google.dev/api/generate-content
https://firebase.google.com/docs/firestore/manage-databases
https://firebase.google.com/docs/reference/admin/node/firebase-admin.firestore
