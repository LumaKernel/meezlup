import { useWebApiClientLayer } from "@/contexts/WebApiClientContext";
import type { WebApiClient } from "@/contexts/WebApiClientContext";
import type { MutationOptions, QueryOptions } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Effect, Runtime } from "effect";

const runtime = Runtime.defaultRuntime;

export const useEffectQuery = <E, A>(
  options: Omit<QueryOptions<A, E, A, ReadonlyArray<string>>, "queryFn"> & {
    readonly queryEffect: Effect.Effect<A, E, WebApiClient>;
    readonly queryKey: ReadonlyArray<string>;
  },
) => {
  const webApiClientLayer = useWebApiClientLayer();

  return useQuery({
    ...options,
    queryFn: () =>
      Runtime.runPromise(runtime)(
        options.queryEffect.pipe(Effect.provide(webApiClientLayer)),
      ),
  });
};

export const useEffectMutation = <Args, E, A>(
  options: Omit<MutationOptions<A, E, Args>, "mutationFn"> & {
    readonly mutationEffect: (args: Args) => Effect.Effect<A, E, WebApiClient>;
  },
) => {
  const webApiClientLayer = useWebApiClientLayer();

  return useMutation({
    mutationFn: (args: Args) =>
      Runtime.runPromise(runtime)(
        options.mutationEffect(args).pipe(Effect.provide(webApiClientLayer)),
      ),
    ...options,
  });
};
