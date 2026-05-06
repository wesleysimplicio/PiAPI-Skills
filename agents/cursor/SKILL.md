---
name: piapi
description: PiAPI inference gateway — image, video, music, 3D, audio, and LLM generation through one async-task envelope and an OpenAI-compatible LLM proxy.
---

# PiAPI (Cursor)

Single envelope:

```
POST /api/v1/task    { model, task_type, input, config? }
GET  /api/v1/task/{task_id}
DELETE /api/v1/task/{task_id}     # only while status is pending
POST /v1/chat/completions          # OpenAI-compatible LLM
```

Auth header (lowercase): `x-api-key: <PIAPI_API_KEY>`.

## When to invoke

User asks for media generation (Midjourney, Suno, Kling, Luma, Hailuo, Flux,
Veo 3, Gemini Nano Banana, Seedance, Hunyuan, MMAudio, F5-TTS, Trellis,
Faceswap), or for an OpenAI-compatible LLM call routed through PiAPI, or for
PiAPI webhook verification.

## Setup

```bash
export PIAPI_API_KEY="pk-..."
export PIAPI_WEBHOOK_SECRET="..."   # optional
piapi-cli --help
```

There is no official PiAPI SDK. The CLI uses pure HTTP via `requests`.

## Cheatsheet

```bash
# Generic
piapi-cli submit  --model <m> --task-type <t> --input '<json>'
piapi-cli result  <task_id>
piapi-cli wait    <task_id> --timeout 1800 --poll-interval 2
piapi-cli cancel  <task_id>
piapi-cli run     --model <m> --task-type <t> --input '<json>'

# Shortcuts
piapi-cli imagine "prompt" --aspect-ratio 16:9 --process-mode fast --wait
piapi-cli flux    --prompt "..." --model Qubico/flux1-schnell --wait
piapi-cli kling   --image-url URL --prompt "..." --duration 5 --wait
piapi-cli suno    --prompt "lofi instrumental" --wait
piapi-cli faceswap --target-url T --swap-url F --wait

# LLM
piapi-cli llm --model gpt-4o-mini \
  --message 'system:You are concise.' --message 'user:Hello.'

# Webhook verify (no HMAC — string compare against echoed secret)
piapi-cli verify-webhook --header-secret "$RAW_HEADER" --expected "$PIAPI_WEBHOOK_SECRET"
```

## Status enum drift

Lowercase the `status` field before comparing.

Terminal-success: `completed`, `complete`, `success`, `succeeded`.
Terminal-failure: `failed`, `failure`, `error`, `canceled`, `cancelled`,
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

## Refs

- https://piapi.ai/docs/overview
- https://piapi.ai/docs/llm-api
- https://piapi.ai/pricing
