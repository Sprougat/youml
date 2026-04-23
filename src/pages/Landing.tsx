import { Link } from "react-router-dom";
import { ArrowRight, Boxes, Code2, Download, Sparkles, Zap, FileText } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { TEMPLATES } from "@/lib/templates";

const features = [
  { icon: Code2, title: "PlantUML Editor", desc: "Write diagram code with a fast, clean editor and instant preview." },
  { icon: Sparkles, title: "10+ Templates", desc: "Start from flowchart, sequence, class, ERD, mindmap, Gantt and more." },
  { icon: Zap, title: "Live Rendering", desc: "Render diagrams instantly with a single click, powered by PlantUML." },
  { icon: Download, title: "Export PNG / SVG", desc: "Download production-ready images or share the raw .puml source." },
  { icon: Boxes, title: "Quick Starters", desc: "Pick a diagram type and get a ready-to-edit starter template." },
  { icon: FileText, title: "Autosave Drafts", desc: "Your work is automatically saved to local storage as you type." },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container relative py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Visualize ideas with PlantUML, effortlessly
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Design diagrams at the{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">speed of thought</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              A modern editor for flowcharts, sequence diagrams, class diagrams, ERDs, mindmaps and more — write
              PlantUML, preview live, and export as PNG or SVG.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90">
                <Link to="/editor">
                  Start Creating <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#examples">See Examples</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Everything you need to diagram</h2>
          <p className="mt-3 text-muted-foreground">A focused toolkit, no sign-up, zero setup.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 text-lg font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Examples */}
      <section id="examples" className="border-t border-border bg-secondary/30 py-20">
        <div className="container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Ready-made examples</h2>
            <p className="mt-3 text-muted-foreground">
              Jump straight into a template and customize it to your needs.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((t) => (
              <Link
                key={t.id}
                to={`/editor?template=${t.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:border-primary/50 hover:shadow-elegant"
              >
                <div>
                  <h3 className="text-lg font-semibold">{t.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                </div>
                <div className="mt-6 flex items-center text-sm font-medium text-primary">
                  Open template
                  <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="rounded-3xl border border-border bg-gradient-hero p-10 text-center shadow-soft md:p-16">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Ready to draw your next diagram?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Open the editor, pick a template and export in seconds.
          </p>
          <Button asChild size="lg" className="mt-8 bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90">
            <Link to="/editor">
              Open Editor <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} PlantUML Chart Generator</p>
          <p>Rendering powered by the public PlantUML server.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
