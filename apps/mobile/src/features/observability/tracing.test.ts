import { expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { vi } from "vite-plus/test";

import { withRelayClientTracing } from "@t3tools/shared/relayTracing";

import * as Tracing from "./tracing";

it.effect("permanently disables mobile Axiom OTLP trace export", () => {
  const fetchFn = vi.fn<typeof fetch>(async () => new Response(null, { status: 202 }));
  vi.stubGlobal("fetch", fetchFn);
  const layerTracing = Tracing.layerFromConfig(
    {
      tracesUrl: "https://api.axiom.test/v1/traces",
      tracesDataset: "mobile-traces",
      tracesToken: "public-ingest-token",
    },
    {
      appVariant: "test",
      serviceInstanceId: "test-instance",
      serviceVersion: "1.2.3",
    },
  );
  const layerTracedApplication = Layer.effectDiscard(
    Effect.void.pipe(Effect.withSpan("mobile.test.span"), withRelayClientTracing),
  ).pipe(Layer.provide(layerTracing));

  return Layer.build(layerTracedApplication).pipe(
    Effect.scoped,
    Effect.andThen(
      Effect.sync(() => {
        expect(Tracing.resolveTracingConfig()).toBeNull();
        expect(fetchFn).not.toHaveBeenCalled();
        vi.unstubAllGlobals();
      }),
    ),
  );
});
