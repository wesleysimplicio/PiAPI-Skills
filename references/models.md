# PiAPI model catalog

Every media job uses the same envelope:

```json
POST /api/v1/task
{
  "model": "<one of the values below>",
  "task_type": "<one of the task types in that row>",
  "input":  { ... model-specific ... },
  "config": { "service_mode": "public" }
}
```

Auth header (lowercase canonical): `x-api-key: <PIAPI_API_KEY>`.

## Image

### Midjourney

- `model`: `midjourney`
- `task_type`: `imagine`, `upscale`, `variation`, `inpaint`, `describe`, `blend`
- Status family: capitalized (`Pending | Processing | Staged | Completed | Failed`)
- Service modes: `public` (PPU), `private` (HYA — needs Discord token, channel ID, guild ID)
- Process modes: `fast` (default, 1.0×), `turbo` (2.0×, ~half wait), `relax` (0.5×, queues)
- Common input keys (`imagine`):
  ```json
  {
    "prompt": "...",
    "aspect_ratio": "16:9",
    "process_mode": "fast"
  }
  ```
- `upscale` / `variation` need `origin_task_id` + `index` (1–4).

### Flux

- `model`: `Qubico/flux1-schnell`, `Qubico/flux1-dev`, `Qubico/flux1-dev-advanced`
- `task_type`: `txt2img`, `img2img`, `inpaint`, `controlnet-lora`, `redux-variation`
- Status family: lowercase (`pending | starting | processing | success | failed | retry`)
- Common input (`txt2img`):
  ```json
  {
    "prompt": "...",
    "negative_prompt": "low quality, blurry",
    "width": 1024,
    "height": 1024,
    "steps": 28,
    "guidance": 3.5,
    "seed": 42
  }
  ```
- `flux1-schnell` ≈ 4 steps (speed); `flux1-dev` ≈ 28 steps (quality); the
  `-advanced` variant adds ControlNet + LoRA inputs.

### Gemini Nano Banana

- `model`: `gemini`
- `task_type`: `nano-banana-text-to-image`, `nano-banana-edit`
- Status family: lowercase
- Common input:
  ```json
  { "prompt": "..." }                          // text-to-image
  { "prompt": "...", "image_url": "..." }      // edit
  ```

## Video

### Kling

- `model`: `kling`
- `task_type`: `text2video`, `image2video`, `extend`, `lipsync`, `effects`
- Status family: capitalized
- Common input (`image2video`):
  ```json
  {
    "image_url": "https://...",
    "prompt": "...",
    "duration": 5,
    "aspect_ratio": "16:9",
    "mode": "std"
  }
  ```
- `mode = std | pro`; `duration = 5 | 10`.

### Luma Dream Machine

- `model`: `luma`
- `task_type`: `text2video`, `image2video`, `extend`
- Status family: lowercase
- Common input:
  ```json
  {
    "prompt": "...",
    "image_url": "https://...",
    "aspect_ratio": "16:9",
    "loop": false
  }
  ```

### Hailuo (MiniMax)

- `model`: `hailuo`
- `task_type`: `text2video`, `image2video`, `subject2video`
- Status family: lowercase
- Common input:
  ```json
  { "prompt": "...", "image_url": "https://..." }
  ```

### Veo 3

- `model`: `veo3`
- `task_type`: `txt2vid`, `img2vid`
- Status family: lowercase
- Common input:
  ```json
  {
    "prompt": "...",
    "aspect_ratio": "16:9",
    "duration": 8,
    "image_url": "https://..."
  }
  ```

### Seedance 2

- `model`: `seedance`
- `task_type`: `text-to-video`, `image-to-video`
- Status family: lowercase

### Hunyuan

- `model`: `Qubico/hunyuan`
- `task_type`: `txt2video-lora`, `img2video-lora`
- Status family: lowercase
- Common input:
  ```json
  {
    "prompt": "...",
    "image_url": "https://...",
    "duration": 5,
    "aspect_ratio": "16:9",
    "lora_url": "https://example.com/lora.safetensors",
    "lora_strength": 0.8
  }
  ```

## Music & audio

### Suno / Udio

- `model`: `music-u`
- `task_type`: `generate_music`, `generate_music_custom`, `extend`, `concat`, `add_lyrics`
- Status family: lowercase
- Common input (`generate_music`):
  ```json
  {
    "gpt_description_prompt": "...",
    "make_instrumental": false
  }
  ```
- Common input (`generate_music_custom`):
  ```json
  { "title": "...", "tags": "...", "prompt": "lyrics here" }
  ```
- Output: up to two clip variants in `data.output.clips[]`.

### MMAudio

- `model`: `Qubico/mmaudio`
- `task_type`: `video2audio`
- Common input:
  ```json
  { "video_url": "https://..." }
  ```

### F5-TTS

- `model`: `Qubico/f5-tts`
- `task_type`: `txt2speech`
- Common input:
  ```json
  { "text": "Welcome.", "voice_url": "https://..." }
  ```

## 3D

### Trellis

- `model`: `Qubico/trellis`
- `task_type`: `image-to-3d`
- Common input:
  ```json
  { "image_url": "https://example.com/object.png" }
  ```
- Output: `data.output.mesh_url` (GLB/OBJ).

## Faceswap

- `model`: `Qubico/image-toolkit` (stills) or `Qubico/video-toolkit` (video)
- `task_type`: `face-swap`, `multi-face-swap`
- Status family: capitalized
- Common input (image, single):
  ```json
  {
    "target_image_url": "https://...",
    "swap_image_url":   "https://..."
  }
  ```
- Common input (image, multi):
  ```json
  {
    "target_image_url": "https://...",
    "swap_faces": [
      {"target_index": 0, "swap_image_url": "..."}
    ]
  }
  ```
- Common input (video):
  ```json
  {
    "target_video_url": "https://...",
    "swap_image_url":   "https://..."
  }
  ```

## LLM (sync, OpenAI-compatible)

- Endpoint: `POST /v1/chat/completions`
- Request shape: standard OpenAI Chat Completions with `model`, `messages`,
  optional `stream`, `tools`, `tool_choice`, `response_format`.
- Auth: same `x-api-key` header.
- This endpoint does not use the task envelope. No `task_id`, no polling.

## Service modes

- `public` (default) — Pay-Per-Use, capped by tier concurrency.
- `private` — Host-Your-Account; required for Midjourney private mode and a
  few other families. Add the vendor-specific config under
  `config.<family>.{token, channel_id, guild_id, ...}`.

## See also

- [`rest-api.md`](./rest-api.md) — the envelope, headers, status drift.
- [`errors.md`](./errors.md) — status codes and per-model gotchas.
- [`webhooks.md`](./webhooks.md) — no-HMAC verification pattern.
- [`rate-limits.md`](./rate-limits.md) — concurrency and RPM caps.
