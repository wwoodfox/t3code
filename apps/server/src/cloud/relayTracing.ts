import type { ManagedPolicySummary } from "@t3tools/contracts";
import type * as RelayTracing from "@t3tools/shared/relayTracing";
import * as Layer from "effect/Layer";

/** Telemetry removed: server relay tracing is permanently disabled. */
export const allowedFor = (
  _env: Readonly<Record<string, string | undefined>>,
  _policy: ManagedPolicySummary | undefined,
): boolean => false;

/** Telemetry removed: server relay tracing is permanently disabled. */
export const relayLayer = (
  _resource: Omit<RelayTracing.RelayClientTracingResource, "serviceInstanceId">,
  _tracingConfig: RelayTracing.RelayClientTracingConfig | null = null,
) => Layer.empty;

export const layerHeadlessRelayClient = Layer.empty;

export const layerServerRelayBroker = Layer.empty;
