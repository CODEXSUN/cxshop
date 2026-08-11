import { FileText, Globe2, Pencil } from "lucide-react";
import { Button } from "@cxshop/ui/components/button";
import type { Article } from "./editor.types";
export function EditorList({
  records,
  onEdit
}: {
  records: Article[];
  onEdit: (v: Article) => void;
}) {
  if (!records.length)
    return (
      <div className="blogs-empty">
        <FileText />
        <h2>No stories yet</h2>
        <p>Create the first MDX post or evergreen page.</p>
      </div>
    );
  return (
    <div className="blogs-list">
      {records.map((item) => (
        <article key={item.id}>
          <div className="blogs-file-icon">{item.kind === "page" ? <Globe2 /> : <FileText />}</div>
          <div>
            <strong>{item.title}</strong>
            <span>
              /{item.slug} · {item.kind}
            </span>
          </div>
          <span className={`blogs-status blogs-status-${item.status}`}>{item.status}</span>
          <Button variant="ghost" onClick={() => onEdit(item)}>
            <Pencil />
            Edit
          </Button>
        </article>
      ))}
    </div>
  );
}
