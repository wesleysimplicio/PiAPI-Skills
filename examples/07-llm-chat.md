# 07 · LLM chat completion

PiAPI's LLM API at `POST /v1/chat/completions` is OpenAI-compatible. It is
the only synchronous surface on the platform — no task IDs, no polling — and
it supports streaming responses via SSE.

## Shell — single shot

```bash
piapi-cli llm --model gpt-4o-mini \
  --message 'system:You are concise.' \
  --message 'user:Summarize Stoicism in one sentence.'
```

## Shell — streaming

```bash
piapi-cli llm --model claude-3-5-sonnet --stream \
  --message 'user:Write a haiku about midnight in São Paulo.'
```

The CLI prints token deltas as they arrive.

## Raw request

```bash
curl -sS https://api.piapi.ai/v1/chat/completions \
  -H "x-api-key: $PIAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "system", "content": "You are concise."},
      {"role": "user",   "content": "Summarize Stoicism in one sentence."}
    ]
  }'
```

## Streaming — raw

```bash
curl -N https://api.piapi.ai/v1/chat/completions \
  -H "x-api-key: $PIAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "stream": true,
    "messages": [{"role":"user","content":"Hi"}]
  }'
```

## Python — using the OpenAI SDK against PiAPI

You can point the official OpenAI Python SDK at PiAPI's base URL and use
`PIAPI_API_KEY` as the bearer:

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.piapi.ai/v1",
    api_key=os.environ["PIAPI_API_KEY"],
)

resp = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are concise."},
        {"role": "user",   "content": "Summarize Stoicism in one sentence."},
    ],
)
print(resp.choices[0].message.content)
```

## Notes

- Token usage and pricing follow the upstream model — PiAPI just relays. Check
  per-model rates on the pricing page.
- Tool / function calling is supported when the underlying model supports it
  (OpenAI-flavored `tools`/`tool_choice` shape).
- This endpoint **does not** use the task envelope. It is sync, so no
  `task_id` is involved and no polling is required.
- For long generations, prefer `--stream` to avoid hitting client-side
  socket timeouts.
