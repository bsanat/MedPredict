# Separate experimental evaluation plan — prospective, no results

Date: 16 October 2026 (Asia/Almaty). **AI-generated proposed protocol. No experiment in this document has been executed.** Synthetic persona interviews supply no evidence for prediction accuracy, API latency or Python–Java agreement. This plan supplements, and does not modify, the [existing evaluation plan](../../evaluation-plan.md).

MedPredict is an educational diploma project at Astana IT University by Sanat Bogenbayev, Ali Baymen and Oralkhan Seilkhan. The attachment names M. K. Turarova as advisor; confirmation remains outstanding in repository documentation. React/TypeScript/Vite frontend exists; Java/Spring Boot and ML development are ongoing. ONNX export/runtime is a possible route, not an implemented or agreed architecture established here. The prototype is not intended as a medical device or for diagnosis, treatment or clinical decisions; no clinical certification is established by this plan. Any synthetic statements elsewhere remain AI-generated simulation requiring real-user/expert validation.

## Objective T01 — prediction accuracy

**Question:** On independent held-out data for one agreed continuous target, how does the proposed neural network compare with simple baselines under the same feature availability and evaluation protocol? A neural network is a candidate, not a presumed winner. This objective tests prediction error; it does not test user demand, clinical benefit or frontend quality.

### Prerequisites and freeze record

Ali and the supervisor must agree the target, units, population, time of measurement, prediction horizon, observation unit and available-at-inference features. Distinguish estimating a current indicator from forecasting its future value. Current example fields and 134.2 mmHg are demonstration artifacts, not evidence that the final target or five-feature model is valid. Agree licensed/authorized data, inclusion/exclusion, missingness, subgroup definitions and privacy rules. Do not infer data access from mentioning NHANES, Diabetes or PhysioNet.

Before test evaluation, record dataset/version identifier, lawful access, split membership or protected reproducible split recipe, seed, feature schema/order/units, preprocessing, model/baseline definitions, tuning process and the primary comparison. Split by person to prevent repeated-person leakage, and by time when the task predicts a later outcome. Fit imputation/scaling/feature selection only on train or inside each training fold. Use validation for all selection and keep test inaccessible until the protocol is frozen. If data size or target definition makes independent evaluation infeasible, report the objective blocked; do not invent metrics from demo outputs.

### Models and metrics

- B0: training-set mean prediction, matching the baseline already proposed in the repository. For MAE, a separately declared training-median reference may be reported, but cannot replace B0 after inspecting test results.
- B1: linear regression with the same eligible inputs and preprocessing scope.
- N1: one neural-network candidate selected using training/validation data. Record its architecture and optimization only when chosen; this document does not configure or implement it.

For n held-out observations with observed value y_i and prediction p_i:

`MAE = (1/n) × sum(abs(y_i − p_i))`

`RMSE = sqrt((1/n) × sum((y_i − p_i)^2))`

Both retain the target’s units. Use the identical held-out records and declared missing-data handling for all models. Report n, missing/excluded counts, MAE, RMSE and paired differences N1−B0 and N1−B1; a negative difference indicates lower error. With repeated observations, estimate uncertainty by resampling people rather than rows. Ali should specify the interval method and, where feasible, 95% intervals before inspecting test results. Small subgroups require explicit uncertainty and may be unassessable. Record failure rates instead of silently omitting failed predictions.

Do not claim improvement because a point estimate is slightly lower: report uncertainty, compare against the predeclared research criterion and disclose mixed MAE/RMSE outcomes. A clinically meaningful tolerance is **not specified** and must not be invented from this study. An honest no-improvement result is valid. Freeze the selected model, perform the final held-out comparison once, and retain the results even if the neural network loses. Separate any later external-population validation from internal test performance.

### Planned results table — intentionally unfilled

| Model | Test n | MAE (target units) | RMSE (target units) | Paired differences / uncertainty | Status |
|---|---|---|---|---|---|
| B0 training mean | Not measured | Not measured | Not measured | Not measured | Awaiting approved data/protocol |
| B1 linear regression | Not measured | Not measured | Not measured | Not measured | Awaiting approved data/protocol |
| N1 neural network | Not measured | Not measured | Not measured | Not measured | Awaiting approved data/protocol |

## Objective T02 — system performance and cross-runtime consistency

**Questions:** How long does the actual configured prediction API take to answer, and do Python and Java produce equivalent predictions for the same frozen model and inputs? Runtime agreement and response time are separate measurements within this objective. Agreement does not show predictive accuracy: two runtimes can agree on a poor model.

### T02a — Python versus Java consistency

Ali and Oralkhan select and record the actual deployment route before testing. If ONNX is chosen, compare (1) original Python model, (2) Python execution of the exported artifact, and (3) Java execution of that same exported artifact; this helps distinguish export differences from runtime/wiring differences. If another route is approved, record its equivalent stages without changing the existing architecture or API in this task.

Pin model/export checksums, preprocessing parameters/version, runtime and library versions, input dtype/shape, feature order, units, missing/categorical handling, evaluation mode and output postprocessing. Python and Java must receive the same preprocessed inputs; also compare the raw-input preprocessing path separately so a shared downstream error is not hidden. Disable training-only stochastic behavior and document any remaining nondeterminism.

Use versioned fabricated normal/boundary input vectors and permitted de-identified held-out cases only in an approved environment. Boundaries come from the agreed model schema, not invented medical ranges. Include missing/categorical/invalid inputs to verify the already agreed acceptance/rejection behavior; invalid values have no numeric parity target. If authorized held-out cases are unavailable, synthetic vectors can test wiring but cannot support accuracy claims. Do not publish raw sensitive inputs or predicted health values in public logs.

Before seeing differences, the owners must justify and freeze absolute tolerance `atol` in target units and dimensionless relative tolerance `rtol` appropriate to dtype/export/runtime precision. No tolerances are invented here. For each valid scalar output, require:

`abs(java − python_reference) <= atol + rtol × abs(python_reference)`

Compare unrounded outputs, using Python as the recorded reference; display formatting must not conceal differences. Report number compared, max/median absolute error, relative error with a declared near-zero denominator convention, tolerance violations, missing/nonfinite outputs, unit/shape mismatches and repeated-run stability. Treat nonfinite outputs as failures, not equality. Preserve every mismatch for investigation. Shared bias or erroneous preprocessing can pass parity, so it remains independent of T01.

### T02b — API response time

Run only once the real Spring Boot endpoint and frozen model are available; mocked API responses, the frontend’s artificial demo delay, interview response text and human reading time are excluded. Use the existing agreed endpoint/payload format; this plan adds no API fields or contracts.

Proposed small reproducible protocol, to be confirmed before execution:

1. Record commit/model checksums, hardware/CPU/RAM, OS/JVM/runtime versions, network path, environment configuration and load. Keep request cohort fixed and use fabricated or approved de-identified payloads. Do not change production settings for this study.
2. Define client elapsed time from immediately before sending an HTTP request until its body is fully received, using a monotonic timer. This includes network and server time. Backend inference-only timing, if already supported and explicitly instrumented later, is a separate measurement; it is not derived by guesswork.
3. Record the first request after process start as a distinct cold observation. Proposed warm-up: 20 sequential requests excluded from warm summaries; proposed measured run: 200 sequential requests at concurrency 1. These are design choices, not sufficient evidence of capacity under load; owners may revise them before the run and must record the final counts. Keep errors/timeouts in the attempt denominator and avoid automatic retries.
4. For the warm run, record per-attempt elapsed time, response status, success/contract check and timeout/error category without sensitive payloads. Report successful-response p50/p95/min/max, attempted/success/error/timeout counts and error fraction. State the quantile estimator. Report failures separately so success-only latency cannot hide instability. A single cold observation is not a cold-latency distribution.
5. Confirm returned units, finite value, version where supplied, and agreement with direct Java inference for the same artifact. Repeat a fixed input to check determinism under declared tolerance; changing inputs must reach real inference rather than the fixed demo adapter. Error cases should be reported separately from normal-prediction latency.
6. If timing changes follow a later implementation fix, retain both runs with their versions. Throughput, sustained load/concurrency and production capacity are follow-on studies, not claims supported by this small sequential protocol.

The existing client timeout is an implementation setting, **not a latency target or pass criterion**. Oralkhan and the team must agree acceptable p95/error targets before running; none is established by interviews or this plan. If no threshold is agreed, report measurements descriptively without a performance-pass claim.

### Planned results table — intentionally unfilled

| Measurement | Evidence to attach later | Current result |
|---|---|---|
| Python/export/Java parity | Artifact IDs, vectors/split recipe, declared tolerances, comparison summary and mismatches | Not measured |
| Repeated-input consistency | Repeat count, versions, unrounded deviations and failures | Not measured |
| Cold API observation | Start state, one elapsed time, status and model | Not measured |
| Warm API latency | Attempt counts, environment, p50/p95 and error/timeout denominators | Not measured |
| API versus direct Java output | Matching inputs, model version and output comparison | Not measured |

## Ownership, decision and evidence record

Ali owns T01 and the Python/export reference; Oralkhan owns Java execution and API timing; both review parity. Sanat may verify presentation of an already agreed response later, but the completed frontend does not need redesign for these experiments. The supervisor/team approve the task and predeclared criteria; this document is not that approval.

Future run record: run ID/date/timezone; owners; repository/model/data identifiers; authorization/access scope; environment; frozen protocol; commands; counts; measured values and uncertainty; all failures; interpretation; limitations; reviewer decision. Store sensitive datasets and raw cases in approved locations, not this public research folder. Any later scripts, instrumentation, source/API changes or dependencies require a separate explicitly authorized implementation task. This study executes none, makes no commit/push, and leaves all existing application files intact.

Human interviews may explore how error information should be understood; they cannot establish actual MAE/RMSE, latency or runtime equality. Conversely, passing these experiments would not establish usability, demand, clinical safety or certification. Basis: [existing project evaluation protocol](../../evaluation-plan.md) and the user’s separately approved technical objectives; see [source boundaries](sources.md).
