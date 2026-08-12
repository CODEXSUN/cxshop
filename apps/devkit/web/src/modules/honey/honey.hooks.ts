import { useQuery } from "@tanstack/react-query";
import { getHoneyConnection, getHoneyConversation, listHoneyConversations } from "./honey.services";

export const honeyKeys = {
  connection: ["honey", "connection"] as const,
  conversation: (id: string | null) => ["honey", "conversation", id] as const,
  conversations: ["honey", "conversations"] as const
};
export const useHoneyConnection = () =>
  useQuery({ queryKey: honeyKeys.connection, queryFn: getHoneyConnection });
export const useHoneyConversations = () =>
  useQuery({ queryKey: honeyKeys.conversations, queryFn: listHoneyConversations });
export const useHoneyConversation = (id: string | null) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: honeyKeys.conversation(id),
    queryFn: () => getHoneyConversation(id!)
  });
