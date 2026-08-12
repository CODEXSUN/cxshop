import { useEffect, useRef, useState, type RefObject } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BotIcon, FilePenLineIcon, MenuIcon, MicIcon, PanelLeftCloseIcon, PlusIcon, SendIcon, SparklesIcon } from "lucide-react";
import { Button } from "@cxshop/ui/components/button";
import { Textarea } from "@cxshop/ui/components/textarea";
import { HoneyFace } from "./honey-face";
import { honeyKeys, useHoneyConnection, useHoneyConversation, useHoneyConversations } from "./honey.hooks";
import { HoneyConversationList } from "./honey.list";
import { archiveHoneyConversation, sendHoneyMessage } from "./honey.services";
import type { HoneyConversationSummary, HoneyMessage, HoneyMode } from "./honey.types";
import { usePikoVoice } from "./piko.voice";

export function HoneyWorkspace({ initialPrompt = "" }: { initialPrompt?: string }) {
  const queryClient = useQueryClient();
  const end = useRef<HTMLDivElement>(null);
  const messageCanvas = useRef<HTMLDivElement>(null);
  const prompt = useRef<HTMLTextAreaElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [message, setMessage] = useState(initialPrompt);
  const [mode, setMode] = useState<HoneyMode>("chat");
  const [newConversation, setNewConversation] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const connection = useHoneyConnection();
  const conversations = useHoneyConversations();
  const activeId = newConversation ? null : threadId ?? conversations.data?.[0]?.id ?? null;
  const conversation = useHoneyConversation(activeId);
  const voice = usePikoVoice((transcript) =>
    setMessage((current) => [current.trim(), transcript].filter(Boolean).join(" "))
  );
  const send = useMutation({
    mutationFn: () => sendHoneyMessage(message.trim(), mode, activeId),
    onSuccess: (data) => {
      setMessage("");
      setThreadId(data.id);
      setNewConversation(false);
      queryClient.setQueryData(honeyKeys.conversation(data.id), data);
      void queryClient.invalidateQueries({ queryKey: honeyKeys.conversations });
    }
  });
  const archive = useMutation({
    mutationFn: archiveHoneyConversation,
    onSuccess: async (_, archivedId) => {
      queryClient.removeQueries({ queryKey: honeyKeys.conversation(archivedId) });
      if (activeId === archivedId) {
        setThreadId(null);
        setNewConversation(false);
      }
      await queryClient.invalidateQueries({ queryKey: honeyKeys.conversations });
    }
  });

  useEffect(() => {
    if (!conversation.data?.messages.length && !send.isPending) {
      messageCanvas.current?.scrollTo({ top: 0 });
      return;
    }
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversation.data?.messages.length, send.isPending]);

  useEffect(() => {
    if (!initialPrompt) return;
    setThreadId(null);
    setNewConversation(true);
    setMode("chat");
    setMessage(initialPrompt);
    prompt.current?.focus();
  }, [initialPrompt]);

  function startConversation() {
    setNewConversation(true);
    setThreadId(null);
    setMessage("");
  }

  return <main className="flex min-h-[38rem] overflow-hidden bg-background" style={{ height: "calc(100svh - 8rem)" }}>
    {drawerOpen ? <ConversationRail activeId={activeId} conversations={conversations.data ?? []} onArchive={(id) => archive.mutate(id)} onClose={() => setDrawerOpen(false)} onNew={startConversation} onSelect={(id) => { setNewConversation(false); setThreadId(id); }} /> : null}
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex min-h-16 items-center gap-3 border-b px-4 sm:px-5">
        {!drawerOpen ? <Button aria-label="Show conversations" onClick={() => setDrawerOpen(true)} size="icon" variant="ghost"><MenuIcon className="size-4" /></Button> : null}
        <HoneyFace className="size-11" /><div className="min-w-0"><h1 className="font-semibold">Piko</h1><p className="truncate text-xs text-muted-foreground">CXShop assistant and content team</p></div>
        <ChatCounters conversations={conversations.data?.length ?? 0} messages={conversation.data?.messages ?? []} />
        <ModeSwitch mode={mode} onChange={setMode} />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6" ref={messageCanvas}><div className="flex min-h-full w-full flex-col gap-4">
        {!conversation.data?.messages.length && !send.isPending ? <div className="flex min-h-full flex-1 justify-center"><Welcome configured={connection.data?.configured ?? false} mode={mode} /></div> : null}
        {conversation.data?.messages.map((item) => <article className={`flex gap-3 ${item.role === "user" ? "justify-end" : "justify-start"}`} key={item.id}>{item.role === "assistant" ? <HoneyFace className="size-8" /> : null}<div className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${item.role === "user" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted/35 text-card-foreground"}`}>{item.body}</div></article>)}
        {send.isPending ? <Thinking /> : null}{send.error ? <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{send.error.message}</p> : null}<div ref={end} />
      </div></div>
      <Composer error={voice.error} listening={voice.listening} message={message} mode={mode} onChange={setMessage} onClear={() => setMessage("")} onSubmit={() => { if (message.trim() && !send.isPending) send.mutate(); }} onVoice={voice.toggle} pending={send.isPending} promptRef={prompt} voiceSupported={voice.supported} />
    </section>
  </main>;
}

function ConversationRail({ activeId, conversations, onArchive, onClose, onNew, onSelect }: { activeId: string | null; conversations: HoneyConversationSummary[]; onArchive: (id: string) => void; onClose: () => void; onNew: () => void; onSelect: (id: string) => void }) {
  return <aside className="hidden w-72 shrink-0 flex-col border-r bg-background p-3 md:flex"><div className="flex gap-2"><Button className="flex-1 justify-start" onClick={onNew} variant="outline"><PlusIcon className="size-4" />New conversation</Button><Button aria-label="Hide conversations" onClick={onClose} size="icon" variant="ghost"><PanelLeftCloseIcon className="size-4" /></Button></div><HoneyConversationList activeId={activeId} conversations={conversations} onArchive={onArchive} onSelect={onSelect} /></aside>;
}

function ChatCounters({ conversations, messages }: { conversations: number; messages: HoneyMessage[] }) {
  const prompts = messages.filter((message) => message.role === "user").length;
  const replies = messages.filter((message) => message.role === "assistant").length;
  return <div className="hidden items-center gap-4 text-xs text-muted-foreground lg:flex"><span><strong className="text-foreground">{conversations}</strong> chats</span><span><strong className="text-foreground">{prompts}</strong> prompts</span><span><strong className="text-foreground">{replies}</strong> AI replies</span></div>;
}

function ModeSwitch({ mode, onChange }: { mode: HoneyMode; onChange: (mode: HoneyMode) => void }) {
  return <div className="ml-auto flex rounded-lg border p-1"><Button className="hidden sm:inline-flex" onClick={() => onChange("chat")} size="sm" variant={mode === "chat" ? "default" : "ghost"}><BotIcon className="size-4" />Assistant</Button><Button className="hidden sm:inline-flex" onClick={() => onChange("content-writer")} size="sm" variant={mode === "content-writer" ? "default" : "ghost"}><FilePenLineIcon className="size-4" />Content writer</Button></div>;
}

function Composer({ error, listening, message, mode, onChange, onClear, onSubmit, onVoice, pending, promptRef, voiceSupported }: { error: string; listening: boolean; message: string; mode: HoneyMode; onChange: (value: string) => void; onClear: () => void; onSubmit: () => void; onVoice: () => void; pending: boolean; promptRef: RefObject<HTMLTextAreaElement | null>; voiceSupported: boolean }) {
  useEffect(() => {
    const textarea = promptRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 320)}px`;
    textarea.style.overflowY = textarea.scrollHeight > 320 ? "auto" : "hidden";
  }, [message, promptRef]);
  return <form className="border-t bg-background px-3 py-4 sm:px-5" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}><div className="mx-auto w-[90%]"><div className="flex min-h-7 items-center justify-end">{message ? <Button className="h-7 px-2 text-xs" onClick={onClear} type="button" variant="ghost">Clear</Button> : null}</div><div className="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/25"><Textarea aria-label="Message Piko" className="min-h-11 flex-1 resize-none overflow-y-hidden border-0 bg-transparent shadow-none focus-visible:ring-0" disabled={pending} onChange={(event) => onChange(event.target.value)} placeholder={mode === "content-writer" ? "Describe the audience, goal, facts, and tone…" : "Ask Piko about your work…"} ref={promptRef} rows={1} value={message} /><Button aria-label={listening ? "Stop voice input" : "Start voice input"} disabled={!voiceSupported || pending} onClick={onVoice} size="icon" title="Voice input" type="button" variant="ghost"><MicIcon className={listening ? "animate-pulse" : ""} /></Button><Button aria-label="Send message" disabled={!message.trim() || pending} size="icon" type="submit"><SendIcon className="size-4" /></Button></div>{error ? <p className="pt-2 text-xs text-destructive">{error}</p> : null}</div></form>;
}

function Thinking() { return <div className="flex items-center gap-3 py-1 text-sm text-muted-foreground"><HoneyFace className="size-8" state="running" /><SparklesIcon className="size-4 animate-pulse" />Piko is preparing a clear response…</div>; }
function Welcome({ configured, mode }: { configured: boolean; mode: HoneyMode }) { return <div className="w-full max-w-md text-center"><HoneyFace className="mx-auto size-20" /><h2 className="pt-5 text-xl font-semibold">How can Piko help?</h2><p className="pt-2 text-sm leading-6 text-muted-foreground">{mode === "content-writer" ? "Describe your audience, goal, facts, and tone. Piko will organize a clear draft." : "Ask about products, customers, orders, storefront content, or concise business work."}</p>{!configured ? <p className="mt-5 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">Connect Piko before sending a request.</p> : null}</div>; }
