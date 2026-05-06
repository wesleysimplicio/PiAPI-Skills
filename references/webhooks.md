# PiAPI webhooks

PiAPI does **not** sign webhook payloads with HMAC. Instead, the secret you
registered on the originating task is echoed back as a request header. To
verify a delivery, constant-time-compare that header against your stored
secret.

## Registration

Pass `webhook_config.endpoint` and `webhook_config.secret` inside the task
envelope:

```json
{
  "model": "midjourney",
  "task_type": "imagine",
  "input":  { "prompt": "..." },
  "config": {
    "service_mode": "public",
    "webhook_config": {
      "endpoint": "https://yourapp/api/piapi",
      "secret":   "<PIAPI_WEBHOOK_SECRET>"
    }
  }
}
```

The endpoint must be HTTPS — PiAPI ignores `http://` URLs. The secret is
opaque to PiAPI; it's only used so you can confirm the call came from a task
you submitted.

## Inbound payload

```json
{
  "task_id":   "abcd-1234",
  "model":     "midjourney",
  "task_type": "imagine",
  "status":    "Completed",
  "output":    { "image_urls": ["https://cdn.piapi.ai/..."] },
  "meta":      { "created_at": "...", "completed_at": "..." }
}
```

Headers worth knowing:

| Header | Meaning |
|---|---|
| `x-webhook-secret` | The secret you registered on the task. Compare in constant time. |
| `content-type` | Always `application/json`. |

## Status field casing

The `status` value carries the same enum drift as the polling endpoint:

- Capitalized for Midjourney, Kling, Faceswap (`Pending`, `Processing`,
  `Staged`, `Completed`, `Failed`).
- Lowercase for Flux, Veo 3, Gemini, Suno, Luma, Hailuo, Hunyuan, Trellis
  (`pending`, `starting`, `processing`, `success`, `failed`, `retry`).

Lowercase before comparing. Treat as terminal-success: `completed`,
`complete`, `success`, `succeeded`. Terminal-failure: `failed`, `failure`,
`error`, `canceled`, `cancelled`, `rejected`.

`Staged` (Midjourney) is **not** terminal — it indicates the 4-up grid is
ready and a follow-up `upscale` / `variation` is expected.

## Verifying — Python (Flask)

```python
import hmac, os
from flask import Flask, request, jsonify

app = Flask(__name__)
EXPECTED = os.environ["PIAPI_WEBHOOK_SECRET"].encode()

@app.post("/api/piapi")
def piapi_webhook():
    provided = request.headers.get("x-webhook-secret", "").encode()
    if not hmac.compare_digest(EXPECTED, provided):
        return jsonify(error="forbidden"), 403

    event = request.get_json(silent=True) or {}
    status = (event.get("status") or "").lower()
    if status in {"completed", "complete", "success", "succeeded"}:
        # enqueue downstream work
        ...
    elif status in {"failed", "failure", "error", "canceled", "cancelled", "rejected"}:
        # mark the originating job as failed
        ...
    return jsonify(ok=True), 200
```

## Verifying — Node (Express)

```js
import express from "express";
import crypto from "node:crypto";

const app = express();
app.use(express.json());
const EXPECTED = process.env.PIAPI_WEBHOOK_SECRET;

app.post("/api/piapi", (req, res) => {
  const provided = req.header("x-webhook-secret") ?? "";
  if (
    provided.length !== EXPECTED.length ||
    !crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(EXPECTED))
  ) {
    return res.status(403).json({ error: "forbidden" });
  }
  const status = (req.body.status ?? "").toLowerCase();
  // dispatch on terminal-success / terminal-failure
  res.json({ ok: true });
});
```

## Verifying — CLI

```bash
piapi-cli verify-webhook \
  --header-secret "$X_WEBHOOK_SECRET_FROM_REQUEST" \
  --expected      "$PIAPI_WEBHOOK_SECRET"
# exits 0 on match, non-zero on mismatch
```

## Retry policy

PiAPI retries the webhook every **5 seconds**, up to **3 attempts**, on any
non-2xx response or socket error. After three failures, no further attempts
are made — recover by polling `GET /api/v1/task/{task_id}` (or running
`piapi-cli result <task_id>`).

Make handlers **idempotent** (key off `task_id`) and respond `2xx` quickly.
Long synchronous work in the handler will exceed PiAPI's 5-second retry
window and trigger spurious duplicates.

## Recovering missed deliveries

```bash
piapi-cli result <task_id>
```

If the task is still in flight:

```bash
piapi-cli wait <task_id> --timeout 1800
```

For models where webhook is the only sane pattern (Hunyuan, faceswap-video,
long Suno tracks), set up a fallback poller that sweeps non-terminal tasks
hourly so a dropped webhook doesn't strand the job.

## Operational notes

- Always TLS. PiAPI ignores plain HTTP endpoints.
- Output URLs in `data.output.*` are PiAPI CDN links and **expire**. Copy
  binaries to your own storage if you need them long-term.
- Rotate webhook secrets by re-submitting tasks with the new value; old
  in-flight tasks keep the old secret until they complete.
- Hunyuan and faceswap-video commonly run 3–10 minutes — long-poll from a
  serverless function with a short timeout will fail before the task
  finishes. Use webhooks for those families.

## See also

- [`rest-api.md`](./rest-api.md) — task envelope, polling, status drift.
- [`errors.md`](./errors.md) — HTTP status interpretation.
- [`models.md`](./models.md) — per-family input shapes.
- [`rate-limits.md`](./rate-limits.md) — concurrency and RPM caps.
- [`../examples/08-webhooks.md`](../examples/08-webhooks.md) — receiver
  cookbook.
