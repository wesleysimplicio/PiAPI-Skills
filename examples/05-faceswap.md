# 05 · Faceswap (image and video)

Faceswap on PiAPI lives under two models: `Qubico/image-toolkit` for stills
and `Qubico/video-toolkit` for video. Both accept the same `face-swap` /
`multi-face-swap` task types.

## Shell — single image

```bash
piapi-cli faceswap \
  --target-url https://example.com/target.jpg \
  --swap-url   https://example.com/face.jpg \
  --wait
```

## Multi-face swap

```bash
piapi-cli submit --model Qubico/image-toolkit --task-type multi-face-swap \
  --input '{
    "target_image_url": "https://example.com/group_photo.jpg",
    "swap_faces": [
      {"target_index": 0, "swap_image_url": "https://example.com/face_a.jpg"},
      {"target_index": 1, "swap_image_url": "https://example.com/face_b.jpg"}
    ]
  }'
```

`target_index` is zero-based; PiAPI orders detected faces left-to-right, then
top-to-bottom.

## Video faceswap

```bash
piapi-cli submit --model Qubico/video-toolkit --task-type face-swap \
  --input '{
    "target_video_url": "https://example.com/clip.mp4",
    "swap_image_url": "https://example.com/face.jpg"
  }' \
  --webhook-url https://yourapp/api/piapi --webhook-secret "$PIAPI_WEBHOOK_SECRET"
```

Video jobs are markedly slower than image — wire a webhook instead of long
polling.

## Output shape

Image jobs return `data.output.image_url`. Video jobs return
`data.output.video_url`. Both expire from PiAPI's CDN after a short window
(check headers); copy the binary to your own storage if you need it long-term.

## Status nuance

Faceswap follows the capitalized family: `Pending | Processing | Completed
| Failed`. Lowercase before comparing.

## Notes

- Source faces should be clear, frontal, well-lit. Profile shots reduce match
  quality significantly.
- Video output preserves the source clip's duration and frame rate. Audio is
  copied through.
- For consent-sensitive use cases, log the calling user, target URL, and
  source URL before submitting.
