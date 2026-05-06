# 01 · Text-to-image with Flux

Flux is the fastest-to-iterate image family on PiAPI. Use `flux1-schnell` for
prototyping (≈ 4 steps, sub-10s on busy queues) and `flux1-dev` for higher
fidelity (≈ 28 steps).

## Shell

```bash
export PIAPI_API_KEY="pk-..."

piapi-cli flux \
  --prompt "neon-lit cyberpunk alley, rain reflections, anamorphic lens" \
  --model Qubico/flux1-schnell \
  --width 1024 --height 1024 \
  --wait
```

## With negative prompt and seed

```bash
piapi-cli flux \
  --prompt "studio portrait of a calico cat, soft rim light" \
  --negative-prompt "low quality, blurry, deformed" \
  --model Qubico/flux1-dev \
  --width 1024 --height 1024 \
  --steps 28 --guidance 3.5 \
  --seed 42 \
  --wait
```

## Raw envelope

```bash
piapi-cli submit --model Qubico/flux1-schnell --task-type txt2img \
  --input '{
    "prompt": "neon-lit cyberpunk alley, rain reflections",
    "width": 1024,
    "height": 1024
  }' \
  --webhook-url https://yourapp/api/piapi --webhook-secret "$PIAPI_WEBHOOK_SECRET"
```

## Python (no SDK)

```python
import os, requests, time

API = "https://api.piapi.ai"
H = {"x-api-key": os.environ["PIAPI_API_KEY"], "Content-Type": "application/json"}

body = {
    "model": "Qubico/flux1-schnell",
    "task_type": "txt2img",
    "input": {"prompt": "a misty pine forest at dawn", "width": 1024, "height": 1024},
}
r = requests.post(f"{API}/api/v1/task", json=body, headers=H, timeout=60)
r.raise_for_status()
task_id = r.json()["data"]["task_id"]

while True:
    r = requests.get(f"{API}/api/v1/task/{task_id}", headers=H, timeout=30)
    r.raise_for_status()
    data = r.json()["data"]
    status = (data.get("status") or "").lower()
    if status in {"completed", "complete", "success", "succeeded"}:
        print(data["output"])
        break
    if status in {"failed", "failure", "error", "canceled", "cancelled", "rejected"}:
        raise RuntimeError(data)
    time.sleep(2)
```

## Notes

- Status from Flux is lowercase (`success`, `failed`). Always normalize before
  comparing.
- `flux1-dev-advanced` adds ControlNet + LoRA inputs. See the model catalog
  in `references/models.md` for the input shape.
- For inpaint, switch `task_type` to `inpaint` and add `mask_url` plus
  `image_url` to the input.
