import { useQuery } from "@tanstack/react-query";
import { listArticles, listTaxonomy } from "./editor.services";
export const articleKey = ["blogs", "articles"] as const;
export const useArticles = () => useQuery({ queryKey: articleKey, queryFn: listArticles });
export const useTaxonomy = () =>
  useQuery({ queryKey: ["blogs", "taxonomy"], queryFn: listTaxonomy });
