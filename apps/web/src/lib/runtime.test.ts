import { afterEach, describe, expect, it, vi } from "@effect/vitest";
import { withRelayClientTracing } from "@t3tools/shared/relayTracing";
import * as Effect from "effect/Effect";
import * as Tracer from "effect/Tracer";
// Load the runtime's module graph once at collection, outside the per-test timeout;
// each case re-evaluates it from that cache after vi.resetModules().
import "./runtime";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("web runtime relay telemetry policy", () => {
  it.each([
    {
      surface: "desktop opt-out",
      desktopBridge: { getRelayTelemetryEnabled: () => false },
    },
    {
      surface: "desktop enabled",
      desktopBridge: { getRelayTelemetryEnabled: () => true },
    },
    {
      surface: "ordinary browser",
      desktopBridge: undefined,
    },
  ])("never exports relay spans for $surface", async ({ desktopBridge }) => {
    vi.resetModules();
    vi.stubEnv("VITE_RELAY_OTLP_TRACES_URL", "https://telemetry.example.test/v1/traces");
    vi.stubEnv("VITE_RELAY_OTLP_TRACES_DATASET", "relay-test");
    vi.stubEnv("VITE_RELAY_OTLP_TRACES_TOKEN", "test-token");
    vi.stubGlobal("window", { desktopBridge });
    const fetchFn = vi.fn<typeof fetch>(async () => new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetchFn);
    const { runtime: freshRuntime } = await import("./runtime");
    const { setDelegate } = await import("../observability/clientTracer");
    const userSpans: Array<string> = [];

    try {
      expect(
        await freshRuntime.runPromise(
          Effect.succeed("relay operation completed").pipe(
            Effect.withSpan("relay.first-operation"),
            withRelayClientTracing,
          ),
        ),
      ).toBe("relay operation completed");

      setDelegate(
        Tracer.make({
          span(options) {
            userSpans.push(options.name);
            return new Tracer.NativeSpan(options);
          },
        }),
      );
      await freshRuntime.runPromise(Effect.void.pipe(Effect.withSpan("user.work")));
      expect(userSpans).toEqual(["user.work"]);
    } finally {
      setDelegate(null);
      await freshRuntime.dispose();
    }

    expect(fetchFn).not.toHaveBeenCalled();
  });
});
