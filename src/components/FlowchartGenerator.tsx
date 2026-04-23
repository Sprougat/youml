import { useState } from "react";
import {
  Plus,
  Trash2,
  GitBranch,
  Square,
  Circle,
  FileInput,
  Workflow,
  ArrowDown,
} from "lucide-react";
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

/**
 * Flowchart Generator — renders a proper flowchart with shape-correct nodes:
 *  - Start / End  → oval (ellipse)
 *  - Process      → rectangle
 *  - Decision     → diamond (with Yes/No branches)
 *  - Input/Output → parallelogram
 *  - Document     → folder/note shape
 *
 * Uses PlantUML's dot (Graphviz) support via @startdot/@enddot so the shapes
 * match traditional flowchart conventions.
 */

type NodeKind = "start" | "end" | "process" | "decision" | "io" | "document";

type FlowNode = {
  id: string;
  kind: NodeKind;
  text: string;
  yesLabel?: string;
  noLabel?: string;
};

const uid = () => "n" + Math.random().toString(36).slice(2, 8);

const DEFAULT_NODES: FlowNode[] = [
  { id: uid(), kind: "start", text: "Start" },
  { id: uid(), kind: "io", text: "Power On" },
  { id: uid(), kind: "process", text: "Scan Environment" },
  { id: uid(), kind: "decision", text: "Battery Low?", yesLabel: "Return to dock", noLabel: "Continue" },
  { id: uid(), kind: "end", text: "End" },
];

const KIND_META: Record<
  NodeKind,
  { label: string; icon: React.ComponentType<{ className?: string }>; desc: string }
> = {
  start: { label: "Start", icon: Circle, desc: "Oval — entry point" },
  end: { label: "End", icon: Circle, desc: "Oval — exit point" },
  process: { label: "Process", icon: Square, desc: "Rectangle — action/step" },
  decision: { label: "Decision", icon: GitBranch, desc: "Diamond — yes/no branch" },
  io: { label: "Input / Output", icon: FileInput, desc: "Parallelogram — I/O" },
  document: { label: "Document", icon: Workflow, desc: "Document/data node" },
};

function escape(s: string) {
  return (s || "").replace(/"/g, '\\"');
}

/**
 * Build a PlantUML dot (Graphviz) flowchart so shapes are truly differentiated.
 * Colors follow conventional flowchart coloring (soft yellow for process,
 * soft blue for I/O, pink for start/end, etc.).
 */
function buildFlowchart(title: string, nodes: FlowNode[]): string {
  if (nodes.length === 0) return "@startuml\n@enduml";

  const lines: string[] = [];
  lines.push("@startuml");
  lines.push("digraph G {");
  if (title.trim()) lines.push(`  labelloc="t"; label="${escape(title.trim())}"; fontname="Helvetica"; fontsize=16;`);
  lines.push(`  graph [rankdir=TB, bgcolor="transparent", splines=ortho, nodesep=0.5, ranksep=0.55];`);
  lines.push(`  node  [fontname="Helvetica", fontsize=12, style="filled", penwidth=1.2];`);
  lines.push(`  edge  [fontname="Helvetica", fontsize=10, color="#64748b", arrowsize=0.8];`);
  lines.push("");

  // Node declarations with shape + fill per kind
  for (const n of nodes) {
    const text = escape(n.text || KIND_META[n.kind].label);
    switch (n.kind) {
      case "start":
      case "end":
        lines.push(
          `  ${n.id} [label="${text}", shape=ellipse, fillcolor="#f8bcd0", color="#c2185b"];`,
        );
        break;
      case "process":
        lines.push(
          `  ${n.id} [label="${text}", shape=box, style="filled,rounded", fillcolor="#fde68a", color="#b45309"];`,
        );
        break;
      case "decision":
        lines.push(
          `  ${n.id} [label="${text}", shape=diamond, fillcolor="#fde68a", color="#b45309"];`,
        );
        break;
      case "io":
        lines.push(
          `  ${n.id} [label="${text}", shape=parallelogram, fillcolor="#cfe2ff", color="#1d4ed8"];`,
        );
        break;
      case "document":
        lines.push(
          `  ${n.id} [label="${text}", shape=note, fillcolor="#e0e7ff", color="#4338ca"];`,
        );
        break;
    }
  }

  lines.push("");

  // Build edges. For decisions, we insert Yes/No helper nodes so the flow
  // continues to the next node after the Yes branch.
  for (let i = 0; i < nodes.length; i++) {
    const cur = nodes[i];
    const next = nodes[i + 1];
    if (!next) continue;

    if (cur.kind === "decision") {
      // Yes branch: small process node labeled with yesLabel → next
      const yesId = `${cur.id}_yes`;
      const noId = `${cur.id}_no`;
      const yesText = escape(cur.yesLabel || "Yes action");
      const noText = escape(cur.noLabel || "No action");
      lines.push(
        `  ${yesId} [label="${yesText}", shape=box, style="filled,rounded", fillcolor="#fde68a", color="#b45309"];`,
      );
      lines.push(
        `  ${noId} [label="${noText}", shape=box, style="filled,rounded", fillcolor="#fde68a", color="#b45309"];`,
      );
      lines.push(`  ${cur.id} -> ${yesId} [label="Yes"];`);
      lines.push(`  ${cur.id} -> ${noId} [label="No"];`);
      lines.push(`  ${yesId} -> ${next.id};`);
      lines.push(`  ${noId} -> ${next.id};`);
    } else {
      lines.push(`  ${cur.id} -> ${next.id};`);
    }
  }

  lines.push("}");
  lines.push("@enduml");
  return lines.join("\n");
}

export function FlowchartGenerator({ onGenerate }: { onGenerate: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("Process Flowchart");
  const [nodes, setNodes] = useState<FlowNode[]>(DEFAULT_NODES);

  function addNode(kind: NodeKind) {
    setNodes((prev) => [
      ...prev,
      kind === "decision"
        ? { id: uid(), kind, text: "", yesLabel: "", noLabel: "" }
        : { id: uid(), kind, text: "" },
    ]);
  }

  function updateNode(id: string, patch: Partial<FlowNode>) {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }

  function removeNode(id: string) {
    setNodes((prev) => prev.filter((n) => n.id !== id));
  }

  function moveNode(id: string, dir: -1 | 1) {
    setNodes((prev) => {
      const idx = prev.findIndex((n) => n.id === id);
      if (idx < 0) return prev;
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[j]] = [copy[j], copy[idx]];
      return copy;
    });
  }

  function handleGenerate() {
    onGenerate(buildFlowchart(title, nodes));
    setOpen(false);
  }

  function reset() {
    setTitle("Process Flowchart");
    setNodes(DEFAULT_NODES);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <GitBranch className="mr-1.5 h-4 w-4" /> Flowchart Generator
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden p-0">
        <div className="flex max-h-[85vh] flex-col">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              Flowchart Generator
            </DialogTitle>
            <DialogDescription>
              Build a true flowchart with proper shapes — ovals for Start/End, rectangles for
              processes, diamonds for decisions, and parallelograms for I/O.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="flow-title">Flowchart Title</Label>
              <Input
                id="flow-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Robot Vacuum Routine"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Nodes</Label>
                <span className="text-xs text-muted-foreground">{nodes.length} node(s)</span>
              </div>

              {nodes.map((node, idx) => {
                const Icon = KIND_META[node.kind].icon;
                return (
                  <div
                    key={node.id}
                    className={cn(
                      "rounded-lg border border-border bg-card p-3 shadow-soft",
                      node.kind === "decision" && "border-primary/30",
                      (node.kind === "start" || node.kind === "end") && "border-primary/40",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-semibold text-accent-foreground">
                        {idx + 1}
                      </div>
                      <Select
                        value={node.kind}
                        onValueChange={(v: NodeKind) =>
                          updateNode(node.id, {
                            kind: v,
                            yesLabel: v === "decision" ? node.yesLabel ?? "" : undefined,
                            noLabel: v === "decision" ? node.noLabel ?? "" : undefined,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(KIND_META) as NodeKind[]).map((k) => {
                            const KIcon = KIND_META[k].icon;
                            return (
                              <SelectItem key={k} value={k}>
                                <span className="flex items-center gap-2">
                                  <KIcon className="h-3.5 w-3.5" /> {KIND_META[k].label}
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <Input
                        value={node.text}
                        onChange={(e) => updateNode(node.id, { text: e.target.value })}
                        placeholder={
                          node.kind === "decision"
                            ? "Condition? (e.g. Battery Low?)"
                            : `Describe ${KIND_META[node.kind].label.toLowerCase()}…`
                        }
                        className="h-8 flex-1"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0"
                        onClick={() => moveNode(node.id, -1)}
                        disabled={idx === 0}
                        aria-label="Move up"
                      >
                        <ArrowDown className="h-4 w-4 rotate-180" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0"
                        onClick={() => moveNode(node.id, 1)}
                        disabled={idx === nodes.length - 1}
                        aria-label="Move down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeNode(node.id)}
                        aria-label="Remove node"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-1.5 flex items-center gap-1.5 pl-9 text-[11px] text-muted-foreground">
                      <Icon className="h-3 w-3" />
                      <span>{KIND_META[node.kind].desc}</span>
                    </div>

                    {node.kind === "decision" && (
                      <div className="mt-2 grid grid-cols-2 gap-2 pl-9">
                        <Input
                          value={node.yesLabel ?? ""}
                          onChange={(e) => updateNode(node.id, { yesLabel: e.target.value })}
                          placeholder="Yes → action"
                          className="h-8"
                        />
                        <Input
                          value={node.noLabel ?? ""}
                          onChange={(e) => updateNode(node.id, { noLabel: e.target.value })}
                          placeholder="No → action"
                          className="h-8"
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => addNode("process")}>
                  <Plus className="mr-1 h-4 w-4" /> Process
                </Button>
                <Button size="sm" variant="outline" onClick={() => addNode("decision")}>
                  <Plus className="mr-1 h-4 w-4" /> Decision
                </Button>
                <Button size="sm" variant="outline" onClick={() => addNode("io")}>
                  <Plus className="mr-1 h-4 w-4" /> I/O
                </Button>
                <Button size="sm" variant="outline" onClick={() => addNode("document")}>
                  <Plus className="mr-1 h-4 w-4" /> Document
                </Button>
                <Button size="sm" variant="outline" onClick={() => addNode("start")}>
                  <Plus className="mr-1 h-4 w-4" /> Start
                </Button>
                <Button size="sm" variant="outline" onClick={() => addNode("end")}>
                  <Plus className="mr-1 h-4 w-4" /> End
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
              disabled={nodes.length === 0}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              <GitBranch className="mr-1.5 h-4 w-4" /> Generate Flowchart
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
