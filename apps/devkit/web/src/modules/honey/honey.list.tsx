import type { HoneyConversationSummary } from "./honey.types";
import { ArchiveIcon } from "lucide-react";

export function HoneyConversationList({
  activeId,
  conversations,
  onArchive,
  onSelect
}: {
  activeId: string | null;
  conversations: HoneyConversationSummary[];
  onArchive: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  if (!conversations.length)
    return <p className="mt-5 px-3 text-xs text-muted-foreground">No conversations yet.</p>;
  return (
    <div className="mt-5 space-y-1">
      {conversations.map((item) => <div className={`group flex items-center rounded-md pr-1 transition hover:bg-muted focus-within:bg-muted ${activeId === item.id ? "bg-muted font-medium" : ""}`} key={item.id}><button className="min-w-0 flex-1 cursor-pointer truncate px-3 py-2 text-left text-sm" onClick={() => onSelect(item.id)} type="button">{item.title}</button><button aria-label={`Archive ${item.title}`} className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition hover:bg-background hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100" onClick={() => onArchive(item.id)} title="Archive conversation" type="button"><ArchiveIcon className="size-3.5" /></button></div>)}
    </div>
  );
}
