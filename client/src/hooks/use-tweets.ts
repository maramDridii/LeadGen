import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useTweets() {
  return useQuery({
    queryKey: [api.tweets.list.path],
    queryFn: async () => {
      const res = await fetch(api.tweets.list.path);
      if (!res.ok) throw new Error("Failed to fetch tweets");
      return api.tweets.list.responses[200].parse(await res.json());
    },
  });
}

export function useMonitorTweets() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { offer: string }) => {
      const res = await fetch(api.tweets.monitor.path, {
        method: api.tweets.monitor.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to start monitoring");
      return api.tweets.monitor.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tweets.list.path] });
    },
  });
}
