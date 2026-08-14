import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  CheckIcon,
  EllipsisVerticalIcon,
  MapPinIcon,
  MessageCircleIcon,
  MicIcon,
  MoveHorizontalIcon,
  PauseIcon,
  XIcon
} from "lucide-react";
import { cn } from "../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "./dropdown-menu";

export type SpritePetState =
  | "failed"
  | "idle"
  | "jumping"
  | "review"
  | "running"
  | "running-left"
  | "running-right"
  | "shopping"
  | "sitting"
  | "waiting"
  | "waving";
export type SpritePetBehavior = "roam" | "stay";
export type SpritePetPlacement = { xRatio: number; yRatio: number };
type SpritePetAttention = "shopping-help" | "welcome";

const IDLE_HELP_DELAY = 120_000;
const HELP_MESSAGE_DURATION = 10_000;

const animationRows: Record<SpritePetState, { frames: number; row: number; startFrame?: number }> =
  {
    idle: { frames: 1, row: 0, startFrame: 5 },
    "running-right": { frames: 8, row: 1 },
    "running-left": { frames: 8, row: 2 },
    waving: { frames: 4, row: 3 },
    jumping: { frames: 5, row: 4 },
    failed: { frames: 8, row: 5 },
    sitting: { frames: 6, row: 6 },
    waiting: { frames: 6, row: 6 },
    running: { frames: 6, row: 7 },
    review: { frames: 6, row: 8 },
    shopping: { frames: 6, row: 8 }
  };

export function SpritePet({
  alt,
  className,
  interval,
  src,
  state = "idle"
}: {
  alt: string;
  className?: string;
  interval?: number;
  src: string;
  state?: SpritePetState;
}) {
  const [frame, setFrame] = useState(0);
  const animation = animationRows[state];
  const frameInterval = interval ?? (state === "idle" || state === "sitting" ? 420 : 180);

  useEffect(() => {
    setFrame(0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setFrame((current) => (current + 1) % animation.frames),
      frameInterval
    );
    return () => window.clearInterval(timer);
  }, [animation.frames, frameInterval, state]);

  return (
    <span
      aria-label={alt}
      className={cn("block shrink-0 bg-no-repeat", className)}
      role="img"
      style={{
        backgroundImage: `url(${src})`,
        backgroundPosition: `${-(frame + (animation.startFrame ?? 0)) * 96}px ${-animation.row * 104}px`,
        backgroundSize: "768px 1144px",
        height: 104,
        width: 96
      }}
    />
  );
}

export function DraggableSpritePet({
  alt,
  behavior = "roam",
  canManage = false,
  className,
  onClick,
  onBehaviorChange,
  onPlacementChange,
  onVoiceTranscript,
  placement = { xRatio: 1, yRatio: 1 },
  src,
  storageKey
}: {
  alt: string;
  behavior?: SpritePetBehavior;
  canManage?: boolean;
  className?: string;
  onClick?: () => void;
  onBehaviorChange?: (behavior: SpritePetBehavior) => void;
  onPlacementChange?: (placement: SpritePetPlacement) => void;
  onVoiceTranscript?: (transcript: string) => void;
  placement?: SpritePetPlacement;
  src: string;
  storageKey: string;
}) {
  const [position, setPosition] = useState(() => positionFromPlacement(placement));
  const positionRef = useRef(position);
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<SpritePetState>("idle");
  const [walking, setWalking] = useState(false);
  const [walkingDuration, setWalkingDuration] = useState(0);
  const [attention, setAttention] = useState<SpritePetAttention | null>(() =>
    window.sessionStorage.getItem(`${storageKey}.welcomed`) ? null : "welcome"
  );
  const attentionRef = useRef(attention);
  const modeRef = useRef(mode);
  const walkingRef = useRef(walking);
  const [listening, setListening] = useState(false);
  const drag = useRef<{ moved: boolean; offsetX: number; offsetY: number } | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    attentionRef.current = attention;
  }, [attention]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    walkingRef.current = walking;
  }, [walking]);

  useEffect(() => {
    if (attention !== "welcome") return;
    window.sessionStorage.setItem(`${storageKey}.welcomed`, "true");
    const timer = window.setTimeout(() => setAttention(null), 8000);
    return () => window.clearTimeout(timer);
  }, [attention, storageKey]);

  useEffect(() => {
    let lastActivity = Date.now();
    let lastPrompt = 0;
    let dismissTimer: number | undefined;
    const markActive = () => {
      lastActivity = Date.now();
      if (attentionRef.current !== "shopping-help") return;
      window.clearTimeout(dismissTimer);
      setAttention(null);
      setMode("idle");
    };
    const checkIdle = () => {
      const inactiveSince = Math.max(lastActivity, lastPrompt);
      if (
        Date.now() - inactiveSince < IDLE_HELP_DELAY ||
        walkingRef.current ||
        modeRef.current !== "idle" ||
        attentionRef.current
      )
        return;
      lastPrompt = Date.now();
      setMode("waving");
      setAttention("shopping-help");
      dismissTimer = window.setTimeout(() => {
        setAttention(null);
        setMode("idle");
      }, HELP_MESSAGE_DURATION);
    };
    const activityEvents = ["keydown", "pointerdown", "pointermove", "scroll", "touchstart"];
    activityEvents.forEach((event) =>
      window.addEventListener(event, markActive, { passive: true })
    );
    const idleCheck = window.setInterval(checkIdle, 5000);
    return () => {
      window.clearInterval(idleCheck);
      window.clearTimeout(dismissTimer);
      activityEvents.forEach((event) => window.removeEventListener(event, markActive));
    };
  }, []);

  useEffect(() => {
    if (behavior !== "roam" || walking || mode !== "idle" || attention) return;
    const timer = window.setTimeout(
      () => {
        const current = positionRef.current;
        const distance = 150 + Math.random() * 180;
        const rightEdge = window.innerWidth - 104;
        const canMoveRight = current.x + distance <= rightEdge;
        const canMoveLeft = current.x - distance >= 8;
        const direction =
          canMoveLeft && canMoveRight ? (Math.random() > 0.5 ? 1 : -1) : canMoveRight ? 1 : -1;
        const next = clampPetPosition({ x: current.x + direction * distance, y: current.y });
        const duration = Math.max(700, (Math.abs(next.x - current.x) / 150) * 1000);
        setMode(direction < 0 ? "running-left" : "running-right");
        setWalking(true);
        setWalkingDuration(duration);
        positionRef.current = next;
        setPosition(next);
        window.setTimeout(() => {
          const restingState = randomRestingState();
          setMode(restingState);
          setWalking(false);
          if (restingState !== "idle") window.setTimeout(() => setMode("idle"), 2800);
        }, duration);
      },
      6500 + Math.random() * 4500
    );
    return () => window.clearTimeout(timer);
  }, [attention, behavior, mode, walking]);

  useEffect(() => {
    if (drag.current) return;
    const next = positionFromPlacement(placement);
    positionRef.current = next;
    setPosition(next);
  }, [placement.xRatio, placement.yRatio]);

  useEffect(() => {
    const place = () => {
      const next = positionFromPlacement(placement);
      positionRef.current = next;
      setPosition(next);
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [placement.xRatio, placement.yRatio]);

  function begin(event: PointerEvent<HTMLDivElement>) {
    if (!canManage) return;
    if ((event.target as HTMLElement).closest("button,[role='menuitem']")) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    drag.current = {
      moved: false,
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setWalking(false);
    setMode("idle");
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    if (!canManage || !drag.current) return;
    drag.current.moved = true;
    const next = clampPetPosition({
      x: event.clientX - drag.current.offsetX,
      y: event.clientY - drag.current.offsetY
    });
    positionRef.current = next;
    setPosition(next);
  }

  function end(event: PointerEvent<HTMLDivElement>) {
    if (!canManage || !drag.current) return;
    const moved = drag.current.moved;
    drag.current = undefined;
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (moved) onPlacementChange?.(placementFromPosition(positionRef.current));
    if (!moved) onClick?.();
  }

  if (!mounted) return null;

  return createPortal(
    <motion.div
      animate={{ x: position.x, y: position.y }}
      aria-label={canManage ? `${alt}. Drag to set the global position.` : alt}
      className={cn("group fixed z-[90] touch-none select-none", className)}
      onClick={canManage ? undefined : onClick}
      onPointerCancel={end}
      onPointerDown={begin}
      onPointerMove={move}
      onPointerUp={end}
      role="group"
      initial={false}
      style={{ left: 0, top: 0 }}
      tabIndex={0}
      transition={{ duration: walking ? walkingDuration / 1000 : 0, ease: "linear" }}
    >
      {attention ? (
        <div className="absolute bottom-full right-0 mb-3 w-56 rounded-3xl border border-sky-200 bg-white/95 px-5 py-3 text-sm text-slate-900 shadow-xl backdrop-blur">
          <button
            aria-label="Close Piko welcome"
            className="absolute right-2 top-2"
            onClick={() => {
              setAttention(null);
              setMode("idle");
            }}
            type="button"
          >
            <XIcon className="size-4" />
          </button>
          <strong>{attention === "shopping-help" ? "Need a hand?" : "Hi, I'm Piko"}</strong>
          <p className="pt-1 text-xs text-slate-500">
            {attention === "shopping-help"
              ? "Can I help you find or compare something to buy?"
              : "I'm watching the shop and ready to help."}
          </p>
        </div>
      ) : null}
      <SpritePet alt={alt} src={src} state={mode} />
      <button
        aria-label={listening ? "Stop Piko voice input" : "Start Piko voice input"}
        className="pointer-events-none absolute left-1/2 top-full grid size-8 -translate-x-1/2 scale-90 place-items-center rounded-full border border-sky-200 bg-white text-sky-700 opacity-0 shadow-md transition group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100"
        onClick={() => startVoiceInput(setListening, onVoiceTranscript, onClick)}
        onPointerDown={(event) => event.stopPropagation()}
        type="button"
      >
        <MicIcon className={cn("size-4", listening && "animate-pulse")} />
      </button>
      {canManage ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Piko movement options"
              className="pointer-events-none absolute left-full top-1/2 grid size-8 -translate-y-1/2 scale-90 place-items-center rounded-full border border-sky-200 bg-white text-sky-800 opacity-0 shadow-md transition group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100 data-[state=open]:pointer-events-auto data-[state=open]:scale-100 data-[state=open]:opacity-100"
              onPointerDown={(event) => event.stopPropagation()}
              type="button"
            >
              <EllipsisVerticalIcon className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-52 rounded-2xl"
            side="right"
            sideOffset={8}
          >
            <DropdownMenuLabel>Piko movement</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => changeBehavior("stay")}>
              <PauseIcon />
              <span className="flex-1">Stay in place</span>
              {behavior === "stay" ? <CheckIcon /> : null}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => changeBehavior("roam")}>
              <MoveHorizontalIcon />
              <span className="flex-1">Roam left and right</span>
              {behavior === "roam" ? <CheckIcon /> : null}
            </DropdownMenuItem>
            <DropdownMenuLabel>Piko position</DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={() => onPlacementChange?.(placementFromPosition(positionRef.current))}
            >
              <MapPinIcon />
              Use current at startup
            </DropdownMenuItem>
            <DropdownMenuLabel>Piko assistant</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => onClick?.()}>
              <MessageCircleIcon />
              Open Piko chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </motion.div>,
    document.body
  );

  function changeBehavior(next: SpritePetBehavior) {
    setWalking(false);
    setMode("idle");
    onBehaviorChange?.(next);
  }
}

function positionFromPlacement(placement: SpritePetPlacement) {
  const width = Math.max(0, window.innerWidth - 112);
  const height = Math.max(0, window.innerHeight - 120);
  return clampPetPosition({
    x: 8 + width * clampRatio(placement.xRatio),
    y: 8 + height * clampRatio(placement.yRatio)
  });
}

function placementFromPosition(position: { x: number; y: number }): SpritePetPlacement {
  return {
    xRatio: clampRatio((position.x - 8) / Math.max(1, window.innerWidth - 112)),
    yRatio: clampRatio((position.y - 8) / Math.max(1, window.innerHeight - 120))
  };
}

function clampRatio(value: number) {
  return Math.min(1, Math.max(0, value));
}

function clampPetPosition(position: { x: number; y: number }) {
  return {
    x: Math.min(window.innerWidth - 104, Math.max(8, position.x)),
    y: Math.min(window.innerHeight - 112, Math.max(8, position.y))
  };
}

function randomRestingState(): SpritePetState {
  const states: SpritePetState[] = ["idle", "sitting", "shopping", "waiting", "idle", "idle"];
  return states[Math.floor(Math.random() * states.length)] ?? "idle";
}

function startVoiceInput(
  setListening: (value: boolean) => void,
  onTranscript: ((transcript: string) => void) | undefined,
  onFallback: (() => void) | undefined
) {
  const Recognition = (
    window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }
  ).webkitSpeechRecognition;
  if (!Recognition) {
    onFallback?.();
    return;
  }
  const recognition = new Recognition();
  recognition.lang = navigator.language || "en-IN";
  recognition.onstart = () => setListening(true);
  recognition.onend = () => setListening(false);
  recognition.onerror = () => setListening(false);
  recognition.onresult = (event) => onTranscript?.(event.results[0]?.[0]?.transcript ?? "");
  recognition.start();
}

type SpeechRecognitionLike = {
  lang: string;
  onend: () => void;
  onerror: () => void;
  onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onstart: () => void;
  start: () => void;
};
