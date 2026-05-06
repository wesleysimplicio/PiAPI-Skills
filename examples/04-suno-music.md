# 04 · Suno music generation

PiAPI exposes Suno (and Udio) under the `music-u` model. Use
`generate_music` for prompt-only flows and `generate_music_custom` when you
want to pin lyrics, style, and title.

## Shell — prompt mode

```bash
piapi-cli suno \
  --prompt "warm lo-fi hip hop, vinyl crackle, mellow bass" \
  --custom-mode false \
  --make-instrumental false \
  --wait
```

## Shell — custom mode (lyrics pinned)

```bash
piapi-cli suno \
  --prompt "indie folk, acoustic guitar, soft female vocal" \
  --custom-mode true \
  --title "Riverbend" \
  --tags "indie folk, acoustic, mellow" \
  --lyrics "Down by the river / where the willows bend / I waited for the morning..." \
  --wait
```

## Raw envelope — generate_music

```bash
piapi-cli submit --model music-u --task-type generate_music \
  --input '{
    "gpt_description_prompt": "warm lo-fi hip hop, vinyl crackle, mellow bass",
    "make_instrumental": false
  }'
```

## Raw envelope — generate_music_custom

```bash
piapi-cli submit --model music-u --task-type generate_music_custom \
  --input '{
    "title": "Riverbend",
    "tags": "indie folk, acoustic, mellow",
    "prompt": "Down by the river / where the willows bend / I waited for the morning..."
  }'
```

## Extend a track

```bash
piapi-cli submit --model music-u --task-type extend \
  --input '{
    "origin_task_id": "<previous task_id>",
    "continue_at": 30
  }'
```

`continue_at` is the timestamp (seconds) on the original track where the
extension should begin.

## Concat / stitch

```bash
piapi-cli submit --model music-u --task-type concat \
  --input '{
    "task_ids": ["<task_id_1>", "<task_id_2>"]
  }'
```

## Add lyrics

```bash
piapi-cli submit --model music-u --task-type add_lyrics \
  --input '{
    "audio_url": "https://example.com/instrumental.mp3",
    "lyrics": "..."
  }'
```

## Output shape

A successful Suno task returns up to two clip variants in
`data.output.clips[]` with `audio_url`, `image_url` (cover art), `video_url`,
`title`, `lyrics`, and `duration`. Pick `clips[0]` if you only need one.

## Notes

- Suno status is lowercase: `pending | starting | processing | success |
  failed | retry`.
- The model returns two variants per generation; the cost reflects that.
- Lyrics over ~3 minutes get truncated server-side. For longer pieces, chain
  `extend`.
