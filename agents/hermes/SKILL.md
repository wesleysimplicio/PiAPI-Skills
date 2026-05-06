---
name: piapi
version: 1.0.0
author: Wesley Simplicio
license: MIT
platforms:
  - macos
  - linux
description: |
  Generate images, video, music, 3D, audio, and chat completions through
  PiAPI's unified async-task gateway. Aggregates Midjourney, Flux, Kling,
  Luma, Hailuo, Veo 3, Suno, Hunyuan, MMAudio, F5-TTS, Trellis, Gemini Nano
  Banana, Seedance, and Faceswap behind a single `POST /api/v1/task` envelope,
  plus an OpenAI-compatible `POST /v1/chat/completions` LLM proxy.
metadata:
  hermes:
    tags:
      - creative
      - generation
      - image
      - video
      - music
      - 3d
      - tts
      - llm
      - midjourney
      - flux
      - kling
      - suno
      - faceswap
      - veo3
      - gemini
      - seedance
      - hunyuan
    related_skills:
      - wavespeed
      - comfyui
      - creative-campaign-media-studio
prerequisites:
  commands:
    - piapi-cli
  env:
    - PIAPI_API_KEY
---

# PiAPI (Hermes — Creative)

PiAPI is a single-gateway inference platform: every media job is a task on
`POST /api/v1/task`, polled via `GET /api/v1/task/{task_id}`. The LLM API at
`POST /v1/chat/completions` is OpenAI-compatible and synchronous (with
optional SSE streaming).

## Prerequisites

```bash
export PIAPI_API_KEY="pk-..."
export PIAPI_WEBHOOK_SECRET="..."   # optional, webhook verification only
piapi-cli --help
```

There is no official PiAPI SDK — the CLI uses pure `requests`. The shim
`piapi-cli` runs the bundled Python from `~/.local/share/piapi-skill/venv`.

## When to use

- A user prompt mentions Midjourney, Suno, Kling, Luma, Hailuo, Flux, Veo 3,
  Gemini Nano Banana, Seedance, Hunyuan, MMAudio, F5-TTS, Trellis, or Faceswap.
- The pipeline needs a vendor-agnostic media generator and PiAPI is the
  configured backend.
- Webhook callbacks from PiAPI need to be verified.
- An LLM call must go through PiAPI's OpenAI-compatible proxy.

## When NOT to use

- The user already specified a competing platform (WaveSpeedAI, fal.ai,
  Replicate, Runway) — use that one instead.
- The job is a direct vendor SDK call (e.g., the user explicitly wants the
  official Suno API rather than PiAPI's wrapper).
- The flow is a creative-campaign chain that should stay in
  `creative-campaign-media-studio`; only invoke `piapi` for the leaf step
  that calls a model.

## Quick reference

```bash
# Image — Midjourney
piapi-cli imagine "ultrarealistic mediterranean coast" --aspect-ratio 16:9 --process-mode fast --wait

# Image — Flux text-to-image
piapi-cli flux --prompt "cyberpunk alley at night" --model Qubico/flux1-schnell --wait

# Image — Gemini Nano Banana
piapi-cli submit --model gemini --task-type nano-banana-text-to-image \
  --input '{"prompt":"a calico cat in a cafe"}' --webhook-url ...

# Video — Kling
piapi-cli kling --image-url URL --prompt "slow dolly forward, cinematic" --duration 5 --wait

# Video — Veo 3
piapi-cli run --model veo3 --task-type txt2vid \
  --input '{"prompt":"a hummingbird in slow motion","aspect_ratio":"16:9","duration":8}'

# Video — Hunyuan with LoRA
piapi-cli run --model Qubico/hunyuan --task-type txt2video-lora \
  --input '{"prompt":"...","lora_url":"https://.../lora.safetensors"}'

# Music — Suno
piapi-cli suno --prompt "warm lo-fi instrumental, vinyl crackle" --wait

# Audio — F5-TTS
piapi-cli run --model Qubico/f5-tts --task-type txt2speech \
  --input '{"text":"Welcome to the demo.","voice_url":"https://.../voice.wav"}'

# 3D — Trellis (image to mesh)
piapi-cli run --model Qubico/trellis --task-type image-to-3d \
  --input '{"image_url":"https://.../object.png"}'

# Faceswap
piapi-cli faceswap --target-url T --swap-url F --wait

# Generic submit / wait / cancel / fetch
piapi-cli submit  --model <m> --task-type <t> --input '<json>' [--public|--private]
piapi-cli result  <task_id>
piapi-cli wait    <task_id> --timeout 1800 --poll-interval 2
piapi-cli cancel  <task_id>     # only valid while status is pending
piapi-cli run     --model <m> --task-type <t> --input '<json>'   # submit + wait

# LLM (OpenAI-compatible)
piapi-cli llm --model gpt-4o-mini \
  --message 'system:You are concise.' --message 'user:Hello.'

# Webhook verify (no HMAC — string compare)
piapi-cli verify-webhook --header-secret "$RAW_HEADER" --expected "$PIAPI_WEBHOOK_SECRET"
```

## Python (no SDK — uses `requests`)

```python
import os, requests, time

API = "https://api.piapi.ai"
H = {"x-api-key": os.environ["PIAPI_API_KEY"], "Content-Type": "application/json"}

def submit(model: str, task_type: str, payload: dict, *, mode="public", webhook=None):
    body = {"model": model, "task_type": task_type, "input": payload, "config": {"service_mode": mode}}
    if webhook:
        body["config"]["webhook_config"] = {"endpoint": webhook["url"], "secret": webhook["secret"]}
    r = requests.post(f"{API}/api/v1/task", json=body, headers=H, timeout=60)
    r.raise_for_status()
    return r.json()["data"]["task_id"]

def wait(task_id: str, timeout=1800, poll=2):
    deadline = time.time() + timeout
    while time.time() < deadline:
        r = requests.get(f"{API}/api/v1/task/{task_id}", headers=H, timeout=30)
        r.raise_for_status()
        data = r.json()["data"]
        status = (data.get("status") or "").lower()
        if status in {"completed", "complete", "success", "succeeded"}:
            return data
        if status in {"failed", "failure", "error", "canceled", "cancelled", "rejected"}:
            raise RuntimeError(f"task {task_id} failed: {data.get('error') or data}")
        time.sleep(poll)
    raise TimeoutError(task_id)
```

## REST primitives

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/task` | Submit any media job. Returns `task_id`. |
| `GET`  | `/api/v1/task/{task_id}` | Poll status + fetch output URLs. |
| `DELETE` | `/api/v1/task/{task_id}` | Cancel — only if status is `pending`. |
| `POST` | `/v1/chat/completions` | OpenAI-compatible LLM. Sync; supports SSE. |

Auth header (lowercase canonical): `x-api-key: <PIAPI_API_KEY>`.

## Status enum drift

PiAPI returns both capitalized and lowercase enums depending on the model
family. Always lowercase before comparing.

- Midjourney / Kling / Faceswap: `Pending | Processing | Staged | Completed | Failed`
- Flux / Veo 3 / Gemini / Suno: `pending | starting | processing | success | failed | retry`

Terminal-success: `completed`, `complete`, `success`, `succeeded`.
Terminal-failure: `failed`, `failure`, `error`, `canceled`, `cancelled`,
`rejected`. Anything else means keep polling.

## Service modes

- `public` — Pay-Per-Use (PPU). Default. Concurrency capped per pricing tier.
- `private` — Host-Your-Account (HYA). Required for Midjourney private mode
  (Discord token + channel ID + guild ID). Higher upfront commit, no per-image
  PPU charge after the seat fee.

## Frequently-used model · task_type

| Family | model | task_type |
|---|---|---|
| Midjourney | `midjourney` | `imagine`, `upscale`, `variation`, `inpaint`, `describe`, `blend` |
| Flux | `Qubico/flux1-schnell` / `Qubico/flux1-dev` / `Qubico/flux1-dev-advanced` | `txt2img`, `img2img`, `inpaint`, `controlnet-lora`, `redux-variation` |
| Kling | `kling` | `text2video`, `image2video`, `extend`, `lipsync`, `effects` |
| Luma | `luma` | `text2video`, `image2video`, `extend` |
| Hailuo | `hailuo` | `text2video`, `image2video`, `subject2video` |
| Veo 3 | `veo3` | `txt2vid`, `img2vid` |
| Seedance | `seedance` | `text-to-video`, `image-to-video` |
| Suno | `music-u` | `generate_music`, `generate_music_custom`, `extend`, `concat`, `add_lyrics` |
| Hunyuan | `Qubico/hunyuan` | `txt2video-lora`, `img2video-lora` |
| MMAudio | `Qubico/mmaudio` | `video2audio` |
| Faceswap | `Qubico/image-toolkit` / `Qubico/video-toolkit` | `face-swap`, `multi-face-swap` |
| Trellis | `Qubico/trellis` | `image-to-3d` |
| F5-TTS | `Qubico/f5-tts` | `txt2speech` |
| Gemini Image | `gemini` | `nano-banana-text-to-image`, `nano-banana-edit` |

## Latency knobs

- Midjourney `process_mode`: `fast` (default), `turbo` (~half wait, costs more),
  `relax` (cheapest, queues for minutes).
- Flux: `flux1-schnell` is the speed model (~4 steps); `flux1-dev` is the
  quality model (~28 steps).
- Kling: `mode = std | pro` and `duration = 5 | 10` seconds.
- Suno: set `custom_mode=true` to control lyrics + style; otherwise PiAPI fills
  both from the prompt.

## Troubleshooting

- `401`: `PIAPI_API_KEY` missing or wrong header casing — header must be
  exactly `x-api-key`.
- `402`: out of credits or no active plan.
- `429`: tier concurrency cap hit — back off, do not hammer.
- Status stuck `Staged` for Midjourney: that family stages an interactive grid;
  follow up with `upscale` / `variation` task_types.
- Webhook didn't fire: confirm endpoint returns `2xx` quickly — PiAPI retries
  every 5s up to 3 attempts only.

## References

- Overview: https://piapi.ai/docs/overview
- Per-family docs: https://piapi.ai/docs/{midjourney,flux,kling,suno,faceswap,veo3,gemini,...}
- LLM API: https://piapi.ai/docs/llm-api
- MCP server: https://piapi.ai/docs/mcp-server
- Pricing & rate limits: https://piapi.ai/pricing
