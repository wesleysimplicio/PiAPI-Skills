# 03 · Kling image-to-video

Kling animates a still image into a 5- or 10-second clip. Quality scales with
`mode = std | pro` and the prompt's camera-motion language.

## Shell

```bash
piapi-cli kling \
  --image-url https://example.com/in.jpg \
  --prompt "slow dolly forward, soft cinematic lighting, gentle handheld" \
  --duration 5 \
  --aspect-ratio 16:9 \
  --mode std \
  --wait
```

## Pro mode

```bash
piapi-cli kling \
  --image-url https://example.com/in.jpg \
  --prompt "slow dolly forward, anamorphic flare, depth of field" \
  --duration 10 --mode pro --wait
```

## Raw envelope

```bash
piapi-cli submit --model kling --task-type image2video \
  --input '{
    "image_url": "https://example.com/in.jpg",
    "prompt": "slow dolly forward, cinematic",
    "duration": 5,
    "aspect_ratio": "16:9",
    "mode": "std"
  }' \
  --webhook-url https://yourapp/api/piapi --webhook-secret "$PIAPI_WEBHOOK_SECRET"
```

## Text-to-video

For pure text-to-video, swap the task type and drop `image_url`:

```bash
piapi-cli submit --model kling --task-type text2video \
  --input '{
    "prompt": "a hummingbird in slow motion over a tropical flower",
    "duration": 5,
    "aspect_ratio": "16:9",
    "mode": "std"
  }'
```

## Extend an existing clip

```bash
piapi-cli submit --model kling --task-type extend \
  --input '{
    "origin_task_id": "<previous task_id>",
    "prompt": "camera tilts up, wider establishing shot"
  }'
```

## Status nuance

Kling returns capitalized status enums (`Pending | Processing | Completed |
Failed`). Always lowercase before comparing.

## Tips

- Use real motion verbs (`dolly`, `pan`, `tilt`, `orbit`) — Kling responds to
  cinematography vocabulary.
- For lipsync, send `task_type = lipsync` with `audio_url` + the source
  `video_url`.
- Special effects (e.g. age-up, hug, expression) live under
  `task_type = effects` with an `effect_id` field.
