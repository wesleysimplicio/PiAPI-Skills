---
name: piapi
description: PiAPI inference gateway. One async-task envelope plus an OpenAI-compatible LLM proxy. Aggregates Midjourney, Flux, Kling, Luma, Hailuo, Veo 3, Suno, Hunyuan, MMAudio, F5-TTS, Trellis, Gemini Nano Banana, Seedance, and Faceswap.
---

# PiAPI (Windsurf)

```
POST /api/v1/task          → submit
GET  /api/v1/task/{id}     → poll
DELETE /api/v1/task/{id}   → cancel (only while pending)
POST /v1/chat/completions  → LLM (OpenAI-compatible, supports SSE)
```

Auth: `x-api-key: <PIAPI_API_KEY>` (lowercase header).

## Setup

```bash
export PIAPI_API_KEY="pk-..."
export PIAPI_WEBHOOK_SECRET="..."    # optional, webhook verify only
piapi-cli --help
```

No official PiAPI SDK exists. The CLI uses `requests`.

## Cheatsheet

```bash
piapi-cli submit  --model <m> --task-type <t> --input '<json>'
piapi-cli result  <task_id>
piapi-cli wait    <task_id> --timeout 1800 --poll-interval 2
piapi-cli cancel  <task_id>
piapi-cli run     --model <m> --task-type <t> --input '<json>'

piapi-cli imagine "prompt" --aspect-ratio 16:9 --process-mode fast --wait
piapi-cli flux    --prompt "..." --model Qubico/flux1-schnell --wait
piapi-cli kling   --image-url URL --prompt "..." --duration 5 --wait
piapi-cli suno    --prompt "lofi instrumental" --wait
piapi-cli faceswap --target-url T --swap-url F --wait

piapi-cli llm --model gpt-4o-mini \
  --message 'system:You are concise.' --message 'user:Hello.'

piapi-cli verify-webhook --header-secret "$RAW_HEADER" --expected "$PIAPI_WEBHOOK_SECRET"
```

## Status enum drift

Lowercase before comparing. Terminal-success: `completed | complete | success
| succeeded`. Terminal-failure: `failed | failure | error | canceled |
cancelled | rejected`.

Capitalized family (Midjourney, Kling, Faceswap):
`Pending | Processing | Staged | Completed | Failed`.
Lowercase family (Flux, Veo 3, Gemini, Suno):
`pending | starting | processing | success | failed | retry`.

## Common model · task_type

| Family | model | task_type |
|---|---|---|
| Midjourney | `midjourney` | `imagine`, `upscale`, `variation`, `inpaint` |
| Flux | `Qubico/flux1-schnell` / `Qubico/flux1-dev` | `txt2img`, `img2img`, `inpaint`, `controlnet-lora` |
| Kling | `kling` | `text2video`, `image2video`, `extend` |
| Luma | `luma` | `text2video`, `image2video`, `extend` |
| Hailuo | `hailuo` | `text2video`, `image2video`, `subject2video` |
| Veo 3 | `veo3` | `txt2vid`, `img2vid` |
| Seedance | `seedance` | `text-to-video`, `image-to-video` |
| Suno | `music-u` | `generate_music`, `generate_music_custom`, `extend` |
| Hunyuan | `Qubico/hunyuan` | `txt2video-lora`, `img2video-lora` |
| MMAudio | `Qubico/mmaudio` | `video2audio` |
| Faceswap | `Qubico/image-toolkit` / `Qubico/video-toolkit` | `face-swap`, `multi-face-swap` |
| Trellis | `Qubico/trellis` | `image-to-3d` |
| F5-TTS | `Qubico/f5-tts` | `txt2speech` |
| Gemini Image | `gemini` | `nano-banana-text-to-image`, `nano-banana-edit` |

## Refs

- https://piapi.ai/docs/overview
- https://piapi.ai/docs/llm-api
- https://piapi.ai/pricing
