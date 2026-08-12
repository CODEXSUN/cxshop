import { DraggableSpritePet } from "@cxshop/ui/components/sprite-pet";

export function PikoScreenPet({ onClick }: { onClick: () => void }) {
  return (
    <DraggableSpritePet
      alt="Piko the panda storekeeper"
      className="h-[104px] w-[96px] cursor-grab drop-shadow-xl active:cursor-grabbing"
      onClick={onClick}
      src="/mascots/piko/spritesheet.webp"
      storageKey="cxshop.piko.admin-position-v2"
    />
  );
}
