import { useEffect, useState } from "react";
import {
  DraggableSpritePet,
  type SpritePetBehavior,
  type SpritePetPlacement
} from "@cxshop/ui/components/sprite-pet";
import { getPikoMascotSettings, updatePikoMascotSettings } from "./honey.services";
import type { PikoMascotSettings } from "./honey.types";

const defaultSettings: PikoMascotSettings = { behavior: "roam", xRatio: 1, yRatio: 1 };

export function PikoScreenPet({ onClick }: { onClick: () => void }) {
  const [settings, setSettings] = useState<PikoMascotSettings | null>(null);

  useEffect(() => {
    void getPikoMascotSettings()
      .then(setSettings)
      .catch(() =>
        loadPublicSettings()
          .then(setSettings)
          .catch(() => setSettings(defaultSettings))
      );
  }, []);

  function save(patch: Partial<PikoMascotSettings>) {
    if (!settings) return;
    const previous = settings;
    const next = { ...previous, ...patch };
    setSettings(next);
    void updatePikoMascotSettings(next)
      .then(setSettings)
      .catch(() => setSettings(previous));
  }

  if (!settings) return null;

  return (
    <DraggableSpritePet
      alt="Piko the panda storekeeper"
      behavior={settings.behavior}
      canManage
      className="h-[104px] w-[96px] cursor-grab drop-shadow-xl active:cursor-grabbing"
      onBehaviorChange={(behavior: SpritePetBehavior) => save({ behavior })}
      onClick={onClick}
      onPlacementChange={(placement: SpritePetPlacement) =>
        save({ ...placement, behavior: "stay" })
      }
      placement={settings}
      src="/mascots/piko/spritesheet.webp"
      storageKey="cxshop.piko"
    />
  );
}

async function loadPublicSettings(): Promise<PikoMascotSettings> {
  const response = await fetch("/api/platform/public/piko/mascot");
  const envelope = (await response.json()) as { data?: PikoMascotSettings; success: boolean };
  if (!response.ok || !envelope.success || !envelope.data)
    throw new Error("Piko settings are unavailable.");
  return envelope.data;
}
