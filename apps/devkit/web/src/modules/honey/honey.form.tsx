import { SendIcon } from "lucide-react";
import { Button } from "@cxshop/ui/components/button";
import { Textarea } from "@cxshop/ui/components/textarea";
import type { HoneyMode } from "./honey.types";

export function HoneyPromptForm({
  busy,
  message,
  mode,
  onChange,
  onSubmit
}: {
  busy: boolean;
  message: string;
  mode: HoneyMode;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="border-t p-4 lg:p-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="mx-auto flex max-w-4xl items-end gap-3">
        <Textarea
          className="min-h-24 resize-none"
          onChange={(event) => onChange(event.target.value)}
          placeholder={
            mode === "content-writer"
              ? "Describe the audience, purpose, format, tone, and facts to include…"
              : "Ask Piko about your work…"
          }
          value={message}
        />
        <Button
          aria-label="Send to Piko"
          disabled={!message.trim() || busy}
          size="icon"
          type="submit"
        >
          <SendIcon className="size-4" />
        </Button>
      </div>
    </form>
  );
}
