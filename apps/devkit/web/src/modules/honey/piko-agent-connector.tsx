import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2Icon,
  CircleIcon,
  Clock3Icon,
  CopyIcon,
  ExternalLinkIcon,
  LoaderCircleIcon,
  LogOutIcon,
  RadioTowerIcon,
  TerminalIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@cxshop/ui/components/button";
import { PikoConnectionHistory, usePikoConnectionHistory } from "./piko-connection-history";
import {
  cancelPikoCodexLogin,
  getPikoCodexStatus,
  logoutPikoCodex,
  startPikoBrowserLogin,
  startPikoDeviceLogin
} from "./piko-connector.services";
import type { PikoBrowserLogin, PikoDeviceLogin } from "./piko-connector.types";

const queryKey = ["piko", "codex", "status"] as const;

export function PikoAgentConnector() {
  const queryClient = useQueryClient();
  const [browserLogin, setBrowserLogin] = useState<PikoBrowserLogin | null>(null);
  const [deviceLogin, setDeviceLogin] = useState<PikoDeviceLogin | null>(null);
  const status = useQuery({
    queryFn: getPikoCodexStatus,
    queryKey,
    refetchInterval: browserLogin || deviceLogin ? 2_000 : 30_000
  });
  const history = usePikoConnectionHistory(status.data, status.dataUpdatedAt || undefined);
  useEffect(() => {
    if (!status.data?.connected) return;
    setBrowserLogin(null);
    setDeviceLogin(null);
  }, [status.data?.connected]);
  const deviceConnect = useMutation({
    mutationFn: startPikoDeviceLogin,
    onError: (error) => toast.error(error.message),
    onSuccess: setDeviceLogin
  });
  const browserConnect = useMutation({
    mutationFn: startPikoBrowserLogin,
    onError: (error) => toast.error(error.message)
  });
  const cancel = useMutation({
    mutationFn: cancelPikoCodexLogin,
    onError: (error) => toast.error(error.message),
    onSuccess: () => setBrowserLogin(null)
  });
  const disconnect = useMutation({
    mutationFn: logoutPikoCodex,
    onError: (error) => toast.error(error.message),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey })
  });

  function openBrowserLogin() {
    const popup = window.open("about:blank", "_blank");
    browserConnect.mutate(undefined, {
      onError: () => popup?.close(),
      onSuccess: (login) => {
        setBrowserLogin(login);
        if (popup) popup.location.href = login.authUrl;
        else window.location.href = login.authUrl;
      }
    });
  }

  return <section className="overflow-hidden rounded-lg border bg-card"><header className="flex items-center gap-3 border-b px-5 py-4"><span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><RadioTowerIcon className="size-4" /></span><div><h2 className="text-lg font-semibold leading-tight">Agent Connector</h2><p className="text-sm text-muted-foreground">Independent ChatGPT device authorization</p></div></header><ConnectionRow browserLogin={browserLogin} deviceLogin={deviceLogin} onBrowserConnect={openBrowserLogin} onCancel={() => { if (browserLogin) cancel.mutate(browserLogin.loginId); }} onDeviceConnect={() => deviceConnect.mutate()} onDisconnect={() => disconnect.mutate()} pending={deviceConnect.isPending} {...(status.dataUpdatedAt ? { checkedAt: status.dataUpdatedAt } : {})} {...(status.data ? { status: status.data } : {})} /><PikoConnectionHistory records={history} /></section>;
}

function ConnectionRow({ browserLogin, checkedAt, deviceLogin, onBrowserConnect, onCancel, onDeviceConnect, onDisconnect, pending, status }: { browserLogin: PikoBrowserLogin | null; checkedAt?: number; deviceLogin: PikoDeviceLogin | null; onBrowserConnect: () => void; onCancel: () => void; onDeviceConnect: () => void; onDisconnect: () => void; pending: boolean; status?: Awaited<ReturnType<typeof getPikoCodexStatus>> }) {
  return <div className="flex min-h-16 flex-col gap-3 border-b px-5 py-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-muted/30"><TerminalIcon className="size-4" /></span><div><h3 className="font-semibold leading-tight">Codex</h3><p className="text-sm text-muted-foreground">Independent local runtime</p></div></div>{status?.connected ? <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"><span className="flex items-center gap-2 font-medium text-emerald-700"><CheckCircle2Icon className="size-4" />Connected</span><span>{status.email ?? "Authenticated account"}</span><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium uppercase tracking-wide">{status.planType ?? status.accountType ?? "ChatGPT"}</span><span className="flex items-center gap-1.5 text-muted-foreground"><Clock3Icon className="size-3.5" />Checked {formatCheckedAt(checkedAt)}</span><Button onClick={onDisconnect} size="sm" variant="ghost"><LogOutIcon />Disconnect</Button></div> : browserLogin ? <div className="flex items-center gap-3 text-sm text-amber-700"><LoaderCircleIcon className="size-4 animate-spin" />Finish sign-in in your browser<Button onClick={onCancel} size="sm" variant="ghost">Cancel</Button></div> : deviceLogin ? <div className="flex flex-wrap items-center gap-3"><span className="flex items-center gap-2 text-sm text-amber-700"><LoaderCircleIcon className="size-4 animate-spin" />Awaiting approval</span><button className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2 font-mono font-semibold tracking-[0.14em]" onClick={() => void navigator.clipboard.writeText(deviceLogin.userCode)} type="button">{deviceLogin.userCode}<CopyIcon className="size-4" /></button><Button onClick={() => window.open(deviceLogin.verificationUrl, "_blank", "noopener,noreferrer")} size="sm"><ExternalLinkIcon />Open authentication page</Button></div> : <div className="flex flex-wrap items-center gap-3 text-sm"><span className="flex items-center gap-2 text-muted-foreground"><CircleIcon className="size-3.5 fill-current" />Disconnected</span>{status?.error ? <span className="text-destructive">{status.error}</span> : null}<Button onClick={onBrowserConnect} size="sm"><ExternalLinkIcon />Connect in browser</Button><Button disabled={pending} onClick={onDeviceConnect} size="sm" variant="outline">{pending ? <LoaderCircleIcon className="animate-spin" /> : <TerminalIcon />}Use device code</Button></div>}</div>;
}

function formatCheckedAt(value?: number) {
  if (!value) return "just now";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
