import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("the document declares a viewport that does not allow scaling", async () => {
  const source = await read("src/app/layout.tsx");

  assert.match(source, /maximumScale:\s*1/);
  assert.match(source, /userScalable:\s*false/);
});

test("text controls keep at least 16px at every breakpoint", async () => {
  const field = await read("src/components/ui/Field.tsx");
  const sharedClasses = field.slice(
    field.indexOf("const sharedFieldClasses"),
    field.indexOf("type TextFieldProps"),
  );

  assert.match(sharedClasses, /\btext-base\b/);
  assert.doesNotMatch(sharedClasses, /\btext-(?:xs|sm)\b/);
  assert.doesNotMatch(sharedClasses, /sm:text-(?:xs|sm)\b/);

  const card = await read("src/components/repertoire/RepertoireItemCard.tsx");
  const editableClasses = [
    ...card.matchAll(
      /contentEditable\b[\s\S]{0,1500}?className=\{?[`'"]([^`'"]*)[`'"]/g,
    ),
  ].map((match) => match[1]);

  assert.ok(
    editableClasses.length >= 2,
    "the editable title and artist must still be found",
  );
  for (const className of editableClasses) {
    assert.doesNotMatch(
      className,
      /\btext-(?:xs|sm)\b/,
      "editable repertoire text may not drop below 16px",
    );
  }

  const chordChart = await read("src/components/repertoire/ChordChartEditor.tsx");
  const textArea = chordChart.slice(
    chordChart.indexOf("<TextArea"),
    chordChart.indexOf("/>", chordChart.indexOf("<TextArea")),
  );

  assert.doesNotMatch(textArea, /\btext-(?:xs|sm)\b/);
});

test("double tap and text scaling are disabled on the page", async () => {
  const css = await read("src/app/globals.css");

  assert.match(css, /touch-action:\s*manipulation/);
  assert.match(css, /-webkit-text-size-adjust:\s*100%/);
  assert.match(css, /text-size-adjust:\s*100%/);
});
