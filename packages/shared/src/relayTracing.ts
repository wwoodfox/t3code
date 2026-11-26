import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import type * as Tracer from "effect/Tracer";
import type { HttpClient } from "effect/http";

export interface RelayClientTracingConfig {
  readonly tracesUrl: string;
  readonly tracesDataset: string;
  readonly tracesToken: string;
}

export interface RelayClientTracingResource {
  readonly serviceName: string;
  readonly serviceVersion?: string;
  readonly runtime: string;
  readonly serviceInstanceId: string;
  readonly client: string;
  readonly component?: string;
  readonly attributes?: Readonly<Record<string, string>> | undefined;
}

export class RelayClientTracer extends Context.Reference(
  "@t3tools/shared/relayTracing/RelayClientTracer",
  {
    defaultValue: () => Option.none<Tracer.Tracer>(),
  },
) {}

/** Telemetry removed: never exports relay spans externally. */
export const withRelayClientTracing = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
): Effect.Effect<A, E, R> => effect;

/** Telemetry removed: local spans remain untouched. */
export const withLocalTracing = <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
  effect;

/** Telemetry removed: always returns a no-op layer that never exports spans to Axiom or OTLP. */
export function layer(
  _config: RelayClientTracingConfig | null,
  _resource: RelayClientTracingResource,
  _options?: { readonly isEnabled?: () => boolean },
): Layer.Layer<never, never, HttpClient.HttpClient> {
  return Layer.succeed(RelayClientTracer, Option.none());
}
