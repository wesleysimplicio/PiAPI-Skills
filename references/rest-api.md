# PiAPI REST API

PiAPI exposes two surfaces:

1. **Async task envelope** at `https://api.piapi.ai/api/v1/task` — every
   media model (image, video, music, 3D, audio, faceswap) goes through here.
2. **Sync LLM proxy** at `https://api.piapi.ai/v1/chat/completions` —
   OpenAI-compatible, supports streaming.

Auth header on both surfaces (lowercase canonical):

```
x-api-key: <PIAPI_API_KEY>
```

There is no official PiAPI SDK. The CLI in this repo uses pure `requests`.

## Submit a task

```
POST /api/v1/task
Content-Type: application/json
x-api-key:    <PIAPI_API_KEY>
```

```json
{
  "model":     "<vendor-or-family>",
  "task_type": "<task>",
  "input":     { ... },
  "config": {
    "service_mode": "public",
    "webhook_config": {
      "endpoint": "https://yourapp/api/piapi",
      "secret":   "<PIAPI_WEBHOOK_SECRET>"
    }
  }
}
```

Response:

```json
{
  "code": 200,
  "data": { "task_id": "abcd-1234", "status": "Pending" },
  "message": "success"
}
```

## Fetch a task

```
GET /api/v1/task/{task_id}
```

```json
{
  "code": 200,
  "data": {
    "task_id":   "abcd-1234",
    "model":     "midjourney",
    "task_type": "imagine",
    "status":    "Completed",
    "output":    { "image_urls": [...] },
    "meta":      { "created_at": "...", "completed_at": "..." }
  }
}
```

## Cancel a task

```
DELETE /api/v1/task/{task_id}
```

Cancellation only succeeds while the task status is `Pending` /
`pending`. Once a task is `Processing`, the only way to stop billing is to
let it finish or fail.

## LLM (sync)

```
POST /v1/chat/completions
Content-Type: application/json
x-api-key:    <PIAPI_API_KEY>
```

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "system", "content": "You are concise."},
    {"role": "user",   "content": "Hello."}
  ],
  "stream": false
}
```

Streaming uses standard SSE — set `"stream": true` and read `data:` chunks
until `data: [DONE]`.

## Status drift

Different model families return different `status` casing. Lowercase before
comparing.

| Family | Casing | Values |
|---|---|---|
| Midjourney, Kling, Faceswap | Capitalized | `Pending`, `Processing`, `Staged`, `Completed`, `Failed` |
| Flux, Veo 3, Gemini, Suno | Lowercase | `pending`, `starting`, `processing`, `success`, `failed`, `retry` |

Treat as terminal-success: `completed`, `complete`, `success`, `succeeded`.
Treat as terminal-failure: `failed`, `failure`, `error`, `canceled`,
`cancelled`, `rejected`. Anything else means keep polling.

## Polling

Poll `GET /api/v1/task/{task_id}` every 1–3 seconds (the CLI defaults to 2s)
up to a sensible timeout (default 1800s for video; 300s for image). For very
slow models (Hunyuan, faceswap-video, long Suno tracks) prefer webhooks.

## Errors

The HTTP layer returns standard 4xx/5xx codes. The body usually includes:

```json
{
  "code":    400,
  "data":    null,
  "message": "..."
}
```

See [`errors.md`](./errors.md) for the per-status interpretation.

## Reference

- Overview: https://piapi.ai/docs/overview
- LLM API: https://piapi.ai/docs/llm-api
- MCP server: https://piapi.ai/docs/mcp-server
- Pricing: https://piapi.ai/pricing
