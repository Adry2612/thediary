import assert from "node:assert/strict";
import test from "node:test";
import {
  INITIAL_PRACTICE_FLOW,
  backToPracticeChoice,
  closePracticeBuilder,
  finishPractice,
  openPracticeBuilder,
  reviewPracticePlan,
  startPracticeNow,
  startReviewedPractice,
} from "../src/utils/practice-flow.ts";

const plan = {
  name: "Rutina de técnica",
  phases: [
    { id: "phase-1", name: "Alternate picking", durationMinutes: 10, skill: "technique" },
  ],
  guitarType: "electric",
};

test("starts on the choosing state without plan or builder", () => {
  assert.deepEqual(INITIAL_PRACTICE_FLOW, {
    step: "choose",
    plan: null,
    builder: null,
  });
});

test("choosing a saved routine moves to review with its plan", () => {
  const flow = reviewPracticePlan(INITIAL_PRACTICE_FLOW, plan);

  assert.equal(flow.step, "review");
  assert.deepEqual(flow.plan, plan);
  assert.equal(flow.builder, null);
});

test("going back from review returns to choose and drops the plan", () => {
  const flow = backToPracticeChoice(
    reviewPracticePlan(INITIAL_PRACTICE_FLOW, plan),
  );

  assert.deepEqual(flow, { step: "choose", plan: null, builder: null });
});

test("starting from review keeps exactly the reviewed plan", () => {
  const reviewed = reviewPracticePlan(INITIAL_PRACTICE_FLOW, plan);
  const flow = startReviewedPractice(reviewed);

  assert.equal(flow.step, "practise");
  assert.equal(flow.plan, plan);
  assert.equal(flow.builder, null);
});

test("starting without a reviewed plan does nothing", () => {
  assert.equal(
    startReviewedPractice(INITIAL_PRACTICE_FLOW),
    INITIAL_PRACTICE_FLOW,
  );
});

test("quick practice starts without passing through review", () => {
  const flow = startPracticeNow(INITIAL_PRACTICE_FLOW, plan);

  assert.equal(flow.step, "practise");
  assert.equal(flow.plan, plan);
});

test("the builder opens over choosing without changing the step", () => {
  const flow = openPracticeBuilder(INITIAL_PRACTICE_FLOW, "routine-1");

  assert.equal(flow.step, "choose");
  assert.deepEqual(flow.builder, { templateId: "routine-1" });
});

test("the builder opens over review keeping that plan", () => {
  const reviewed = reviewPracticePlan(INITIAL_PRACTICE_FLOW, plan);
  const flow = openPracticeBuilder(reviewed, "routine-1");

  assert.equal(flow.step, "review");
  assert.equal(flow.plan, plan);
  assert.deepEqual(flow.builder, { templateId: "routine-1" });
});

test("closing the builder returns to the step it was opened from", () => {
  const reviewed = reviewPracticePlan(INITIAL_PRACTICE_FLOW, plan);
  const flow = closePracticeBuilder(openPracticeBuilder(reviewed, "routine-1"));

  assert.deepEqual(flow, reviewed);
});

test("closing a builder that is not open is a no-op", () => {
  assert.equal(
    closePracticeBuilder(INITIAL_PRACTICE_FLOW),
    INITIAL_PRACTICE_FLOW,
  );
});

test("finishing a practice returns to choosing", () => {
  const practising = startReviewedPractice(
    reviewPracticePlan(INITIAL_PRACTICE_FLOW, plan),
  );

  assert.deepEqual(finishPractice(practising), {
    step: "choose",
    plan: null,
    builder: null,
  });
});

test("the builder cannot be opened during a practice", () => {
  const practising = startPracticeNow(INITIAL_PRACTICE_FLOW, plan);

  assert.equal(openPracticeBuilder(practising, "routine-1"), practising);
});

test("an active practice cannot be reset by the review transitions", () => {
  const practising = startPracticeNow(INITIAL_PRACTICE_FLOW, plan);

  assert.equal(backToPracticeChoice(practising), practising);
  assert.equal(reviewPracticePlan(practising, plan), practising);
});
