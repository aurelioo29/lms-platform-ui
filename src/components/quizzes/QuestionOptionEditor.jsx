"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function QuestionOptionEditor({ form }) {
  const questionType = form.watch("question_type");
  const options = form.watch("options") || [];

  const isSingle = questionType === "mcq_single";

  const setCorrectSingle = (idx) => {
    const next = options.map((o, i) => ({ ...o, is_correct: i === idx }));
    form.setValue("options", next, { shouldValidate: true });
  };

  const toggleCorrectMulti = (idx) => {
    const next = options.map((o, i) =>
      i === idx ? { ...o, is_correct: !o.is_correct } : o,
    );
    form.setValue("options", next, { shouldValidate: true });
  };

  const addOption = () => {
    form.setValue("options", [...options, { label: "", is_correct: false }], {
      shouldValidate: true,
    });
  };

  const removeOption = (idx) => {
    if (options.length <= 2) return;
    form.setValue(
      "options",
      options.filter((_, i) => i !== idx),
      { shouldValidate: true },
    );
  };

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <Label>Options</Label>
        <Button type="button" variant="outline" size="sm" onClick={addOption}>
          + Add option
        </Button>
      </div>

      <div className="space-y-2">
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Input
              placeholder={`Option ${idx + 1}`}
              {...form.register(`options.${idx}.label`)}
            />

            <Button
              type="button"
              variant={opt.is_correct ? "default" : "outline"}
              size="sm"
              onClick={() =>
                isSingle ? setCorrectSingle(idx) : toggleCorrectMulti(idx)
              }
              className="shrink-0"
            >
              {opt.is_correct ? "Correct" : "Mark"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeOption(idx)}
              disabled={options.length <= 2}
              className="shrink-0"
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      {form.formState.errors.options ? (
        <p className="text-xs text-red-600">
          {form.formState.errors.options.message}
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        {isSingle
          ? "MCQ Single: only one option can be correct."
          : "MCQ Multi: multiple correct options allowed."}
      </p>
    </div>
  );
}
