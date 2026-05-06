# PiAPI errors

PiAPI returns standard HTTP status codes plus a structured body:

```json
{
  "code":    400,
  "data":    null,
  "message": "human-readable description"
}
```

The CLI raises on any non-2xx and prints both the code and message.

## HTTP status interpretation

### 400 — Bad Request

The most common failure. Causes, in order of frequency:

- Wrong `task_type` for the chosen `model` (e.g., `imagine` against `kling`).
- Missing required `input` field for the chosen `task_type` (e.g., no
  `image_url` for `image2video`).
- Invalid enum (`mode`, `aspect_ratio`, `process_mode`).
- Malformed `webhook_config` (must include both `endpoint` and `secret`).

Fix: cross-check the family in [`models.md`](./models.md), then resubmit.

### 401 — Unauthorized

The `x-api-key` header is missing, malformed, or for a deleted/disabled key.
Header name must be exactly lowercase `x-api-key`.

### 402 — Payment Required

The account is out of credits or has no active plan. Top up at
https://piapi.ai/pricing.

### 403 — Forbidden

The model or task type isn't enabled on this plan. Hunyuan, for instance,
isn't on the Free tier. Upgrade or switch families.

### 404 — Not Found

Either a stale `task_id` (PiAPI prunes old tasks) or a bad path. Confirm
the path is `/api/v1/task/{task_id}` and the ID is correctly URL-encoded.

### 429 — Too Many Requests

Concurrency cap or RPM cap for the tier was exceeded. The response carries
`Retry-After` when available. Back off; do not hammer.

### 5xx — Upstream Error

The vendor model errored. PiAPI may set `status = retry` on the task itself
to indicate it will retry once or twice on its own. If it doesn't, resubmit
after a delay.

## Per-model gotchas

### Midjourney

- `Staged` status is **not** a terminal state. It means the 4-up grid is
  ready and you should follow up with `upscale` or `variation` referencing
  the parent `task_id` and `index = 1..4`.
- Private mode (HYA) requires Discord token + channel ID + guild ID under
  `config.midjourney`. Missing any of those returns 400.
- The `process_mode = relax` queue can sit for several minutes during peak.

### Flux

- `flux1-dev-advanced` requires the matching ControlNet/LoRA fields on the
  `controlnet-lora` task type. Sending those keys to `flux1-schnell` returns
  400.
- `seed` is optional but reproducibility is per-vendor — different model
  versions can shift output for the same seed.

### Kling

- `mode = pro` is more expensive and slower than `std`. Don't default to it.
- `lipsync` requires both `audio_url` and `video_url`; `effects` requires
  `effect_id`.

### Suno (`music-u`)

- `generate_music_custom` returns 400 if `prompt` (lyrics) exceeds the
  per-track cap (~3 minutes worth). Use `extend` for longer pieces.
- The model returns two clip variants per generation. Cost reflects that.

### Hunyuan

- Tasks routinely take 3–10 minutes. Long-polling from a serverless function
  with a short timeout will fail before the task finishes — use webhooks.
- Per-tier concurrency caps don't apply to Hunyuan in the published pricing
  snapshot — verify in [`rate-limits.md`](./rate-limits.md).

### Faceswap (video)

- Video jobs are markedly slower than image. Always use webhooks. Long-poll
  is impractical.
- Output URLs expire from PiAPI's CDN; copy the binary to your own storage if
  you need it long-term.

## Common CLI errors

- `piapi-cli: PIAPI_API_KEY is not set` — export the env var before running.
- `piapi-cli: timed out after 1800s` — increase `--timeout` or switch to
  webhook mode.
- `piapi-cli: status='Failed' …` — task failed upstream. Inspect
  `data.error` in the result for the vendor message.

## Webhook delivery failures

PiAPI retries every 5 seconds, up to 3 attempts, on any non-2xx response.
After three failures, no further attempts are made — you must poll
`GET /api/v1/task/{task_id}` to recover the result.

## See also

- [`rest-api.md`](./rest-api.md) — envelope and headers.
- [`models.md`](./models.md) — per-family input shapes.
- [`webhooks.md`](./webhooks.md) — verification and retry policy.
- [`rate-limits.md`](./rate-limits.md) — tier caps.
