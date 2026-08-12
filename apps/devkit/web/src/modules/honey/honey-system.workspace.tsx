import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpenCheckIcon,
  CableIcon,
  ExternalLinkIcon,
  KeyRoundIcon,
  PlusIcon,
  TestTube2Icon
} from "lucide-react";
import { Button } from "@cxshop/ui/components/button";
import { Input } from "@cxshop/ui/components/input";
import { apiGet, apiPost, apiPut } from "../../shared/api/devkit-api";
import { PikoAgentConnector } from "./piko-agent-connector";

type Connection = { configured: boolean; endpoint: string; model: string; provider: string };
type Skill = {
  description: string;
  files: string[];
  name: string;
  prompting: boolean;
  review: boolean;
  shopper: boolean;
};

export function HoneySystemWorkspace() {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState<"browser" | "token">("browser");
  const connection = useQuery({
    queryKey: ["honey", "system", "connector"],
    queryFn: () => apiGet<Connection>("/honey/system/connector")
  });
  const skills = useQuery({
    queryKey: ["honey", "system", "skills"],
    queryFn: () => apiGet<Skill[]>("/honey/system/skills")
  });
  const test = useMutation({
    mutationFn: () => apiPost<Connection & { ready: boolean }>("/honey/system/connector/test")
  });
  const usage = useMutation({
    mutationFn: ({ name, prompting, review, shopper }: Skill) =>
      apiPut<Skill>(`/honey/system/skills/${name}/usage`, { prompting, review, shopper }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["honey", "system", "skills"] })
  });

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await apiPost("/honey/system/skills", {
      description: String(data.get("description") ?? ""),
      name: String(data.get("name") ?? "")
    });
    setCreating(false);
    await queryClient.invalidateQueries({ queryKey: ["honey", "system", "skills"] });
  }

  async function addReference(skill: Skill, file: File) {
    if (!file.name.toLowerCase().endsWith(".md") || file.size > 1_000_000) return;
    await apiPost(`/honey/system/skills/${skill.name}/files`, {
      content: await file.text(),
      file: file.name
    });
    await queryClient.invalidateQueries({ queryKey: ["honey", "system", "skills"] });
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-5 lg:p-8">
      <header>
        <p className="text-sm font-semibold text-amber-700">Piko AI</p>
        <h1 className="pt-1 text-2xl font-semibold">Connection setup</h1>
        <p className="pt-2 text-sm text-muted-foreground">
          Connect Piko through your browser or a protected server token.
        </p>
      </header>
      <PikoAgentConnector />
      <nav
        aria-label="Piko connection methods"
        className="flex w-fit gap-1 rounded-lg border bg-muted/40 p-1"
      >
        {(["browser", "token"] as const).map((method) => (
          <button
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
              connectionMethod === method
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
            }`}
            key={method}
            onClick={() => setConnectionMethod(method)}
            type="button"
          >
            {method === "browser" ? "Connect with browser" : "Use server token"}
          </button>
        ))}
      </nav>
      <section className="rounded-lg border bg-card p-5">
        {connectionMethod === "browser" ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-slate-950 text-white">
                <ExternalLinkIcon className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold">Browser setup</h2>
                <p className="pt-1 text-sm text-muted-foreground">
                  Create an OpenAI API key in the official dashboard, then configure it on the API server.
                </p>
              </div>
            </div>
            <Button asChild variant="outline">
              <a href="https://platform.openai.com/api-keys" rel="noreferrer" target="_blank">
                Open OpenAI <ExternalLinkIcon className="size-4" />
              </a>
            </Button>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-slate-950 text-white">
              <KeyRoundIcon className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">Protected server token</h2>
              <p className="pt-1 text-sm text-muted-foreground">
                Set <code className="rounded bg-muted px-1.5 py-0.5">CXSHOP_AI_API_KEY</code> on the API server and restart it. Piko never stores the token in this browser.
              </p>
            </div>
          </div>
        )}
      </section>
      <section className="rounded-lg border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-slate-950 text-white">
              <CableIcon className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">Agent connector</h2>
              <p className="text-sm text-muted-foreground">
                {connection.data?.provider ?? "Not loaded"} · {connection.data?.model ?? "No model"}{" "}
                · {connection.data?.endpoint ?? "No endpoint"}
              </p>
            </div>
          </div>
          <Button disabled={test.isPending} onClick={() => test.mutate()} variant="outline">
            <TestTube2Icon className="size-4" />
            {test.isPending ? "Testing…" : "Test connection"}
          </Button>
        </div>
        <p
          className={`pt-4 text-sm ${connection.data?.configured ? "text-emerald-700" : "text-amber-700"}`}
        >
          {test.data?.ready
            ? "Connection ready."
            : connection.data?.configured
              ? "Credentials are configured in the server environment."
              : "Set CXSHOP_AI_* values in the server environment and restart the API."}
        </p>
      </section>
      <section className="rounded-lg border bg-card">
        <div className="flex items-center justify-between gap-3 border-b p-5">
          <div className="flex items-center gap-3">
            <BookOpenCheckIcon className="size-5" />
            <div>
              <h2 className="font-semibold">Business skills</h2>
              <p className="text-sm text-muted-foreground">
                Only enabled skills enter Piko prompts.
              </p>
            </div>
          </div>
          <Button onClick={() => setCreating((value) => !value)} size="sm">
            <PlusIcon className="size-4" />
            New skill
          </Button>
        </div>
        {creating ? (
          <form
            className="grid gap-3 border-b p-5 md:grid-cols-[15rem_1fr_auto]"
            onSubmit={(event) => void create(event)}
          >
            <Input
              name="name"
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              placeholder="product-copy"
              required
            />
            <Input
              minLength={10}
              name="description"
              placeholder="Write accurate product and campaign content."
              required
            />
            <Button type="submit">Create</Button>
          </form>
        ) : null}
        <div className="divide-y">
          {(skills.data ?? []).map((skill) => (
            <article
              className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center"
              key={skill.name}
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-medium">{skill.name}</h3>
                <p className="pt-1 text-sm text-muted-foreground">{skill.description}</p>
              </div>
              <label className="cursor-pointer rounded-md border px-3 py-2 text-sm hover:bg-muted">
                Add Markdown
                <input
                  accept=".md,text/markdown"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void addReference(skill, file);
                  }}
                  type="file"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  checked={skill.shopper}
                  onChange={(event) => usage.mutate({ ...skill, shopper: event.target.checked })}
                  type="checkbox"
                />
                Use for shoppers
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  checked={skill.prompting}
                  onChange={(event) => usage.mutate({ ...skill, prompting: event.target.checked })}
                  type="checkbox"
                />
                Use in chat
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  checked={skill.review}
                  onChange={(event) => usage.mutate({ ...skill, review: event.target.checked })}
                  type="checkbox"
                />
                Use in review
              </label>
            </article>
          ))}
          {!skills.data?.length ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No business skills configured.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
