import type { SpritePetState } from "@cxshop/ui/components/sprite-pet";

export function HoneyFace({
  className = "size-10",
  state: _state = "idle"
}: {
  className?: string;
  state?: SpritePetState;
}) {
  return (
    <span className={`relative block shrink-0 ${className}`}>
      <img
        alt="Piko the panda storekeeper"
        className="size-full object-contain"
        src="/mascots/piko-storekeeper.png"
      />
    </span>
  );
}
