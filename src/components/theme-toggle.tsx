"use client";

import { Moon, Sun } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
      onClick={() => setDark((current) => !current)}
      data-testid="button-theme"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
