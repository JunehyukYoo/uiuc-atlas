import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function SidebarDrawer({ title, defaultOpen = true, children }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "flex flex-col min-h-0 rounded-xl border bg-card text-card-foreground shadow-sm",
        isOpen ? "flex-1" : "shrink-0",
      )}
    >
      <button
        className="flex w-full items-center justify-between px-6 py-4 text-sm font-semibold"
        onClick={() => setIsOpen((o) => !o)}
      >
        {title}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="flex-1 min-h-0 flex flex-col">{children}</div>
      )}
    </div>
  );
}
