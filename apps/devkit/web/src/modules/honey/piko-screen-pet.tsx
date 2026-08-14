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
  const [settings, setSettings] = useState(defaultSettings);
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    void getPikoMascotSettings()
      .then((next) => {
        setSettings(next);
        setCanManage(true);
      })
      .catch(() =>
        loadPublicSettings()
          .then(setSettings)
          .catch(() => undefined)
      );
  }, []);

  function save(patch: Partial<PikoMascotSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    void updatePikoMascotSettings(next)
      .then(setSettings)
      .catch(() => setSettings(settings));
  }

  return (
    <DraggableSpritePet
      alt="Piko the panda storekeeper"
      behavior={settings.behavior}
      canManage={canManage}
      className={
        canManage
          ? "h-[104px] w-[96px] cursor-grab drop-shadow-xl active:cursor-grabbing"
          : "h-[104px] w-[96px] cursor-pointer drop-shadow-xl"
      }
      onBehaviorChange={(behavior: SpritePetBehavior) => save({ behavior })}
      onClick={onClick}
      onPlacementChange={(placement: SpritePetPlacement) => save(placement)}
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
