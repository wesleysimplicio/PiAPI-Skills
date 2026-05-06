---
name: piapi
version: 1.0.0
author: Wesley Simplicio
license: MIT
description: PiAPI inference gateway. One unified `POST /api/v1/task` envelope for Midjourney, Flux, Kling, Luma, Hailuo, Veo 3, Suno, Hunyuan, MMAudio, F5-TTS, Trellis, Gemini Nano Banana, Seedance, and Faceswap. Plus an OpenAI-compatible `POST /v1/chat/completions` LLM proxy.
tags:
  - piapi
  - inference
  - midjourney
  - suno
  - kling
  - luma
  - hailuo
  - flux
  - veo3
  - gemini
  - seedance
  - hunyuan
  - faceswap
  - trellis
  - mmaudio
  - f5-tts
  - llm
---

# PiAPI (OpenClaw)

PiAPI exposes one async-task envelope that aggregates many vendor models.
There is no official SDK; the CLI wraps pure HTTP (`requests`).

## Setup

```bash
export PIAPI_API_KEY="pk-..."
export PIAPI_WEBHOOK_SECRET="..."   # optional, for webhook verification
piapi-cli --help
```

## CLI

```bash
# Generic
piapi-cli submit  --model <m> --task-type <t> --input '<json>'
piapi-cli result  <task_id>
piapi-cli wait    <task_id> --timeout 1800 --poll-interval 2
piapi-cli cancel  <task_id>             # only valid while pending
piapi-cli run     --model <m> --task-type <t> --input '<json>'   # submit + wait

# Shortcuts
piapi-cli imagine "prompt" --aspect-ratio 16:9 --process-mode fast --wait
piapi-cli flux    --prompt "..." --model Qubico/flux1-schnell --wait
piapi-cli kling   --image-url URL --prompt "..." --duration 5 --wait
piapi-cli suno    --prompt "lofi instrumental" --wait
piapi-cli faceswap --target-url T --swap-url F --wait

# LLM (OpenAI-compatible, sync, supports SSE)
piapi-cli llm --model gpt-4o-mini \
  --message 'system:You are concise.' --message 'user:Hello.'

# Webhook verify (no HMAC — string compare)
piapi-cli verify-webhook --header-secret "$RAW_HEADER" --expected "$PIAPI_WEBHOOK_SECRET"
```

## REST primitives

```
POST   /api/v1/task                  → submit
GET    /api/v1/task/{task_id}        → poll
DELETE /api/v1/task/{task_id}        → cancel (pending only)
POST   /v1/chat/completions          → LLM
```

Auth: `x-api-key: <PIAPI_API_KEY>` (lowercase header name).

## Status enum drift

Always lowercase the `status` field before comparing.

- Capitalized family: `Pending | Processing | Staged | Completed | Failed`
- Lowercase family:   `pending | starting | processing | success | failed | retry`

Terminal success: `completed`, `complete`, `success`, `succeeded`.
Terminal failure: `failed`, `failure`, `error`, `canceled`, `cancelled`,
`rejected`.

## Common model · task_type

| Family | model | task_type |
|---|---|---|
| Midjourney | `midjourney` | `imagine`, `upscale`, `variation`, `inpaint`, `blend`, `describe` |
| Flux | `Qubico/flux1-schnell` / `Qubico/flux1-dev` | `txt2img`, `img2img`, `inpaint`, `controlnet-lora` |
| Kling | `kling` | `text2video`, `image2video`, `extend`, `lipsync`, `effects` |
| Luma | `luma` | `text2video`, `image2video`, `extend` |
| Hailuo | `hailuo` | `text2video`, `image2video`, `subject2video` |
| Veo 3 | `veo3` | `txt2vid`, `img2vid` |
| Seedance | `seedance` | `text-to-video`, `image-to-video` |
| Suno | `music-u` | `generate_music`, `generate_music_custom`, `extend`, `concat` |
| Hunyuan | `Qubico/hunyuan` | `txt2video-lora`, `img2video-lora` |
| MMAudio | `Qubico/mmaudio` | `video2audio` |
| Faceswap | `Qubico/image-toolkit` / `Qubico/video-toolkit` | `face-swap`, `multi-face-swap` |
| Trellis | `Qubico/trellis` | `image-to-3d` |
| F5-TTS | `Qubico/f5-tts` | `txt2speech` |
| Gemini Image | `gemini` | `nano-banana-text-to-image`, `nano-banana-edit` |

## Errors

- `400` bad input shape (most often: wrong `task_type` for the family).
- `401` missing / invalid `x-api-key`.
- `402` out of credits.
- `429` concurrency cap or RPM cap exceeded.
- `5xx` upstream model error — back off; PiAPI may set status `retry`.

## Refs

- https://piapi.ai/docs/overview
- https://piapi.ai/docs/llm-api
- https://piapi.ai/docs/mcp-server
- https://piapi.ai/pricing
