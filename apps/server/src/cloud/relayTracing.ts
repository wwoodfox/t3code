import type * as RelayTracing from "@t3tools/shared/relayTracing";
import * as Layer from "effect/Layer";

/** Telemetry removed: server relay tracing is permanently disabled. */
export const relayLayer = (
  _resource: Omit<RelayTracing.RelayClientTracingResource, "serviceInstanceId">,
  _tracingConfig: RelayTracing.RelayClientTracingConfig | null = null,
) => Layer.empty;

export const layerHeadlessRelayClient = Layer.empty;

export const layerServerRelayBroker = Layer.empty;
