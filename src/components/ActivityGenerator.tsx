import { useState } from "react";
import { Plus, Trash2, Workflow, GitBranch, Square } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type StepKind = "action" | "decision";
type Step = {
  id: string;
  kind: StepKind;
  text: string;
  yesLabel?: string;
  noLabel?: string;
};

const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_STEPS: Step[] = [
  { id: uid(), kind: "action", text: "User opens app" },
  { id: uid(), kind: "decision", text: "Logged in?", yesLabel: "Show dashboard", noLabel: "Show login screen" },
  { id: uid(), kind: "action", text: "Load data" },
];

function buildPlantUML(title: string, steps: Step[]): string {
  const lines: string[] = ["@startuml"];
  if (title.trim()) lines.push(`title ${title.trim()}`);
  lines.push("start");
  for (const s of steps) {
    if (s.kind === "action") {
      lines.push(`:${s.text || "Step"};`);
    } else {
      lines.push(`if (${s.text || "Condition?"}) then (yes)`);
      lines.push(`  :${s.yesLabel || "Yes branch"};`);
      lines.push(`else (no)`);
      lines.push(`  :${s.noLabel || "No branch"};`);
      lines.push(`endif`);
    }
  }
  lines.push("stop");
  lines.push("@enduml");
  return lines.join("\n");
}

export function ActivityGenerator({ onGenerate }: { onGenerate: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("User Flow");
  const [steps, setSteps] = useState<Step[]>(DEFAULT_STEPS);

  function addStep(kind: StepKind) {
    setSteps((prev) => [
      ...prev,
      kind === "action"
        ? { id: uid(), kind, text: "" }
        : { id: uid(), kind, text: "", yesLabel: "", noLabel: "" },
    ]);
  }

  function updateStep(id: string, patch: Partial<Step>) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function removeStep(id: string) {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }

  function handleGenerate() {
    const code = buildPlantUML(title, steps);
    onGenerate(code);
    setOpen(false);
  }

  function reset() {
    setTitle("User Flow");
    setSteps(DEFAULT_STEPS);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Workflow className="mr-1.5 h-4 w-4" /> Activity Builder
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden p-0">
        <div className="flex max-h-[85vh] flex-col">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-primary" />
              Activity Diagram Builder
            </DialogTitle>
            <DialogDescription>
              Describe your process step-by-step. Generates a clean PlantUML activity diagram.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="flow-title">Diagram Title</Label>
              <Input
                id="flow-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Checkout Flow"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Steps</Label>
                <span className="text-xs text-muted-foreground">{steps.length} step(s)</span>
              </div>

              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={cn(
                    "rounded-lg border border-border bg-card p-3 shadow-soft",
                    step.kind === "decision" && "border-primary/30",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-semibold text-accent-foreground">
                      {idx + 1}
                    </div>
                    <Select
                      value={step.kind}
                      onValueChange={(v: StepKind) =>
                        updateStep(step.id, {
                          kind: v,
                          yesLabel: v === "decision" ? step.yesLabel ?? "" : undefined,
                          noLabel: v === "decision" ? step.noLabel ?? "" : undefined,
                        })
                      }
                    >
                      <SelectTrigger className="h-8 w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="action">
                          <span className="flex items-center gap-2">
                            <Square className="h-3.5 w-3.5" /> Action
                          </span>
                        </SelectItem>
                        <SelectItem value="decision">
                          <span className="flex items-center gap-2">
                            <GitBranch className="h-3.5 w-3.5" /> Decision
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={step.text}
                      onChange={(e) => updateStep(step.id, { text: e.target.value })}
                      placeholder={step.kind === "action" ? "Describe action…" : "Condition? (e.g. Logged in?)"}
                      className="h-8 flex-1"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeStep(step.id)}
                      aria-label="Remove step"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {step.kind === "decision" && (
                    <div className="mt-2 grid grid-cols-2 gap-2 pl-9">
                      <Input
                        value={step.yesLabel ?? ""}
                        onChange={(e) => updateStep(step.id, { yesLabel: e.target.value })}
                        placeholder="Yes → action"
                        className="h-8"
                      />
                      <Input
                        value={step.noLabel ?? ""}
                        onChange={(e) => updateStep(step.id, { noLabel: e.target.value })}
                        placeholder="No → action"
                        className="h-8"
                      />
                    </div>
                  )}
                </div>
              ))}

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => addStep("action")}>
                  <Plus className="mr-1 h-4 w-4" /> Add Action
                </Button>
                <Button size="sm" variant="outline" onClick={() => addStep("decision")}>
                  <Plus className="mr-1 h-4 w-4" /> Add Decision
                </Button>
                <Button size="sm" variant="ghost" onClick={reset}>
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border px-6 py-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={steps.length === 0}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              <Workflow className="mr-1.5 h-4 w-4" /> Generate Diagram
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
