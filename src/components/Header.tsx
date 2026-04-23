import { Moon, Sun, Workflow } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

export function Header() {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const onEditor = location.pathname === "/editor";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-elegant">
            <Workflow className="h-4 w-4" />
          </span>
          <span>PlantUML Chart Generator</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {!onEditor && (
            <Button asChild size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Link to="/editor">Open Editor</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
