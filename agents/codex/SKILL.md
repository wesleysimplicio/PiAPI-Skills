---
name: piapi
description: Image, video, music, 3D, audio, and LLM generation via PiAPI. Wraps the unified `POST /api/v1/task` envelope plus the OpenAI-compatible `POST /v1/chat/completions` LLM proxy.
---

# PiAPI (Codex)

PiAPI ships a single async-task surface that aggregates Midjourney, Flux,
Kling, Luma, Hailuo, Veo 3, Suno, Hunyuan, MMAudio, F5-TTS, Trellis, Gemini
Nano Banana, Seedance, and Faceswap. The CLI uses pure HTTP via `requests`;
there is no official PiAPI SDK.

## When to invoke

User asks Codex to:

- Generate or edit images, video, music, audio, or 3D meshes.
- Drive Midjourney programmatically (PiAPI is one of the supported relays).
- Submit faceswap jobs.
- Call an OpenAI-compatible LLM endpoint that PiAPI routes to.
- Verify or process a PiAPI webhook.

## Prereqs

```bash
export PIAPI_API_KEY="pk-..."
# optional, only when verifying webhooks:
export PIAPI_WEBHOOK_SECRET="..."

piapi-cli --help
```

The shim `piapi-cli` runs the bundled Python in `~/.local/share/piapi-skill/venv`.

## Generic subcommands

```bash
piapi-cli submit  --model <m> --task-type <t> --input '<json>' [--public|--private] \
                  [--webhook-url URL] [--webhook-secret SECRET]
piapi-cli result  <task_id>
piapi-cli wait    <task_id> --timeout 1800 --poll-interval 2
piapi-cli cancel  <task_id>            # only valid while status is pending
piapi-cli run     --model <m> --task-type <t> --input '<json>'   # submit + wait
```

## Shortcuts

```bash
piapi-cli imagine "prompt" --aspect-ratio 16:9 --process-mode fast --wait
piapi-cli flux    --prompt "..." --model Qubico/flux1-schnell --wait
piapi-cli kling   --image-url URL --prompt "..." --duration 5 --wait
piapi-cli suno    --prompt "lo-fi instrumental" --wait
piapi-cli faceswap --target-url T --swap-url F --wait
```

## LLM (sync, OpenAI-compatible)

```bash
piapi-cli llm --model gpt-4o-mini \
  --message 'system:You are concise.' \
  --message 'user:Summarize Stoicism in one sentence.'

piapi-cli llm --model claude-3-5-sonnet --stream --message 'user:Hi'
```

## Webhooks

```bash
# header echoed by PiAPI:  x-webhook-secret: <PIAPI_WEBHOOK_SECRET>
piapi-cli verify-webhook --header-secret "$RAW_HEADER" --expected "$PIAPI_WEBHOOK_SECRET"
```

PiAPI does not HMAC-sign webhooks — verification is a constant-time string
compare against the secret you registered. Retries fire every 5s up to 3
attempts on non-2xx response.

## REST primitives

```
POST   /api/v1/task                  → submit
GET    /api/v1/task/{task_id}        → poll
DELETE /api/v1/task/{task_id}        → cancel (pending only)
POST   /v1/chat/completions          → LLM (OpenAI-compatible, supports stream)
```

Auth header is **lowercase** `x-api-key: <PIAPI_API_KEY>`.

## Status enum drift

Always lowercase the `status` field before comparing — different families return
different casing.

- Capitalized: `Pending | Processing | Staged | Completed | Failed`
- Lowercase:   `pending | starting | processing | success | failed | retry`

Terminal-success set: `completed`, `complete`, `success`, `succeeded`.
Terminal-failure set: `failed`, `failure`, `error`, `canceled`, `cancelled`,
`rejected`.

## Frequently-used model · task_type

| Family | model | task_type |
|---|---|---|
| Midjourney | `midjourney` | `imagine`, `upscale`, `variation`, `inpaint`, `describe`, `blend` |
| Flux | `Qubico/flux1-schnell` / `Qubico/flux1-dev` | `txt2img`, `img2img`, `inpaint`, `controlnet-lora` |
| Kling | `kling` | `text2video`, `image2video`, `extend`, `lipsync`, `effects` |
| Luma | `luma` | `text2video`, `image2video`, `extend` |
| Hailuo | `hailuo` | `text2video`, `image2video`, `subject2video` |
| Veo 3 | `veo3` | `txt2vid`, `img2vid` |
| Suno | `music-u` | `generate_music`, `generate_music_custom`, `extend`, `concat` |
| Hunyuan | `Qubico/hunyuan` | `txt2video-lora`, `img2video-lora` |
| MMAudio | `Qubico/mmaudio` | `video2audio` |
| Faceswap | `Qubico/image-toolkit` / `Qubico/video-toolkit` | `face-swap`, `multi-face-swap` |
| Trellis 3D | `Qubico/trellis` | `image-to-3d` |
| F5-TTS | `Qubico/f5-tts` | `txt2speech` |
| Gemini Image | `gemini` | `nano-banana-text-to-image`, `nano-banana-edit` |
| Seedance | `seedance` | `text-to-video`, `image-to-video` |

## Errors

`400` bad input · `401` bad/missing key · `402` out of credit · `429`
concurrency cap · `5xx` upstream model error (retry with backoff).

## References

- https://piapi.ai/docs/overview
- https://piapi.ai/docs/llm-api
- https://piapi.ai/docs/mcp-server
- https://piapi.ai/pricing
