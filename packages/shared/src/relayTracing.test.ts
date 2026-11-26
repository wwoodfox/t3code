import { it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import { expect } from "vite-plus/test";
import * as HttpClient from "effect/http/HttpClient";
import * as HttpClientResponse from "effect/http/HttpClientResponse";

import * as RelayTracing from "./relayTracing.ts";

it.effect("RelayTracing.layer permanently disables relay span export", () => {
  let requests = 0;
  const mockHttp = HttpClient.layerMergedContext(
    Effect.succeed(
      HttpClient.make((request) => {
        requests += 1;
        return Effect.succeed(HttpClientResponse.fromWeb(request, new Response(null, { status: 200 })));
      }),
    ),
  );

  return Effect.gen(function* () {
    const tracer = yield* RelayTracing.RelayClientTracer;
    expect(Option.isNone(tracer)).toBe(true);
    const value = yield* RelayTracing.withRelayClientTracing(Effect.succeed("ok"));
    expect(value).toBe("ok");
    expect(requests).toBe(0);
  }).pipe(
    Effect.provide(
      RelayTracing.layer(
        {
          tracesUrl: "https://api.axiom.co/v1/traces",
          tracesDataset: "test",
          tracesToken: "xaat-test",
        },
        {
          serviceName: "test",
          runtime: "node",
          serviceInstanceId: "instance-1",
          client: "test",
        },
      ).pipe(Layer.provide(mockHttp)),
    ),
  );
});
