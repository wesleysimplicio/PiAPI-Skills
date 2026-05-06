# PiAPI rate limits

PiAPI enforces caps in two dimensions:

1. **Concurrency** — number of in-flight tasks per account.
2. **Requests per minute (RPM)** — calls to `POST /api/v1/task`,
   `GET /api/v1/task/{id}`, and `POST /v1/chat/completions`.

When you exceed either, the API returns `429 Too Many Requests`. Honor the
`Retry-After` header when present and back off — hammering will get the key
temporarily blocked.

## Tier snapshot

Numbers below come from the PiAPI pricing page snapshot. Verify the live
numbers at https://piapi.ai/pricing before quoting them in production.

| Tier | Monthly fee | Concurrency (PPU) | RPM | Notes |
|---|---|---|---|---|
| Free | $0 | 1 | ~10 | Trial credits only. Most premium families gated. |
| Creator | low | 5 | ~60 | Hobby projects. |
| Pro | mid | 30 | ~300 | Production startups. |
| Enterprise | custom | 90+ | custom | SLA + private deployment options. |

Concurrency applies to **public** (PPU) tasks. **Private** (HYA) tasks run
on your own vendor account and don't draw from this pool.

## Per-family caveats

- **Hunyuan** — the published pricing snapshot does not apply per-tier
  concurrency caps to Hunyuan. Tasks routinely run 3–10 minutes; queueing
  is shaped by upstream availability rather than your tier.
- **Midjourney** — `process_mode = relax` joins a shared low-priority queue.
  Wait times can stretch into minutes during peak. Concurrency cap still
  counts the relaxed task as in-flight.
- **Faceswap (video)** — counts as one slot but blocks it for several
  minutes per job. Plan capacity assuming throughput, not just concurrency.
- **LLM proxy** (`/v1/chat/completions`) — counted under RPM, not under
  task concurrency. Long streamed responses still count as one request.

## Detecting and reacting to 429

```json
HTTP/1.1 429 Too Many Requests
Retry-After: 12

{
  "code":    429,
  "data":    null,
  "message": "rate limit exceeded"
}
```

Recipe:

```python
import time, requests

def submit_with_backoff(url, headers, body, max_attempts=5):
    delay = 1.0
    for attempt in range(max_attempts):
        r = requests.post(url, headers=headers, json=body, timeout=60)
        if r.status_code != 429:
            r.raise_for_status()
            return r.json()
        retry_after = float(r.headers.get("Retry-After", delay))
        time.sleep(max(retry_after, delay))
        delay = min(delay * 2, 30)
    raise RuntimeError("rate-limited after retries")
```

The CLI does not auto-retry on 429 by design — surfaces the error so you
notice and tune your worker concurrency.

## Polling cadence

The task polling endpoint shares the RPM budget. The CLI defaults to a
2-second poll interval. For heavy fan-out workers:

- Image families (Flux, Gemini, Midjourney): 2–3s is fine.
- Video families (Kling, Luma, Hailuo, Veo 3, Hunyuan): 5–10s; switch to
  webhooks for tasks expected to run > 60 seconds.
- LLM streams: not applicable — sync endpoint, no polling.

## Concurrency planning

Quick ceiling check: `safe_qps ≈ concurrency / avg_task_seconds`.

| Family | Typical task time | Safe throughput at concurrency = 30 |
|---|---|---|
| Flux schnell (txt2img) | 3–6s | ~5–10 jobs/s |
| Midjourney imagine (fast) | 30–60s | ~0.5–1 jobs/s |
| Kling image2video std (5s) | 60–120s | ~0.25–0.5 jobs/s |
| Hunyuan img2video-lora | 180–600s | ~0.05–0.17 jobs/s |
| Suno generate_music | 30–90s | ~0.33–1 jobs/s |

Use these as ballpark. Real numbers vary with prompt complexity and vendor
queue depth.

## Account-level limits

- API keys — usually 1 active per account; rotate via dashboard.
- Webhook endpoints — no documented cap; one per task is the only practical
  limit.
- Storage — output URLs expire from PiAPI's CDN. Copy binaries you want to
  retain.

## See also

- [`rest-api.md`](./rest-api.md) — endpoint surface.
- [`errors.md`](./errors.md) — full status code interpretation.
- [`models.md`](./models.md) — per-family input shapes.
- [`webhooks.md`](./webhooks.md) — async delivery for long jobs.
- Pricing: https://piapi.ai/pricing
