# 06 · Hunyuan video with LoRA

Hunyuan is Tencent's open video model, exposed on PiAPI as `Qubico/hunyuan`.
Two task types matter: `txt2video-lora` (prompt-only) and `img2video-lora`
(start frame + prompt). LoRA weights are optional but the task-type name is
always `*-lora`.

## Text-to-video

```bash
piapi-cli run --model Qubico/hunyuan --task-type txt2video-lora \
  --input '{
    "prompt": "a paper crane unfolding into origami in slow motion",
    "duration": 5,
    "aspect_ratio": "16:9"
  }'
```

## With a LoRA

```bash
piapi-cli run --model Qubico/hunyuan --task-type txt2video-lora \
  --input '{
    "prompt": "anime studio ghibli forest spirits",
    "duration": 5,
    "aspect_ratio": "16:9",
    "lora_url": "https://example.com/ghibli.safetensors",
    "lora_strength": 0.8
  }'
```

## Image-to-video

```bash
piapi-cli run --model Qubico/hunyuan --task-type img2video-lora \
  --input '{
    "image_url": "https://example.com/start_frame.jpg",
    "prompt": "the camera pulls back as petals fall",
    "duration": 5
  }'
```

## Async pattern with webhook

```bash
piapi-cli submit --model Qubico/hunyuan --task-type txt2video-lora \
  --input '{
    "prompt": "neon arcade alley, slow tracking shot",
    "duration": 5,
    "aspect_ratio": "16:9"
  }' \
  --webhook-url https://yourapp/api/piapi --webhook-secret "$PIAPI_WEBHOOK_SECRET"
```

## Notes

- Hunyuan is one of the most compute-heavy models on the platform. Tasks
  routinely take several minutes — never long-poll from a serverless function
  with a short timeout. Use webhooks.
- Per-tier concurrency caps **do not apply** to Hunyuan in the published
  pricing snapshot — verify in `references/rate-limits.md` before designing a
  high-fanout pipeline.
- Output URLs land in `data.output.video_url` (single MP4).
