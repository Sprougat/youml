import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Copy,
  Download,
  FileCode2,
  Play,
  RotateCcw,
  AlertCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/Header";
import { FlowchartGenerator } from "@/components/FlowchartGenerator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TEMPLATES, DEFAULT_CODE } from "@/lib/templates";
import { plantumlUrl } from "@/lib/plantuml";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "puml-draft";

const Editor = () => {
  const [params, setParams] = useSearchParams();
  const initial = useMemo(() => {
    const tplId = params.get("template");
    if (tplId) {
      const tpl = TEMPLATES.find((t) => t.id === tplId);
      if (tpl) return tpl.code;
    }
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return saved || DEFAULT_CODE;
  }, [params]);

  const [code, setCode] = useState(initial);
  const [renderedCode, setRenderedCode] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    params.get("template") || "",
  );
  const isFirst = useRef(true);

  // Autosave
  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(STORAGE_KEY, code), 400);
    return () => clearTimeout(t);
  }, [code]);

  // Render effect (debounced)
  useEffect(() => {
    const handle = setTimeout(() => void render(renderedCode), isFirst.current ? 0 : 200);
    isFirst.current = false;
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderedCode]);

  async function render(source: string) {
    setLoading(true);
    setError(null);
    try {
      const url = plantumlUrl(source, "svg");
      const res = await fetch(url);
      const text = await res.text();
      if (!res.ok || text.includes("<text>Syntax Error") || text.includes("ERROR")) {
        // PlantUML returns 200 with an error SVG; detect common error markers
        if (/Syntax Error|ERROR|HTTP/i.test(text) && !text.includes("<svg")) {
          throw new Error("PlantUML syntax error. Please check your code.");
        }
      }
      if (!text.includes("<svg")) {
        throw new Error("Failed to render diagram. Please verify the syntax.");
      }
      // Heuristic: if the SVG explicitly says Syntax Error, surface it
      const syntaxMatch = text.match(/<text[^>]*>([^<]*Syntax Error[^<]*)<\/text>/i);
      if (syntaxMatch) {
        setError(syntaxMatch[1].trim());
      }
      setSvgContent(text);
    } catch (e: unknown) {
      setSvgContent(null);
      setError(e instanceof Error ? e.message : "Failed to render diagram.");
    } finally {
      setLoading(false);
    }
  }

  function handleGenerate() {
    setRenderedCode(code);
    toast.success("Rendering diagram…");
  }

  function handleTemplate(id: string) {
    const tpl = TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    setSelectedTemplate(id);
    setCode(tpl.code);
    setRenderedCode(tpl.code);
    const next = new URLSearchParams(params);
    next.set("template", id);
    setParams(next, { replace: true });
    toast.success(`Loaded template: ${tpl.name}`);
  }

  function handleCopy() {
    navigator.clipboard.writeText(code).then(
      () => toast.success("PlantUML code copied to clipboard"),
      () => toast.error("Failed to copy code"),
    );
  }

  function handleReset() {
    setCode(DEFAULT_CODE);
    setRenderedCode(DEFAULT_CODE);
    setSelectedTemplate("");
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Editor reset");
  }

  async function downloadFile(format: "png" | "svg") {
    try {
      const url = plantumlUrl(renderedCode, format);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `diagram.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
      toast.success(`Downloaded diagram.${format}`);
    } catch {
      toast.error(`Could not download ${format.toUpperCase()}`);
    }
  }

  function downloadPuml() {
    const blob = new Blob([code], { type: "text/plain" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = "diagram.puml";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
    toast.success("Source .puml downloaded");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      {/* Toolbar */}
      <div className="border-b border-border bg-card/60 backdrop-blur">
        <div className="container flex flex-wrap items-center gap-2 py-3">
          <div className="flex min-w-[220px] flex-1 items-center gap-2">
            <Select value={selectedTemplate} onValueChange={handleTemplate}>
              <SelectTrigger className="h-9 w-full md:w-[260px]">
                <SelectValue placeholder="Choose a template…" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={handleGenerate} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Play className="mr-1.5 h-4 w-4" /> Generate
            </Button>
            <Button size="sm" variant="outline" onClick={handleCopy}>
              <Copy className="mr-1.5 h-4 w-4" /> Copy
            </Button>
            <Button size="sm" variant="outline" onClick={() => downloadFile("png")}>
              <Download className="mr-1.5 h-4 w-4" /> PNG
            </Button>
            <Button size="sm" variant="outline" onClick={() => downloadFile("svg")}>
              <Download className="mr-1.5 h-4 w-4" /> SVG
            </Button>
            <Button size="sm" variant="outline" onClick={downloadPuml}>
              <FileCode2 className="mr-1.5 h-4 w-4" /> .puml
            </Button>
            <Button size="sm" variant="ghost" onClick={handleReset}>
              <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <main className="flex flex-1">
        {/* Sidebar - desktop */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card/40 lg:block">
          <div className="sticky top-[64px] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Templates
            </h3>
            <ul className="space-y-1">
              {TEMPLATES.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => handleTemplate(t.id)}
                    className={cn(
                      "group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition",
                      selectedTemplate === t.id
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-secondary",
                    )}
                  >
                    <span className="truncate">{t.name}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Desktop split view */}
        <div className="hidden flex-1 lg:grid lg:grid-cols-2">
          <EditorPanel code={code} onChange={setCode} />
          <PreviewPanel loading={loading} error={error} svg={svgContent} />
        </div>

        {/* Mobile tabs */}
        <div className="flex-1 lg:hidden">
          <Tabs defaultValue="code" className="flex h-full flex-col">
            <TabsList className="m-3 grid grid-cols-3">
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>
            <TabsContent value="code" className="flex-1">
              <EditorPanel code={code} onChange={setCode} />
            </TabsContent>
            <TabsContent value="preview" className="flex-1">
              <PreviewPanel loading={loading} error={error} svg={svgContent} />
            </TabsContent>
            <TabsContent value="examples" className="flex-1 p-4">
              <ul className="space-y-2">
                {TEMPLATES.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => handleTemplate(t.id)}
                      className="w-full rounded-lg border border-border bg-card p-3 text-left shadow-soft transition hover:border-primary/50"
                    >
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.description}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

function EditorPanel({ code, onChange }: { code: string; onChange: (v: string) => void }) {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col border-r border-border">
      <div className="flex items-center justify-between border-b border-border bg-card/40 px-4 py-2 text-xs font-medium text-muted-foreground">
        <span>PlantUML Source</span>
        <span>{code.length} chars</span>
      </div>
      <Textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="font-mono-code flex-1 resize-none rounded-none border-0 bg-background p-4 text-sm leading-6 focus-visible:ring-0"
        placeholder="@startuml&#10;...&#10;@enduml"
      />
    </div>
  );
}

function PreviewPanel({
  loading,
  error,
  svg,
}: {
  loading: boolean;
  error: string | null;
  svg: string | null;
}) {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex items-center justify-between border-b border-border bg-card/40 px-4 py-2 text-xs font-medium text-muted-foreground">
        <span>Preview</span>
        {loading && (
          <span className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" /> Rendering…
          </span>
        )}
      </div>
      <div className="relative flex-1 overflow-auto bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:16px_16px]">
        {error && (
          <div className="absolute left-1/2 top-6 -translate-x-1/2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive shadow-soft">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        )}
        <div className="flex min-h-full items-center justify-center p-6">
          {svg ? (
            <div
              className="max-w-full [&_svg]:h-auto [&_svg]:max-w-full"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : !loading && !error ? (
            <p className="text-sm text-muted-foreground">Your diagram will appear here.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Editor;
