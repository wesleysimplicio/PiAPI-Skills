#!/usr/bin/env python3
"""piapi-cli — language-agnostic CLI for the PiAPI inference platform.

PiAPI is async-only. Every media job goes through the unified envelope:

    POST /api/v1/task           { model, task_type, input, config? }
    GET  /api/v1/task/{task_id} → { data: { status, output, error, ... } }
    DELETE /api/v1/task/{task_id}     (only `pending` jobs are cancellable)

The LLM gateway at `POST /v1/chat/completions` is the only sync surface.

Subcommands
-----------
    submit    <model> <task_type> '<json_input>'   Create a task. Print task id.
    result    <task_id>                            Fetch result (one shot).
    wait      <task_id>                            Poll until terminal status.
    cancel    <task_id>                            Best-effort cancel.
    run       <model> <task_type> '<json>'         Submit + wait, one call.
    imagine   '<prompt>'                           Midjourney imagine shortcut.
    flux      '<prompt>'                           Flux text-to-image shortcut.
    kling     '<prompt>' [--image URL]             Kling text/image-to-video.
    suno      '<prompt>'                           Suno music generation.
    faceswap  --src URL --dst URL                  Face swap on still images.
    llm       <model> '<prompt>'                   OpenAI-compatible chat (sync).
    models                                         List supported model+task_type pairs.
    verify-webhook --header-secret X --expected Y  Constant-time compare two webhook secrets.

Auth
----
    Reads PIAPI_API_KEY from the environment. Get a key at https://piapi.ai/.

Examples
--------
    piapi-cli imagine "a moss-covered cathedral, dramatic lighting" --aspect 16:9
    piapi-cli run "Qubico/flux1-schnell" "txt2img" '{"prompt":"a fox on a stump"}'
    piapi-cli kling "drone shot, mountain valley" --image https://cdn/x.jpg
    piapi-cli llm "gpt-4o-mini" "Summarize PiAPI in one sentence."
"""

from __future__ import annotations

import argparse
import hmac
import json
import os
import sys
import time
from typing import Any

import requests

API_BASE = os.environ.get("PIAPI_API_BASE", "https://api.piapi.ai").rstrip("/")
LLM_BASE = os.environ.get("PIAPI_LLM_BASE", "https://api.piapi.ai/v1").rstrip("/")

# PiAPI status enum drifts across model families. Normalize to lowercase
# and treat any of these as terminal.
TERMINAL_STATUSES = {
    "completed",
    "complete",
    "success",
    "succeeded",
    "failed",
    "failure",
    "error",
    "canceled",
    "cancelled",
    "rejected",
}
FAILURE_STATUSES = {"failed", "failure", "error", "rejected"}


# ----- helpers ---------------------------------------------------------------


def _key() -> str:
    key = os.environ.get("PIAPI_API_KEY", "").strip()
    if not key:
        sys.stderr.write(
            "ERROR: PIAPI_API_KEY is not set.\n"
            "Get one at https://piapi.ai/, then:\n"
            "    export PIAPI_API_KEY=...\n"
        )
        sys.exit(2)
    return key


def _headers(json_body: bool = True) -> dict[str, str]:
    h = {"x-api-key": _key()}
    if json_body:
        h["Content-Type"] = "application/json"
    return h


def _print_json(data: Any) -> None:
    print(json.dumps(data, ensure_ascii=False, indent=2))


def _normalize_status(raw: Any) -> str:
    return str(raw or "").strip().lower()


def _post_task(
    model: str, task_type: str, payload: dict[str, Any], config: dict[str, Any] | None = None
) -> dict[str, Any]:
    body: dict[str, Any] = {
        "model": model,
        "task_type": task_type,
        "input": payload,
    }
    if config:
        body["config"] = config
    r = requests.post(f"{API_BASE}/api/v1/task", headers=_headers(), json=body, timeout=60)
    if r.status_code >= 400:
        sys.stderr.write(f"submit failed [{r.status_code}]: {r.text[:500]}\n")
        sys.exit(1)
    return r.json()


def _get_task(task_id: str) -> dict[str, Any]:
    r = requests.get(
        f"{API_BASE}/api/v1/task/{task_id}", headers=_headers(json_body=False), timeout=30
    )
    if r.status_code >= 400:
        sys.stderr.write(f"fetch failed [{r.status_code}]: {r.text[:500]}\n")
        sys.exit(1)
    return r.json()


def _wait_task(
    task_id: str, *, timeout: float = 1800.0, poll_interval: float = 2.0
) -> dict[str, Any]:
    deadline = time.time() + timeout
    while True:
        data = _get_task(task_id)
        node = data.get("data", data) or {}
        status = _normalize_status(node.get("status"))
        if status in TERMINAL_STATUSES:
            return data
        if time.time() > deadline:
            sys.stderr.write(f"timed out waiting for terminal status (last: {status})\n")
            sys.exit(1)
        time.sleep(poll_interval)


def _config_from_args(args: argparse.Namespace) -> dict[str, Any]:
    cfg: dict[str, Any] = {}
    if getattr(args, "private", False):
        cfg["service_mode"] = "private"
    elif getattr(args, "public", False):
        cfg["service_mode"] = "public"
    if getattr(args, "webhook_url", None) or getattr(args, "webhook_secret", None):
        wh: dict[str, Any] = {}
        if args.webhook_url:
            wh["endpoint"] = args.webhook_url
        if args.webhook_secret:
            wh["secret"] = args.webhook_secret
        cfg["webhook_config"] = wh
    return cfg


def _extract_task_id(envelope: dict[str, Any]) -> str:
    node = envelope.get("data", envelope) or {}
    return str(node.get("task_id") or node.get("id") or "")


# ----- commands --------------------------------------------------------------


def cmd_submit(args: argparse.Namespace) -> int:
    payload = json.loads(args.json_input) if args.json_input else {}
    cfg = _config_from_args(args)
    out = _post_task(args.model, args.task_type, payload, cfg or None)
    if args.id_only:
        print(_extract_task_id(out))
    else:
        _print_json(out)
    return 0


def cmd_result(args: argparse.Namespace) -> int:
    data = _get_task(args.task_id)
    _print_json(data)
    node = data.get("data", data) or {}
    status = _normalize_status(node.get("status"))
    return 1 if status in FAILURE_STATUSES else 0


def cmd_wait(args: argparse.Namespace) -> int:
    data = _wait_task(args.task_id, timeout=args.timeout, poll_interval=args.poll_interval)
    _print_json(data)
    node = data.get("data", data) or {}
    status = _normalize_status(node.get("status"))
    return 1 if status in FAILURE_STATUSES else 0


def cmd_cancel(args: argparse.Namespace) -> int:
    r = requests.delete(
        f"{API_BASE}/api/v1/task/{args.task_id}", headers=_headers(json_body=False), timeout=30
    )
    if r.status_code >= 400:
        sys.stderr.write(f"cancel failed [{r.status_code}]: {r.text[:500]}\n")
        return 1
    print(r.text or "{}")
    return 0


def cmd_run(args: argparse.Namespace) -> int:
    payload = json.loads(args.json_input) if args.json_input else {}
    cfg = _config_from_args(args)
    submitted = _post_task(args.model, args.task_type, payload, cfg or None)
    task_id = _extract_task_id(submitted)
    if not task_id:
        sys.stderr.write("submit returned no task id; raw:\n")
        _print_json(submitted)
        return 1
    data = _wait_task(task_id, timeout=args.timeout, poll_interval=args.poll_interval)
    _print_json(data)
    node = data.get("data", data) or {}
    status = _normalize_status(node.get("status"))
    return 1 if status in FAILURE_STATUSES else 0


def cmd_imagine(args: argparse.Namespace) -> int:
    payload: dict[str, Any] = {"prompt": args.prompt}
    if args.aspect:
        payload["aspect_ratio"] = args.aspect
    if args.process_mode:
        payload["process_mode"] = args.process_mode
    if args.skip_prompt_check:
        payload["skip_prompt_check"] = True
    cfg = _config_from_args(args)
    submitted = _post_task("midjourney", "imagine", payload, cfg or None)
    task_id = _extract_task_id(submitted)
    if not task_id:
        _print_json(submitted)
        return 1
    if args.no_wait:
        print(task_id)
        return 0
    data = _wait_task(task_id, timeout=args.timeout, poll_interval=args.poll_interval)
    _print_json(data)
    return 0


def cmd_flux(args: argparse.Namespace) -> int:
    payload: dict[str, Any] = {"prompt": args.prompt}
    if args.width:
        payload["width"] = args.width
    if args.height:
        payload["height"] = args.height
    if args.steps:
        payload["steps"] = args.steps
    if args.guidance is not None:
        payload["guidance_scale"] = args.guidance
    cfg = _config_from_args(args)
    submitted = _post_task(args.model, "txt2img", payload, cfg or None)
    task_id = _extract_task_id(submitted)
    if args.no_wait:
        print(task_id)
        return 0
    data = _wait_task(task_id, timeout=args.timeout, poll_interval=args.poll_interval)
    _print_json(data)
    return 0


def cmd_kling(args: argparse.Namespace) -> int:
    payload: dict[str, Any] = {"prompt": args.prompt}
    if args.image:
        payload["image_url"] = args.image
    if args.duration:
        payload["duration"] = args.duration
    if args.aspect:
        payload["aspect_ratio"] = args.aspect
    if args.mode:
        payload["mode"] = args.mode
    task_type = "image2video" if args.image else "text2video"
    cfg = _config_from_args(args)
    submitted = _post_task("kling", task_type, payload, cfg or None)
    task_id = _extract_task_id(submitted)
    if args.no_wait:
        print(task_id)
        return 0
    data = _wait_task(task_id, timeout=args.timeout, poll_interval=args.poll_interval)
    _print_json(data)
    return 0


def cmd_suno(args: argparse.Namespace) -> int:
    payload: dict[str, Any] = {"gpt_description_prompt": args.prompt}
    if args.lyrics:
        payload["prompt"] = args.lyrics
    if args.style:
        payload["tags"] = args.style
    if args.title:
        payload["title"] = args.title
    if args.instrumental:
        payload["make_instrumental"] = True
    cfg = _config_from_args(args)
    submitted = _post_task("music-u", "generate_music", payload, cfg or None)
    task_id = _extract_task_id(submitted)
    if args.no_wait:
        print(task_id)
        return 0
    data = _wait_task(task_id, timeout=args.timeout, poll_interval=args.poll_interval)
    _print_json(data)
    return 0


def cmd_faceswap(args: argparse.Namespace) -> int:
    payload = {
        "target_image": args.dst,
        "swap_image": args.src,
    }
    cfg = _config_from_args(args)
    submitted = _post_task("Qubico/image-toolkit", "face-swap", payload, cfg or None)
    task_id = _extract_task_id(submitted)
    if args.no_wait:
        print(task_id)
        return 0
    data = _wait_task(task_id, timeout=args.timeout, poll_interval=args.poll_interval)
    _print_json(data)
    return 0


def cmd_llm(args: argparse.Namespace) -> int:
    body: dict[str, Any] = {
        "model": args.model,
        "messages": [{"role": "user", "content": args.prompt}],
    }
    if args.system:
        body["messages"].insert(0, {"role": "system", "content": args.system})
    if args.json_mode:
        body["response_format"] = {"type": "json_object"}
    if args.temperature is not None:
        body["temperature"] = args.temperature
    if args.max_tokens is not None:
        body["max_tokens"] = args.max_tokens
    if args.stream:
        body["stream"] = True
        with requests.post(
            f"{LLM_BASE}/chat/completions",
            headers=_headers(),
            json=body,
            stream=True,
            timeout=300,
        ) as r:
            r.raise_for_status()
            for line in r.iter_lines(decode_unicode=True):
                if not line or not line.startswith("data: "):
                    continue
                payload = line[6:]
                if payload.strip() == "[DONE]":
                    break
                try:
                    chunk = json.loads(payload)
                except json.JSONDecodeError:
                    continue
                delta = (chunk.get("choices") or [{}])[0].get("delta", {}).get("content", "")
                if delta:
                    sys.stdout.write(delta)
                    sys.stdout.flush()
            sys.stdout.write("\n")
        return 0
    r = requests.post(f"{LLM_BASE}/chat/completions", headers=_headers(), json=body, timeout=300)
    r.raise_for_status()
    data = r.json()
    if args.raw:
        _print_json(data)
    else:
        print(data["choices"][0]["message"]["content"])
    return 0


def cmd_verify_webhook(args: argparse.Namespace) -> int:
    """PiAPI does NOT HMAC-sign webhooks. The shared secret you set in
    `webhook_config.secret` is echoed back in the `x-webhook-secret` header.
    Verification is a constant-time string compare between the value you
    pulled off the request header and the value you stored when registering
    the webhook.

    Either flag can be supplied via env var as a fallback:
        --header-secret  ← PIAPI_WEBHOOK_HEADER (or read from request)
        --expected       ← PIAPI_WEBHOOK_SECRET (your stored secret)
    """
    header_secret = (args.header_secret or os.environ.get("PIAPI_WEBHOOK_HEADER", "")).strip()
    expected = (args.expected or os.environ.get("PIAPI_WEBHOOK_SECRET", "")).strip()
    if not header_secret or not expected:
        sys.stderr.write(
            "ERROR: both --header-secret and --expected are required "
            "(or PIAPI_WEBHOOK_HEADER and PIAPI_WEBHOOK_SECRET env vars).\n"
        )
        return 2
    valid = hmac.compare_digest(header_secret, expected)
    print("valid" if valid else "invalid")
    return 0 if valid else 1


# Catalog of supported model+task_type pairs. Hand-curated from PiAPI docs.
# Pure local — no API call. `piapi-cli models` prints this as a plain table.
SUPPORTED_MODELS: list[tuple[str, str, str, str]] = [
    # family             model                                  task_type           notes
    ("midjourney", "midjourney", "imagine", "Status: Capitalized"),
    ("midjourney", "midjourney", "upscale", "child task on imagine grid"),
    ("midjourney", "midjourney", "variation", "child task on imagine grid"),
    ("midjourney", "midjourney", "describe", "image -> prompt"),
    ("midjourney", "midjourney", "blend", "blend up to 5 images"),
    ("midjourney", "midjourney", "inpaint", "Vary Region"),
    ("midjourney", "midjourney", "outpaint", "Zoom Out"),
    ("flux", "Qubico/flux1-schnell", "txt2img", "fast schnell"),
    ("flux", "Qubico/flux1-dev", "txt2img", "higher quality dev"),
    ("flux", "Qubico/flux1-dev", "img2img", "image-conditioned"),
    ("flux", "Qubico/flux1-dev", "inpaint", "mask-driven edit"),
    ("flux", "Qubico/flux1-dev", "controlnet", "controlnet variants"),
    ("kling", "kling", "text2video", "Status: Capitalized"),
    ("kling", "kling", "image2video", "image_url + prompt"),
    ("kling", "kling", "video_extend", "extend existing kling clip"),
    ("kling", "kling", "lip_sync", "audio-driven lip-sync"),
    ("suno", "music-u", "generate_music", "description or lyrics"),
    ("suno", "music-u", "extend_music", "continue from existing track"),
    ("suno", "music-u", "lyrics", "generate lyrics only"),
    ("faceswap", "Qubico/image-toolkit", "face-swap", "Status: Capitalized; still image"),
    ("faceswap", "Qubico/image-toolkit", "face-swap-video", "video; throughput-bound"),
    ("trellis", "Qubico/trellis", "image-to-3d", "GLB/PLY 3D mesh"),
    ("hailuo", "hailuo", "t2v", "MiniMax Hailuo text2video"),
    ("hailuo", "hailuo", "i2v", "MiniMax Hailuo image2video"),
    ("hailuo", "hailuo", "s2v", "subject-reference video"),
    ("luma", "luma", "generate_video", "Dream Machine"),
    ("luma", "luma", "extend_video", "extend existing"),
    ("luma", "luma", "image-to-video", "image-conditioned"),
    ("hunyuan", "Qubico/hunyuan", "t2v", "no per-tier cap"),
    ("hunyuan", "Qubico/hunyuan", "i2v", "no per-tier cap"),
    ("veo3", "google/veo-3", "t2v", "synced audio output"),
    ("gemini-image", "google/gemini-2.5-flash-image", "image-generate", "Nano Banana"),
    ("gemini-image", "google/gemini-2.5-flash-image", "image-edit", "instruction-based edit"),
    ("seedance", "bytedance/seedance-2", "t2v", "ByteDance Seedance"),
    ("seedance", "bytedance/seedance-2", "i2v", "image-conditioned"),
    ("mmaudio", "Qubico/mmaudio", "video2audio", "video soundtracking"),
    ("f5-tts", "Qubico/f5-tts", "tts", "voice cloning TTS"),
    ("llm", "gpt-4o-mini", "chat", "sync /v1/chat/completions"),
    ("llm", "gpt-4o", "chat", "sync /v1/chat/completions"),
    ("llm", "claude-3.5-sonnet", "chat", "sync /v1/chat/completions"),
    ("llm", "deepseek-v3", "chat", "sync /v1/chat/completions"),
    ("llm", "gemini-2.0-flash", "chat", "sync /v1/chat/completions"),
]


def cmd_models(args: argparse.Namespace) -> int:
    """Print the local catalog of supported model+task_type pairs.

    Pure local — no API call, no auth required. The catalog is hand-curated
    from PiAPI docs and may lag the live model list. Treat it as a guide,
    not as truth: PiAPI publishes the live model catalog at
    https://piapi.ai/docs/overview.
    """
    rows = SUPPORTED_MODELS
    if args.family:
        wanted = args.family.strip().lower()
        rows = [r for r in rows if r[0] == wanted]
    if args.json:
        out = [{"family": f, "model": m, "task_type": t, "notes": n} for (f, m, t, n) in rows]
        _print_json(out)
        return 0
    # Plain text table.
    headers = ("family", "model", "task_type", "notes")
    widths = [max(len(headers[i]), max((len(r[i]) for r in rows), default=0)) for i in range(4)]
    fmt = "  ".join("{:<" + str(w) + "}" for w in widths)
    print(fmt.format(*headers))
    print(fmt.format(*("-" * w for w in widths)))
    for r in rows:
        print(fmt.format(*r))
    return 0


# ----- argparse --------------------------------------------------------------


def _add_wait_args(p: argparse.ArgumentParser) -> None:
    p.add_argument("--timeout", type=float, default=1800.0)
    p.add_argument("--poll-interval", type=float, default=2.0)


def _add_config_args(p: argparse.ArgumentParser) -> None:
    p.add_argument("--public", action="store_true", help="force PPU public service mode")
    p.add_argument("--private", action="store_true", help="force HYA private service mode")
    p.add_argument("--webhook-url", help="webhook endpoint to call on completion")
    p.add_argument(
        "--webhook-secret", help="shared secret echoed in x-webhook-secret header on delivery"
    )


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="piapi-cli",
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument("--version", action="version", version="piapi-cli 1.0.0")
    sub = p.add_subparsers(dest="cmd", required=True)

    ps = sub.add_parser("submit", help="create a task; print task id (no polling)")
    ps.add_argument("model")
    ps.add_argument("task_type")
    ps.add_argument("json_input", nargs="?", default="{}")
    ps.add_argument("--id-only", action="store_true", help="print just the task id")
    _add_config_args(ps)
    ps.set_defaults(func=cmd_submit)

    pres = sub.add_parser("result", help="fetch the result of a task (one shot)")
    pres.add_argument("task_id")
    pres.set_defaults(func=cmd_result)

    pw = sub.add_parser("wait", help="poll a task until it reaches a terminal status")
    pw.add_argument("task_id")
    _add_wait_args(pw)
    pw.set_defaults(func=cmd_wait)

    pc = sub.add_parser("cancel", help="cancel a task (only `pending` jobs are cancellable)")
    pc.add_argument("task_id")
    pc.set_defaults(func=cmd_cancel)

    pr = sub.add_parser("run", help="submit + wait until terminal in a single call")
    pr.add_argument("model")
    pr.add_argument("task_type")
    pr.add_argument("json_input", nargs="?", default="{}")
    _add_wait_args(pr)
    _add_config_args(pr)
    pr.set_defaults(func=cmd_run)

    pi = sub.add_parser("imagine", help="Midjourney imagine shortcut")
    pi.add_argument("prompt")
    pi.add_argument("--aspect", help='aspect ratio, e.g. "16:9"')
    pi.add_argument("--process-mode", choices=["fast", "relax", "turbo"])
    pi.add_argument("--skip-prompt-check", action="store_true")
    pi.add_argument("--no-wait", action="store_true")
    _add_wait_args(pi)
    _add_config_args(pi)
    pi.set_defaults(func=cmd_imagine)

    pf = sub.add_parser("flux", help="Flux text-to-image shortcut")
    pf.add_argument("prompt")
    pf.add_argument("--model", default="Qubico/flux1-schnell", help="Flux model id on PiAPI")
    pf.add_argument("--width", type=int)
    pf.add_argument("--height", type=int)
    pf.add_argument("--steps", type=int)
    pf.add_argument("--guidance", type=float, dest="guidance")
    pf.add_argument("--no-wait", action="store_true")
    _add_wait_args(pf)
    _add_config_args(pf)
    pf.set_defaults(func=cmd_flux)

    pk = sub.add_parser("kling", help="Kling text/image-to-video shortcut")
    pk.add_argument("prompt")
    pk.add_argument("--image", help="optional image_url to drive image-to-video")
    pk.add_argument("--duration", type=int, help="duration in seconds (5/10)")
    pk.add_argument("--aspect", help='aspect ratio, e.g. "16:9"')
    pk.add_argument("--mode", choices=["std", "pro"])
    pk.add_argument("--no-wait", action="store_true")
    _add_wait_args(pk)
    _add_config_args(pk)
    pk.set_defaults(func=cmd_kling)

    pso = sub.add_parser("suno", help="Suno music generation shortcut")
    pso.add_argument("prompt", help="GPT-style description prompt")
    pso.add_argument("--lyrics", help="explicit lyrics (overrides description-only mode)")
    pso.add_argument("--style", help="comma-separated tags (genre, mood)")
    pso.add_argument("--title")
    pso.add_argument("--instrumental", action="store_true")
    pso.add_argument("--no-wait", action="store_true")
    _add_wait_args(pso)
    _add_config_args(pso)
    pso.set_defaults(func=cmd_suno)

    pfs = sub.add_parser("faceswap", help="Faceswap on still images")
    pfs.add_argument("--src", required=True, help="URL of the face source image")
    pfs.add_argument("--dst", required=True, help="URL of the target image to receive the face")
    pfs.add_argument("--no-wait", action="store_true")
    _add_wait_args(pfs)
    _add_config_args(pfs)
    pfs.set_defaults(func=cmd_faceswap)

    pl = sub.add_parser("llm", help="OpenAI-compatible chat completion (sync, supports stream)")
    pl.add_argument("model")
    pl.add_argument("prompt")
    pl.add_argument("--system")
    pl.add_argument("--json-mode", action="store_true")
    pl.add_argument("--stream", action="store_true")
    pl.add_argument("--temperature", type=float)
    pl.add_argument("--max-tokens", type=int)
    pl.add_argument("--raw", action="store_true", help="print full JSON envelope")
    pl.set_defaults(func=cmd_llm)

    pv = sub.add_parser(
        "verify-webhook",
        help="constant-time compare the x-webhook-secret value against your stored secret",
    )
    pv.add_argument(
        "--header-secret",
        help="value of the x-webhook-secret header (or env PIAPI_WEBHOOK_HEADER)",
    )
    pv.add_argument(
        "--expected",
        help="your stored secret (or env PIAPI_WEBHOOK_SECRET)",
    )
    pv.set_defaults(func=cmd_verify_webhook)

    pm = sub.add_parser(
        "models",
        help="print the local catalog of supported model+task_type pairs (no API call)",
    )
    pm.add_argument("--family", help="filter to a single family, e.g. flux, kling, llm")
    pm.add_argument("--json", action="store_true", help="emit JSON instead of a table")
    pm.set_defaults(func=cmd_models)

    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
