# 02 · Midjourney imagine + upscale

Midjourney on PiAPI is a two-step flow: `imagine` returns a 4-up grid (status
goes through `Pending → Processing → Staged → Completed`), then you call
`upscale` against one of the four positions to get a high-res frame.

## Step 1 — imagine

```bash
piapi-cli imagine \
  "ultrarealistic mediterranean coast, sunset, anamorphic lens" \
  --aspect-ratio 16:9 \
  --process-mode fast \
  --wait
```

The CLI returns the parent task envelope. From the response, capture
`task_id` (used for the upscale call) and the four image URLs in
`data.output.image_urls`.

## Step 2 — upscale a quadrant

```bash
piapi-cli submit --model midjourney --task-type upscale \
  --input '{
    "origin_task_id": "<task_id from step 1>",
    "index": "1"
  }'
```

Index 1–4 maps to the top-left, top-right, bottom-left, bottom-right tile.

## Variation

```bash
piapi-cli submit --model midjourney --task-type variation \
  --input '{
    "origin_task_id": "<task_id from step 1>",
    "index": "2"
  }'
```

## Process modes

| process_mode | Latency | Cost factor | Notes |
|---|---|---|---|
| `fast`  | ≈ 30–60s  | 1.0× | Default. |
| `turbo` | ≈ 15–30s  | 2.0× | Best for tight loops, costs 2× fast. |
| `relax` | minutes   | 0.5× | Cheapest, queues during peak. |

## Status nuance

Midjourney returns capitalized status enums:

- `Pending` → still queueing.
- `Processing` → render running.
- `Staged` → grid ready, agent should follow up with `upscale`/`variation`.
- `Completed` → final frame for this `task_id`.
- `Failed` → grid failed entirely.

## Service modes

Default is `public` (PPU). For private mode (HYA) add a Discord token, channel
ID, and guild ID via `config.service_mode = "private"` and the corresponding
`config` keys. See `references/models.md` for the private-mode payload shape.
