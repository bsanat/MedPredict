# Cross-interview synthesis — AI-generated simulation

Date: 16 October 2026 (Asia/Almaty). **AI-generated simulation: every persona, interview, quotation and finding from the simulated corpus is fictional. No real participant was recruited or interviewed. All real-world assumptions remain empirically untested.** These materials generate hypotheses and cannot replace human research or clinical/expert consultation.

MedPredict is an educational diploma project at Astana IT University by Sanat Bogenbayev, Ali Baymen and Oralkhan Seilkhan. The attachment names M. K. Turarova as advisor, but repository confirmation remains outstanding. The React/TypeScript/Vite frontend is implemented; Java/Spring Boot and ML development are ongoing, with ONNX proposed rather than verified. MedPredict is not intended as a medical device or for diagnosis, treatment or clinical decisions; no clinical certification is established by the inspected evidence.

## Corpus and method

Only the ten revised [v2 profiles](profiles-v2.md) and [U01–U10 transcripts](README.md#transcript-index) constitute the active corpus; the retained first profile version is superseded and excluded. The user approved the educational scope, specified the revised role distribution and approved all eight assumptions and the 17-question script. Ten distinct persona agents generated one complete dialogue each. Up to three ran concurrently in a rolling sequence because this session has four agent slots including the coordinator; ten simultaneous agents were not available. Each persona agent received its own 30-field profile and the common script, not other personas’ responses. They still share the session’s default model and researcher-supplied framing, so separate execution is not independent human evidence.

The coordinator read all 170 generated core answers, assigned the descriptive codes below, examined exceptions and mapped interpretations to question anchors. Counts describe only the generated texts, with denominator ten, and are not estimates of people, demand or likelihood. No statistical tests, saturation claim, inter-rater reliability, actual behavior observation or clinical interpretation is claimed. Most answers are English; U08 answers are Russian with a short Kazakh phrase. This is neither a translation study nor proof that localization works. Exact model version/seed/temperature were not available in this workflow, so exact regeneration is not guaranteed.

## Auditable descriptive coding — AI-generated corpus only

Coding rules: **F** = explicitly recognizes the fixed example in Q06/Q07; **R** = also describes a residual mistaken first interpretation in Q06/Q07; **D** = declines personal health disclosure in the hypothetical unencrypted context in Q10; **P** = offers zero for the present prototype in Q17; **O** = offers a positive one-time amount in Q17. R is not inferred from age or skepticism; it requires an explicit statement. A yes for F does not cancel R. A no for P is not a subscription commitment.

| Fictional persona | F | R | D | P | O | Current-prototype WTP and primary simulated use |
|---|---|---|---|---|---|---|
| [U01](transcripts/user_01_transcript.md#q12) | Yes | No | Yes | Yes | No | 0 KZT; supervisor discussion of a synthetic example |
| [U02](transcripts/user_02_transcript.md#q12) | Yes | No | Yes | Yes | No | 0 KZT; reproducible reporting, conditional on advantage over notebooks |
| [U03](transcripts/user_03_transcript.md#q12) | Yes | No | Yes | Yes | No | 0 KZT; occasional explanation, no continuing monitoring need |
| [U04](transcripts/user_04_transcript.md#q12) | Yes | No | Yes | Yes | No | 0 KZT; bounded learning, not condition management |
| [U05](transcripts/user_05_transcript.md#q12) | Yes | No | Yes | Yes | No | 0 KZT; trainee exercise about definitions and limits |
| [U06](transcripts/user_06_transcript.md#q12) | Yes | No | Yes | Yes | No | 0 KZT; methodological discussion, no accuracy inference |
| [U07](transcripts/user_07_transcript.md#q12) | Yes | Yes | Yes | No | Yes | KZT 1,000 once; curiosity/learning, explicitly no subscription |
| [U08](transcripts/user_08_transcript.md#q12) | Yes | Yes | Yes | Yes | No | No payment, coded 0 KZT; one paced, assisted exploration |
| [U09](transcripts/user_09_transcript.md#q12) | Yes | No | Yes | Yes | No | 0 KZT; synthetic data-flow inspection |
| [U10](transcripts/user_10_transcript.md#q12) | Yes | No | Yes | Yes | No | 0 personally; classroom assessment, institutional authority unknown |
| **AI-generated corpus totals** | **10/10** | **2/10** | **10/10** | **9/10** | **1/10** | No representative price, adoption or clinical conclusion follows |

For every row, F/R evidence is in that transcript’s Q06–Q07, D in Q10 and P/O in Q17. The role/use column is Q12. The next sections explain why agreement is partly designed into the prompt. These codes were assigned by one AI coordinator, not independently audited human coders.

## H01 — meaning and provenance recur as simulated problems

**AI-generated finding:** educational users describe difficulty preserving what produced a result after it is copied. U01 loses a simulation label in slides (Q04); U02 loses a model-version link in a spreadsheet (Q04); U05 cannot interpret an unspecified target (Q04); U06 finds outcome definitions differ (Q04); U10 cannot reproduce a screenshot’s evaluation context (Q04). These narratives support asking real users about provenance; they do not establish that those events happened or that the existing PDF solves them.

The corresponding hypothesis is narrow: a learning artifact may help connect fabricated input, source/mode, units, returned version when supplied, and limits. This is not evidence for longitudinal patient monitoring, diagnosis, a medical-record platform or a new account/history feature.

**AI-generated quotation**, U10 Q12: “I would not recommend adoption simply because students had built a working frontend.” [Fictional dialogue](transcripts/user_10_transcript.md#q12).

## H02 — the numerical demo may still invite simulated overinterpretation

**AI-generated finding:** all ten texts repeat the supplied fixed-example explanation, while U07 imagines mistaking repeated output for rounding and U08 imagines a failed button press. This is a corpus tension, not an observed comprehension rate. The concept card explicitly taught the explanation before these answers; repeated correct wording is therefore weak evidence even inside the simulation.

**AI-generated quotation**, U07 Q07: “I’d probably first wonder whether those different inputs happened to produce the same rounded prediction.” [Fictional dialogue](transcripts/user_07_transcript.md#q07).

**AI-generated quotation**, U08 Q06, original Russian: “Но слово «прогноз» меня всё равно сбивает: хочется спросить, про кого тогда эта цифра.” [Fictional dialogue](transcripts/user_08_transcript.md#q06). This quote is invented, not a translation or a real older adult’s statement. It motivates a teach-back question, not a claim that the completed UI is defective.

## H03 — simulated trust is conditional and task-dependent

**AI-generated finding:** interest in a teaching artifact coexists with refusal to infer clinical accuracy. U02/Q08, U05/Q08, U06/Q08 and U10/Q08 request task/data/evaluation evidence; U03/Q08 and U04/Q08 retain clinician judgment for health decisions. Enthusiasm in U07 does not establish safe interpretation. None viewed or tested a model, so “trust” here is a fictional attitude, not calibrated reliance.

An important boundary: A05 concerns what people say would make a result credible. T01 must actually compare held-out MAE/RMSE against baselines. T02 must measure API response times and Python–Java consistency. No interview answer can satisfy either technical objective; see the separate [experimental plan](experimental_evaluation_plan.md).

## H04 — privacy has distinct browser, server and exported-file boundaries

**AI-generated finding:** all ten Q10 answers refuse personal health disclosure in an explicitly hypothetical unencrypted setup. All are willing to consider fabricated examples, subject to varying explanation needs. The obvious unsafe scenario and high assigned privacy scores strongly prime these answers. This does not establish actual refusal behavior, willingness to disclose under encryption, or security of any deployed system.

**AI-generated quotation**, U09 Q09: “Frontend memory alone proves little about backend handling; personal information stays out until those claims are explained and verified.” [Fictional dialogue](transcripts/user_09_transcript.md#q09).

Repository evidence is separate: the current demo adapter ignores input and returns the fixed example; README documents no indicator requests in demo and memory-only frontend storage. Future real-mode handling is a backend question, and an exported PDF creates a copy outside browser memory. No security audit, encryption verification or legal compliance determination occurred. [Local sources R01–R02/R05 and evidence limits](sources.md).

## H05 — everyday monitoring may not match the current educational purpose

**AI-generated finding:** U03/Q04 and Q12 reports little continuing need; U04/Q05 and Q12 keeps a paper diary and clinician routine; U07/Q11 would not obtain tests to try a demo; U08/Q11 needs abbreviations and units explained. These are imagined mismatch cases. They challenge the assumption that adults interested in health numbers are automatically suitable users of this educational workflow.

**AI-generated quotation**, U03 Q04: “I do not have a daily monitoring problem that demands another app.” [Fictional dialogue](transcripts/user_03_transcript.md#q04).

Manual entry is described as acceptable for supplied fabricated cases, but the corpus does not prove real cholesterol/glucose availability, successful entry or useful recurring use. Do not add imports or a diary feature based on those imagined barriers.

## H06 — exports can preserve context and create new confusion

**AI-generated finding:** Q13 answers describe conditional educational/report value, alongside risks of losing context. U08 would prefer a paper explanation and may struggle to find a download. U09 highlights the additional file copy. U03/U04 do not want an educational output confused with actual medical history. These answers are descriptions without an observed export task.

The existing frontend already exports a PDF. The research recommendation is to test interpretation of that current export with fabricated cases before proposing any changes. It is not evidence that more export formats, storage or history are required.

## Exploratory response groupings — AI-generated, not validated segmentation

| Generated response grouping | Corpus members | Interpretation and competing explanation |
|---|---|---|
| Conditional academic/data-analysis interest | U01, U02, U05, U06, U10 (5) | Names a teaching/review task; may still prefer existing tools. The profiles already specified these roles, so this grouping is partly imposed. |
| Occasional adult/early-adopter exploration | U03, U04, U07 (3) | Possible brief explanation or curiosity; monitoring relevance remains weak or conditional. No retention claim. |
| Paced/assisted exploration | U08 (1) | Wants ordinary wording and a trial with help, not an ongoing product. A single invented case establishes no older-adult segment. |
| Restricted-data inspection | U09 (1) | Interested in understanding a synthetic lifecycle with sensitive data withheld. This is no evidence of a viable privacy-first market. |

No simulated persona is classified as a confirmed champion or buyer. Exploring many roles differs from selecting a Disciplined Entrepreneurship beachhead. A real representative end user and primary research are still absent. [Framework context](https://mitsloan.mit.edu/ideas-made-to-matter/disciplined-entrepreneurship-6-questions-startup-success).

## Existing alternatives and adjacent products

**AI-generated alternatives in the dialogues:** notebooks/spreadsheets and supervisor discussion (U01/U02/U06/U10 Q02–Q05); actual reports/clinicians and paper diaries (U03/U04/U08); wearables and wellness dashboards (U07); local notes and direct data-flow inspection (U09). These solve different jobs; measured clinical information and professional care cannot be replaced by a fixed demo.

**External source context, separate from simulation:** AHA describes PREVENT as a cardiovascular-risk tool; ESC presents HeartScore as an adjacent risk resource; OMRON describes measurement aggregation and report downloads. They do not share an established identical output/task with MedPredict and do not supply its accuracy baseline. No relative superiority, local market share, prices or integration recommendation is inferred. [AHA](https://professional.heart.org/en/guidelines-and-statements/about-prevent-calculator), [ESC](https://www.heartscore.org/en_GB/), [OMRON vendor page](https://www.omron-healthcare.com/omronconnect). Their features were not hands-on tested; provenance is in [sources.md](sources.md).

## Willingness to pay — AI-generated corpus summary only

Nine Q17 answers offer zero for today’s prototype; U08’s qualitative refusal to pay is coded zero. U07 alone invents an offer of KZT 1,000 **once**, conditional on an honest learning experience. U10 explicitly lacks a confirmed institutional buyer/budget. No subscription commitment is generated. All figures are fictional statements, with no transactions, recruitment, price experiment or external demand evidence. Monthly health spending and possible future validated services are excluded.

The zero/nonzero distribution is not a conversion rate or price recommendation. Do not calculate MRR, market size or customer lifetime value from it. Even a numerical median of zero would describe generated utterances, not a market. The exception prevents flattening the corpus into “nobody would ever pay,” which would also be unsupported.

## Contradictions and next tests — AI-generated interpretations

- U07 wants personalization and pays for curiosity, but today’s fixed example cannot meet a recurring monitoring task. Ask a real early adopter to explain that trade-off without suggesting payment.
- U02/U06 request accuracy evidence while accepting only fabricated/authorized data in an unverified service. Resolve the apparent tension through a separate approved offline evaluation dataset, not by pressuring users to disclose sensitive records.
- U08 recognizes the explanation yet still finds “prediction” confusing. Test the existing interface’s wording through unprompted teach-back; do not equate repetition with understanding.
- U09 can inspect a browser request but cannot establish backend handling from it. Obtain actual backend policy/evidence separately; do not convert technical confidence into a security claim.
- U01/U05/U10 describe report value while preferring free access and existing tools. Ask whether there is a recent task and an observable advantage; do not equate interest with adoption or buying authority.

## Recommendations and limitations

**Recommendations only:** conduct the [real-human pilot](real_world_validation_plan.md), have the supervisor review the task and scope, and execute the [separate technical protocol](experimental_evaluation_plan.md) only when approved data and components exist. Sanat should observe current demo/form/PDF comprehension; Ali should document task/data/evaluation evidence; Oralkhan should document intended server handling and runtime choice. Any UX ideas remain unimplemented and require evidence and explicit permission before source changes.

The personas are ungrounded in real interviews; the script and assigned traits impose much of the result. All agents know the non-clinical boundary, which encourages socially cautious, articulate answers. Q10 describes an obvious privacy risk and does not estimate realistic trade-offs. Most simulated respondents give more coherent explanations than many spontaneous conversations would. Mixed-language generation and role-specific phrasing are uncontrolled. There is no empirical independence, representative sample, counterbalanced framing, live usability session or model-quality experiment. Apparent agreement is a reason to distrust strong conclusions, not to call assumptions validated. [Targeted source checks and inference limits](sources.md).
