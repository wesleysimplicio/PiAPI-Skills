---
name: piapi
description: |
  Portable, agent-agnostic spec for the PiAPI inference gateway. Single
  async-task envelope at `POST /api/v1/task` aggregates Midjourney, Flux,
  Kling, Luma, Hailuo, Veo 3, Suno, Hunyuan, MMAudio, F5-TTS, Trellis, Gemini
  Nano Banana, Seedance, and Faceswap. `POST /v1/chat/completions` is an
  OpenAI-compatible LLM proxy. Auth header is `x-api-key`.
---

# PiAPI (generic)

This SKILL.md is portable: any agent shell that copies SKILL.md into a
known location and exposes a shell can use it. It assumes only `piapi-cli`
on `$PATH` and the `PIAPI_API_KEY` env var.

## Surface

```
POST   /api/v1/task                  → submit { model, task_type, input, config? }
GET    /api/v1/task/{task_id}        → poll
DELETE /api/v1/task/{task_id}        → cancel (only while pending)
POST   /v1/chat/completions          → LLM (OpenAI-compatible, supports SSE)
```

Auth header is **lowercase** `x-api-key: <PIAPI_API_KEY>`.

There is no official PiAPI SDK. The CLI uses pure HTTP via `requests`.

## CLI

```bash
piapi-cli --help

# generic
piapi-cli submit   --model <m> --task-type <t> --input '<json>' [--public|--private] \
                   [--webhook-url URL] [--webhook-secret SECRET]
piapi-cli result   <task_id>
piapi-cli wait     <task_id> --timeout 1800 --poll-interval 2
piapi-cli cancel   <task_id>
piapi-cli run      --model <m> --task-type <t> --input '<json>'   # submit + wait

# shortcuts
piapi-cli imagine  "prompt" --aspect-ratio 16:9 --process-mode fast --wait
piapi-cli flux     --prompt "..." --model Qubico/flux1-schnell --wait
piapi-cli kling    --image-url URL --prompt "..." --duration 5 --wait
piapi-cli suno     --prompt "lofi instrumental" --wait
piapi-cli faceswap --target-url T --swap-url F --wait

# LLM
piapi-cli llm --model gpt-4o-mini \
  --message 'system:You are concise.' --message 'user:Summarize Stoicism.'

# webhook verify (no HMAC — secret echoed in `x-webhook-secret`)
piapi-cli verify-webhook --header-secret "$RAW_HEADER" --expected "$PIAPI_WEBHOOK_SECRET"
```

## Examples

### Image — Flux schnell (fast)

```bash
piapi-cli flux --prompt "neon-lit cyberpunk alley, rain reflections" \
  --model Qubico/flux1-schnell --width 1024 --height 1024 --wait
```

### Image — Midjourney imagine

```bash
piapi-cli imagine "ultrarealistic mediterranean coast, sunset" \
  --aspect-ratio 16:9 --process-mode fast --wait
```

### Video — Kling image-to-video

```bash
piapi-cli kling --image-url https://example.com/in.jpg \
  --prompt "camera dolly forward, soft cinematic" \
  --duration 5 --aspect-ratio 16:9 --wait
```

### Music — Suno

```bash
piapi-cli suno --prompt "warm lo-fi hip hop, vinyl crackle, mellow" \
  --custom-mode false --make-instrumental false --wait
```

### 3D — Trellis (image-to-mesh)

```bash
piapi-cli run --model Qubico/trellis --task-type image-to-3d \
  --input '{"image_url":"https://example.com/object.png"}'
```

### TTS — F5-TTS

```bash
piapi-cli run --model Qubico/f5-tts --task-type txt2speech \
  --input '{"text":"Welcome to the demo.","voice_url":"https://.../voice.wav"}'
```

### LLM — chat completion

```bash
piapi-cli llm --model gpt-4o-mini \
  --message 'system:You are concise.' \
  --message 'user:Summarize Stoicism in one sentence.'
```

## Status enum drift

Lowercase the `status` field before comparing.

- Capitalized family: `Pending | Processing | Staged | Completed | Failed`
- Lowercase family:   `pending | starting | processing | success | failed | retry`

Terminal-success: `completed`, `complete`, `success`, `succeeded`.
Terminal-failure: `failed`, `failure`, `error`, `canceled`, `cancelled`,
`rejected`.

## Errors

`400` bad input · `401` bad/missing key · `402` out of credit · `429`
concurrency cap · `5xx` upstream model error.

## Refs

- https://piapi.ai/docs/overview
- https://piapi.ai/docs/llm-api
- https://piapi.ai/docs/mcp-server
- https://piapi.ai/pricing
