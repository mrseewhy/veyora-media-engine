/**
 * Reproducible latency measurement for the 10-second proof.
 *
 * This is not a benchmark of a third-party AI provider. It is a real,
 * wall-clock measurement of a local streaming HTTP endpoint with a known
 * first-token delay and token cadence. The video labels the assistant UI as
 * simulated and the timing as measured.
 */
import {createServer, type Server} from 'node:http';
import {mkdir, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {performance} from 'node:perf_hooks';
import {arch, platform} from 'node:os';

const PORT = Number(process.env.LATENCY_DEMO_PORT ?? 4317);
const HOST = '127.0.0.1';
const FIRST_TOKEN_DELAY_MS = 850;
const TOKEN_INTERVAL_MS = 90;
const TOKEN_COUNT = 18;
const RUNS = 5;

const artifactPath = resolve('fixtures/storyboards/toolpilot-latency-measurement.json');
const localCopyPath = resolve('data/renderer10/latency-measurement.json');

interface Sample {
  run: number;
  ttftMs: number;
  totalMs: number;
  chunks: number;
}

function startDemoServer(): Promise<Server> {
  return new Promise((resolveServer, reject) => {
    const server = createServer((request, response) => {
      if (request.method !== 'POST' || request.url !== '/v1/chat/completions') {
        response.writeHead(404, {'content-type': 'application/json'});
        response.end(JSON.stringify({error: 'not found'}));
        return;
      }

      request.resume();
      response.writeHead(200, {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        connection: 'keep-alive',
      });

      setTimeout(() => {
        let token = 0;
        response.write(`data: ${JSON.stringify({delta: 'token_0'})}\n\n`);
        const timer = setInterval(() => {
          token += 1;
          if (token >= TOKEN_COUNT) {
            clearInterval(timer);
            response.write('data: [DONE]\n\n');
            response.end();
            return;
          }
          response.write(`data: ${JSON.stringify({delta: `token_${token}`})}\n\n`);
        }, TOKEN_INTERVAL_MS);
      }, FIRST_TOKEN_DELAY_MS);
    });

    server.once('error', reject);
    server.listen(PORT, HOST, () => resolveServer(server));
  });
}

async function measureOnce(run: number): Promise<Sample> {
  const start = performance.now();
  const response = await fetch(`http://${HOST}:${PORT}/v1/chat/completions`, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({
      model: 'demo-stream',
      messages: [{role: 'user', content: 'Explain API latency.'}],
      stream: true,
    }),
  });
  if (!response.ok) throw new Error(`Demo endpoint returned ${response.status}`);
  if (!response.body) throw new Error('Demo endpoint returned no body');

  const reader = response.body.getReader();
  let firstTokenMs: number | null = null;
  let chunks = 0;
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    if (value && value.byteLength > 0) {
      chunks += 1;
      if (firstTokenMs === null) firstTokenMs = performance.now() - start;
    }
  }
  const totalMs = performance.now() - start;
  return {
    run,
    ttftMs: Math.round(firstTokenMs ?? totalMs),
    totalMs: Math.round(totalMs),
    chunks,
  };
}

function median(values: number[]): number {
  const sorted = values.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[middle - 1] + sorted[middle]) / 2)
    : sorted[middle];
}

async function main() {
  const server = await startDemoServer();
  const samples: Sample[] = [];
  try {
    for (let run = 1; run <= RUNS; run += 1) {
      samples.push(await measureOnce(run));
    }
  } finally {
    await new Promise<void>((resolveClose) => server.close(() => resolveClose()));
  }

  const representative = samples
    .slice()
    .sort((a, b) => a.totalMs - b.totalMs)[Math.floor(samples.length / 2)];

  const artifact = {
    schemaVersion: 1,
    id: 'latency-local-01',
    kind: 'latency-measurement',
    endpoint: `http://${HOST}:${PORT}/v1/chat/completions`,
    method: 'POST',
    measuredAt: new Date().toISOString(),
    runs: samples.length,
    ttftMs: median(samples.map((sample) => sample.ttftMs)),
    totalMs: median(samples.map((sample) => sample.totalMs)),
    simulated: false,
    uiSimulated: true,
    disclosure:
      'Timing is a real measurement of a local demo API on this machine. The assistant interface and response text are simulated.',
    methodology:
      'Five sequential POST requests to a local Node HTTP streaming endpoint. The endpoint waits 850 ms before the first token, then emits 18 tokens at 90 ms intervals. The client measures time to first byte and total stream duration with performance.now(). The median run is shown; the representative run is retained below.',
    environment: {
      node: process.version,
      platform: platform(),
      arch: arch(),
    },
    representativeRun: representative.run,
    samples,
  };

  await mkdir(resolve('data/renderer10'), {recursive: true});
  await writeFile(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);
  await writeFile(localCopyPath, `${JSON.stringify(artifact, null, 2)}\n`);

  console.log(
    `Measured ${samples.length} local runs: TTFT ${artifact.ttftMs} ms, total ${artifact.totalMs} ms (median)`,
  );
  console.log(`Representative run: TTFT ${representative.ttftMs} ms, total ${representative.totalMs} ms`);
  console.log(`Evidence: ${artifactPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
