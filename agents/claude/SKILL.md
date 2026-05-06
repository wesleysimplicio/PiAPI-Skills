---
name: piapi
description: |
  Use this skill when the user asks for image, video, music, 3D, audio, or LLM
  generation backed by the PiAPI inference platform (https://piapi.ai). Covers
  Midjourney, Suno, Kling, Luma, Hailuo, Flux, Hunyuan, Faceswap, Trellis,
  MMAudio, F5-TTS, Veo 3, Gemini 2.5 Flash Image, and Seedance via a single
  unified `POST /api/v1/task` envelope. The CLI also wraps the OpenAI-
  compatible `POST /v1/chat/completions` LLM surface.
allowed-tools:
  - Bash(piapi-cli *)
  - Bash(~/.local/bin/piapi-cli *)
  - Bash(~/.local/share/piapi-skill/venv/bin/python *)
---

# PiAPI

PiAPI is a unified async-task gateway for many third-party generative models.
Every media request goes through one envelope:

```
POST /api/v1/task
{
  "model": "<vendor-or-family>",
  "task_type": "<task>",
  "input": { ... },
  "config": { "service_mode": "public", "webhook_config": { ... } }
}
```

Polling and result fetching are uniform via `GET /api/v1/task/{task_id}`. The
LLM API at `POST /v1/chat/completions` is the only synchronous surface and is
OpenAI-compatible (including streaming).

## When to use

- Generate images (Midjourney, Flux, Gemini Nano Banana).
- Generate video (Kling, Luma, Hailuo, Veo 3, Seedance, Hunyuan).
- Generate music (Suno, Udio via `music-u`, MMAudio for sfx).
- TTS / voice (F5-TTS).
- 3D assets (Trellis).
- Faceswap (`Qubico/image-toolkit`, `Qubico/video-toolkit`).
- LLM chat completions (any model exposed under PiAPI's OpenAI proxy).
- Webhook handlers that consume PiAPI callbacks.

## When NOT to use

- The user wants direct vendor access (use the vendor's own API/SDK).
- The user wants WaveSpeedAI, Replicate, or fal.ai — different platforms.
- The user only needs ChatGPT/Claude prompt completion with no media generation
  and you already have a direct API for that LLM.

## Prereqs

```bash
export PIAPI_API_KEY="pk-..."     # required, sent as x-api-key header
export PIAPI_WEBHOOK_SECRET="..." # only when verifying inbound webhooks
```

The shim `piapi-cli` runs the bundled Python in its own venv at
`~/.local/share/piapi-skill/venv`. Do not pip-install `piapi` — there is no
official SDK; the CLI uses pure `requests`.

## Quick reference

### Image — Midjourney imagine

```bash
piapi-cli imagine \
  "ultrarealistic mediterranean coast, sunset" \
  --aspect-ratio 16:9 --process-mode fast --wait
```

### Image — Flux text-to-image

```bash
piapi-cli flux \
  --prompt "neon-lit cyberpunk alley, rain reflections" \
  --model Qubico/flux1-schnell --width 1024 --height 1024 --wait
```

### Video — Kling image-to-video

```bash
piapi-cli kling \
  --image-url https://example.com/in.jpg \
  --prompt "camera dolly forward, soft cinematic" \
  --duration 5 --aspect-ratio 16:9 --wait
```

### Music — Suno

```bash
piapi-cli suno \
  --prompt "warm lo-fi hip hop, vinyl crackle, mellow" \
  --custom-mode false --make-instrumental false --wait
```

### Faceswap — single image

```bash
piapi-cli faceswap \
  --target-url https://example.com/target.jpg \
  --swap-url   https://example.com/face.jpg \
  --wait
```

### Generic submit / wait / cancel

```bash
piapi-cli submit --model midjourney --task-type imagine \
  --input '{"prompt":"a samurai cat","aspect_ratio":"3:2","process_mode":"fast"}' \
  --webhook-url https://yourapp/api/piapi --webhook-secret "$PIAPI_WEBHOOK_SECRET"

piapi-cli result <task_id>
piapi-cli wait   <task_id> --timeout 1800 --poll-interval 2
piapi-cli cancel <task_id>     # only valid while status is pending
```

### One-shot run (submit + wait)

```bash
piapi-cli run --model Qubico/flux1-schnell --task-type txt2img \
  --input '{"prompt":"misty forest","width":1024,"height":1024}'
```

### LLM chat completion

```bash
piapi-cli llm --model gpt-4o-mini \
  --message 'system:You are concise.' \
  --message 'user:Summarize Stoicism in one sentence.'

piapi-cli llm --model claude-3-5-sonnet --stream --message 'user:Hi'
```

### Verify a webhook

```bash
piapi-cli verify-webhook \
  --header-secret "$X_WEBHOOK_SECRET_FROM_REQUEST" \
  --expected      "$PIAPI_WEBHOOK_SECRET"
```

## REST primitives

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/task` | Submit any media job. Returns `task_id`. |
| `GET`  | `/api/v1/task/{task_id}` | Poll status + fetch output URLs. |
| `DELETE` | `/api/v1/task/{task_id}` | Cancel — only if status is `pending`. |
| `POST` | `/v1/chat/completions` | OpenAI-compatible LLM (sync, supports SSE). |

Auth header (lowercase canonical):

```
x-api-key: <PIAPI_API_KEY>
```

## Status enum drift (important)

Different model families return different status casing. The CLI normalizes
every status to lowercase before comparing:

- Capitalized family (Midjourney, Kling, Faceswap):
  `Pending | Processing | Staged | Completed | Failed`
- Lowercase family (Flux, Veo 3, Gemini, Suno):
  `pending | starting | processing | success | failed | retry`

Treat as terminal-success: `completed | complete | success | succeeded`.
Treat as terminal-failure: `failed | failure | error | canceled | cancelled |
rejected`. Anything else = still running, keep polling.

## Service modes

- `public` — Pay-Per-Use (PPU). Default. Concurrency capped per pricing tier.
- `private` — Host-Your-Account (HYA). Required for Midjourney private mode
  (Discord token + channel ID + guild ID). Higher upfront commit, no
  per-image PPU charge after the seat fee.

Set via `--public` / `--private` on `submit` and `run`, or include
`{"config":{"service_mode":"private"}}` in raw payloads.

## Frequently-used model · task_type

| Family | model | task_type |
|---|---|---|
| Midjourney | `midjourney` | `imagine`, `upscale`, `variation`, `inpaint`, `describe`, `blend` |
| Flux | `Qubico/flux1-schnell`, `Qubico/flux1-dev`, `Qubico/flux1-dev-advanced` | `txt2img`, `img2img`, `inpaint`, `controlnet-lora`, `redux-variation` |
| Kling | `kling` | `text2video`, `image2video`, `extend`, `lipsync`, `effects` |
| Luma | `luma` | `text2video`, `image2video`, `extend` |
| Hailuo | `hailuo` | `text2video`, `image2video`, `subject2video` |
| Veo 3 | `veo3` | `txt2vid`, `img2vid` |
| Suno | `music-u` | `generate_music`, `generate_music_custom`, `extend`, `concat`, `add_lyrics` |
| MMAudio | `Qubico/mmaudio` | `video2audio` |
| Hunyuan | `Qubico/hunyuan` | `txt2video-lora`, `img2video-lora` |
| Faceswap | `Qubico/image-toolkit`, `Qubico/video-toolkit` | `face-swap`, `multi-face-swap` |
| Trellis | `Qubico/trellis` | `image-to-3d` |
| F5-TTS | `Qubico/f5-tts` | `txt2speech` |
| Gemini Image | `gemini` | `nano-banana-text-to-image`, `nano-banana-edit` |
| Seedance | `seedance` | `text-to-video`, `image-to-video` |

## Latency knobs

- Midjourney: `process_mode = fast | turbo | relax`. `fast` is the default
  rate; `turbo` costs more but is roughly half the wait; `relax` is cheapest
  but can sit minutes in queue.
- Flux: `flux1-schnell` ≈ 4 steps, fastest; `flux1-dev` ≈ 28 steps, higher
  quality.
- Kling: `mode = std | pro` and `duration = 5 | 10` seconds.
- Suno: `custom_mode = true` lets you pin lyrics + style; otherwise PiAPI
  fills both.

## Error surface

- `400` — bad input shape. Check `model` + `task_type` combo first; many
  failures are wrong `task_type` for the family.
- `401` — missing or invalid `x-api-key`.
- `402` — out of credits or no active plan.
- `429` — concurrency cap or RPM cap exceeded for the tier.
- `500` / `502` — upstream model error. Retry with backoff; PiAPI returns
  `retry` status for transient cases.

## Tier rate limits (snapshot, verify in pricing page)

| Tier | Concurrency | Notes |
|---|---|---|
| Free | 1 | Limited credits, no Hunyuan. |
| Creator | 5 | Most families. |
| Pro | 30 | All families, higher RPM. |
| Enterprise | 90+ | Custom; Hunyuan has no per-tier cap. |

## References

- Overview & quickstart: https://piapi.ai/docs/overview
- Per-model docs: https://piapi.ai/docs/{midjourney,kling,suno,flux,faceswap,...}
- LLM API: https://piapi.ai/docs/llm-api
- MCP server: https://piapi.ai/docs/mcp-server
- Pricing: https://piapi.ai/pricing
