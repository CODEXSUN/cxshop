import type { WalkInOrderStatus } from "@cxshop/contracts";

const transitions: Record<WalkInOrderStatus, WalkInOrderStatus[]> = {
  confirmed: ["billed", "cancelled"], billed: ["ready_for_collection", "cancelled"],
  ready_for_collection: ["collected", "cancelled"], collected: [], cancelled: []
};

export function canTransition(from: WalkInOrderStatus, to: WalkInOrderStatus): boolean {
  return transitions[from].includes(to);
}
