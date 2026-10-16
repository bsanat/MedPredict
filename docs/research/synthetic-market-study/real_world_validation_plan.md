# Real-world validation plan — proposed, not conducted

Date: 16 October 2026 (Asia/Almaty). This is an **AI-generated proposed research plan**, not a record of recruited participants, completed interviews or validated findings. All personas, interviews, quotes and findings elsewhere in this study are AI-generated simulation. Real humans and relevant experts must supply independent evidence.

MedPredict is an educational diploma project at Astana IT University by Sanat Bogenbayev, Ali Baymen and Oralkhan Seilkhan. The attachment names M. K. Turarova as advisor, but repository confirmation remains outstanding. Existing React/TypeScript/Vite frontend is implemented; Java/Spring Boot and ML are ongoing, ONNX proposed rather than verified. The prototype is not intended as a medical device or for diagnosis, treatment or clinical decisions; no clinical certification is established here. This plan proposes no change to existing code, API, design or database.

## Purpose and separation of evidence

Challenge A01–A08 from the [interview script](interview_script.md) with recent real practices, observed tasks and contrary cases. Preserve the exploratory breadth of [profiles-v2.md](profiles-v2.md), without treating those invented names or attitudes as a sampling frame. The academic question and educational audience remain provisional until genuine participants and the supervisor support them. Use the existing frontend as it stands; suggested UX improvements remain recommendations for a later separately authorized task.

Technical accuracy, API timing and Python–Java equality belong only to the [experimental evaluation plan](experimental_evaluation_plan.md). Human confidence, clinician approval or willingness to pay cannot substitute for those experiments. Technical results likewise cannot validate a user need or clinical benefit.

## Before recruitment

Sanat and the team should confirm the supervisor and ask the university’s appropriate ethics/research contact what review, consent and data-handling procedure applies. Record that determination rather than inventing an ethics approval. Consult a medical ethics advisor before inviting people in patient roles or discussing sensitive contexts. Ask a qualified privacy/regulatory expert to review intended-use wording and the proposed data flow; this study supplies no legal classification or compliance assurance.

Use a bounded educational session on fabricated cases; do not recruit for diagnosis, screen anyone’s health, or ask for personal medical values, records or diagnoses. Adults may discuss a generic workflow and skip sensitive experiences. A clinician participates as an expert, not as an approving regulator or treating professional. Keep recruitment contacts and any consent forms outside the public repository in an institution-approved place. Participation must be voluntary and unrelated to grades or care; account for a lecturer/student power relationship.

Prepare a plain-language information sheet: purpose, voluntary participation, tasks, duration, no medical advice, fabricated inputs only, note-taking method, who sees notes, retention/deletion arrangements, ability to stop, and a private contact for questions/withdrawal. Agree the actual arrangements before collecting anything; do not promise deletion or anonymity the team cannot implement. Prefer anonymous written task notes; audio/video only with separate explicit agreement and an approved storage plan.

## Recruitment in two stages

Initial round: **five proposed discussions**, within the existing repository’s 3–5 discussion plan. This is a purposive educational pilot, not a representative market sample or an assertion of saturation.

| Real role to recruit, not an invented profile | Proposed number | Question it helps challenge |
|---|---|---|
| University student working on a medical-AI demonstration | 1 | Does a real coursework task benefit beyond notebooks? |
| Medical-AI/data researcher | 1 | Are provenance and evaluation explanations useful for a real research workflow? |
| Healthcare professional interested in data analysis | 1 | Which output interpretations and intended-use boundaries are unacceptable? |
| Adult indicator-monitoring stakeholder, preferably with limited digital confidence | 1 | Is there any relevance, and where do terminology/manual inputs obstruct understanding? Do not assume the person has a condition. |
| University lecturer evaluating prototypes | 1 | What evidence is needed for assessment, and who can authorize a teaching-tool purchase? |

Separate consultations: one medical ethics advisor and one privacy/regulatory/data-handling specialist, if available. They review the protocol/intended use, not the market. Consultations do not automatically count as user interviews. If initial evidence leaves older-adult, privacy-skeptic or early-adopter questions unresolved, run a second targeted round with those roles and another independent medical-methods researcher. Select contrary cases deliberately; do not fill demographic quotas from imagined profiles or claim coverage of all ten archetypes after five interviews.

The owners must arrange real invitations separately; no invitation, booking or message is sent by this documentation task. Compensation, if used, should reimburse participation rather than depend on favorable feedback. No price or budget is assumed.

## Session, approximately 25–35 minutes

1. Obtain agreed consent and record participant code P01–P05, role fit, date and language. Keep names/contact details separate. Make clear that a participant can decline the tool or the entire session.
2. Ask Q01–Q05 before mentioning MedPredict. Request a recent non-sensitive example, or an imagined case explicitly marked as such if no real example can be discussed. Record a lack of relevant need rather than steering toward one.
3. Present the agreed neutral concept card at Q06 and ask for an initial teach-back before explanation or correction. Explicitly distinguish understanding of the described concept from understanding of the actual interface. Ask Q07 and record whether the participant recognizes the fixed example.
4. On the existing local demo, use a supplied fabricated case sheet and ask the participant to enter it, correct one empty/incorrect field, inspect a result and optionally export the existing PDF. Give a second fabricated input and ask what the repeated demo number means. Observe actions without claiming to inspect a real model. Do not connect live backend or actual patient data merely for the interview.
5. Continue Q08–Q15, separating evidence requests from actual evidence. Ask about demo, future real server and downloaded-file handling. Q10 remains a hypothetical unsafe setup; never transmit personal information or configure an unsafe service to test the answer.
6. Ask Q16–Q17 last, without anchoring a price. Separate tool spending from care/device/research costs; distinguish current educational prototype from future services and identify any lack of purchasing authority.
7. Debrief any mistaken clinical interpretation. Remind the participant that the demo is fixed and is not health advice. Invite corrections to notes and ask whether any exact quotation may be retained in an anonymized report. Quote only the wording and context the participant authorized.

If the participant attempts to provide real records or asks for medical interpretation, stop that part of the session and return to fabricated material and the research purpose. Follow the institution’s agreed procedure for incidental sensitive disclosure; do not place it in Git or public notes.

## Proposed decision rules, to confirm before sessions

These are small-pilot research triggers, not statistically validated thresholds or clinical safety acceptance criteria. They guide documentation and follow-up only; they authorize no automatic code changes.

| Assumption | Evidence and proposed interpretation | Disconfirming or blocking evidence |
|---|---|---|
| A01 value | Both educational participants independently identify a recent relevant task and explain a concrete advantage or learning outcome compared with their current method | No relevant task, no advantage, or demand that is actually for an unavailable clinical/record-management product; narrow or reject the value claim |
| A02 comprehension | Record each person’s unprompted explanation of fixed demo, genuine inference and no diagnosis, before debriefing | Any clinical interpretation, false personalization or confusion over repeated output triggers a documented communication concern and retest recommendation; even all five succeeding proves no population-wide comprehension |
| A03 privacy | Each participant explains what they would share and why; compare their account against the documented demo/real/PDF paths with an expert | Reliance on vague assurances or missing backend handling documentation leaves the real-mode question unresolved; refusal to share personal data is legitimate, not a conversion obstacle to bypass |
| A04 input feasibility | Record fabricated-case completion, missing inputs, units errors, requests for help, corrections and abandonment; describe each failure | Guessing unavailable laboratory values or needing tests just to use the tool contradicts casual-monitoring feasibility; a pilot completion count does not validate actual patient-data availability |
| A05 credibility | Researcher and clinician identify the evidence they need and review the actual task/evaluation protocol | Asking for independent validation is a requirement, not proof it exists; fixed demo cannot satisfy model-quality evidence |
| A06 export | At least one participant with a real reporting task can explain when they would use the current PDF and interpret its mode/limits correctly | No sharing task, loss of provenance, confusion with a medical record, or inability to manage exported information; mark value conditional or absent |
| A07 accessibility | Observe the intended devices/languages and keyboard/assistive setup where applicable; record comprehension and task errors separately | An untested device, language or assistive workflow remains untested; one fluent synthetic persona or automated browser report is insufficient |
| A08 payment | Record unprompted amount/payment basis or unknown, authority and competing budget separately for today’s prototype | Zero demand, no budget/authority, or interest only in another future product; do not derive a price or business model from health spending |

## Analysis and traceability

Use a versioned anonymized note for each real participant: code/role/date/language; consent scope; current task/alternative; observed action; exact authorized quote if any; interviewer interpretation separately; A/FR/NFR reference; contrary evidence; decision; owner and follow-up. Add whether a statement was prompted, hypothetical or directly observed. Do not copy these synthetic transcripts into real-person records or reuse U01–U10 labels.

Sanat codes the initial notes and a second team member checks at least one supporting and one contrary case per proposed theme. Resolve disagreements by preserving the evidence and recording uncertainty. Counts refer only to that purposive sample; avoid market percentages, causality or saturated-theme claims. Report missing/declined answers and unsuccessful tasks, including negative feedback. Keep any future empirical status limited to the evidence actually collected; none is established by this plan.

Proposed next decisions are: retain a narrow educational audience, revise the hypothesis or declare a role irrelevant; identify recommendations for later review; and agree which experiment is feasible. Before editing any protected source, API or existing document, explain the concrete change and obtain the user’s permission. No findings automatically become features.

## Proposed timing and completion evidence

Aligned with the repository’s pre-defense date of 24 October 2026: by 18 October seek supervisor/ethics advice and finalize consent; 18–20 October invite and conduct the initial discussions if approved and feasible; 20–21 October analyze and review; 21–22 October discuss with supervisor; by 23 October prepare an honest status record. These are proposed dates, not scheduled or completed activity. If approvals/participants are unavailable, report pending research instead of lowering evidence standards.

Completion evidence: genuine anonymized notes or genuine customer agreement satisfying the actual institutional requirement, documented consent/handling, a traceable claim-to-observation matrix, contrary cases, supervisor feedback and a dated decision record. The existing [user-validation requirement](../user-validation.md) also calls for requirement review by the team. That remains pending and outside this documentation-only change. The five-discussion pilot cannot establish clinical safety, effectiveness, representative willingness to pay or regulatory status.
