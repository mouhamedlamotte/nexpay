import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import { ProjectSwitcher } from "./organization-switcher";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between h-14 px-6 bg-card border-b border-border z-40">
      <ProjectSwitcher />

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <User className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
}
