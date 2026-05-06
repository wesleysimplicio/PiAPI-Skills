# 08 · Webhooks

PiAPI does **not** sign webhook payloads with HMAC. Instead, it echoes the
secret you registered with the task back in the `x-webhook-secret` request
header. Verification is a constant-time string compare against your stored
secret.

## Register a callback when submitting

```bash
piapi-cli submit --model midjourney --task-type imagine \
  --input '{
    "prompt": "studio portrait of a calico cat",
    "aspect_ratio": "1:1",
    "process_mode": "fast"
  }' \
  --webhook-url    https://yourapp/api/piapi \
  --webhook-secret "$PIAPI_WEBHOOK_SECRET"
```

The CLI builds the equivalent of:

```json
{
  "config": {
    "webhook_config": {
      "endpoint": "https://yourapp/api/piapi",
      "secret":   "<PIAPI_WEBHOOK_SECRET>"
    }
  }
}
```

## Inbound payload shape

```json
{
  "task_id":   "abcd-1234",
  "model":     "midjourney",
  "task_type": "imagine",
  "status":    "Completed",
  "output":    { "image_urls": ["https://cdn.piapi.ai/..."] }
}
```

The `status` field carries the same enum drift as the polling endpoint:
capitalized for Midjourney/Kling/Faceswap, lowercase for Flux/Veo3/Gemini/Suno.

## Verify the secret

```bash
piapi-cli verify-webhook \
  --header-secret "$X_WEBHOOK_SECRET_FROM_REQUEST" \
  --expected      "$PIAPI_WEBHOOK_SECRET"
# exits 0 on match, non-zero on mismatch
```

## Receiver — Flask

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

    event = request.get_json()
    status = (event.get("status") or "").lower()
    if status in {"completed", "complete", "success", "succeeded"}:
        # enqueue downstream work (image download, DB update, etc.)
        ...
    elif status in {"failed", "failure", "error", "canceled", "cancelled", "rejected"}:
        # mark the originating job as failed
        ...
    return jsonify(ok=True), 200
```

## Receiver — Express (Node)

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
  // ...handle terminal-success / terminal-failure cases
  res.json({ ok: true });
});
```

## Retry policy

PiAPI retries the webhook every **5 seconds**, up to **3 attempts**, on any
non-2xx response or socket error. Make your handler idempotent (key off
`task_id`) and respond `2xx` quickly — long synchronous work in the handler
will trigger spurious retries.

## Notes

- Always use TLS for the endpoint. PiAPI ignores `http://` URLs.
- Some model families (notably Hunyuan and faceswap-video) take long enough
  that webhook delivery is the only sensible pattern — long-polling will hit
  client timeouts before the job finishes.
- Webhook secrets are at-rest in your database; rotate them on suspected
  compromise by re-submitting tasks with a new secret.
