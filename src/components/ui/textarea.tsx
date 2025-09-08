// src/components/ui/textarea.tsx
import React from "react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * A small Textarea component compatible with shadcn/ui-style imports.
 * Exports a named `Textarea` (so `import { Textarea } from "@/components/ui/textarea"` works).
 */
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      {...props}
      className={cn(
        "min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-indigo-500 disabled:opacity-50",
        className ?? ""
      )}
    />
  );
});

Textarea.displayName = "Textarea";

export default Textarea;
