import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type GenerateContentRequest } from "@shared/routes";

export function useContent() {
  return useQuery({
    queryKey: [api.content.list.path],
    queryFn: async () => {
      const res = await fetch(api.content.list.path);
      if (!res.ok) throw new Error("Failed to fetch content");
      return api.content.list.responses[200].parse(await res.json());
    },
  });
}

export function useGenerateContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: GenerateContentRequest) => {
      const res = await fetch(api.content.generate.path, {
        method: api.content.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to generate content");
      return api.content.generate.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.content.list.path] });
    },
  });
}
