export type Locale = "en" | "pt";

export type Strings = {
  intro: {
    taglinePrefix: string;
    taglineCli: string;
    taglineMid: string;
    taglineEnd: string;
  };
  whatIsIt: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cards: { title: string; subtitle: string }[];
  };
  install: {
    eyebrow: string;
    title: string;
    logs: string[];
    steps: string[];
  };
  configure: {
    eyebrow: string;
    title: string;
    subtitle: string;
    optionalComment: string;
    tipLabel: string;
    tipBody: string;
  };
  cliTour: {
    eyebrow: string;
    title: string;
    terminalTitle: string;
    completedNote: string;
  };
  models: {
    eyebrow: string;
    title: string;
    subtitle: string;
    families: { image: string; video: string; audio: string; "3d": string; llm: string };
  };
  workflow: {
    eyebrow: string;
    title: string;
    subtitle: string;
    steps: { title: string; detail: string }[];
  };
  agents: {
    eyebrow: string;
    title: string;
    subtitle: string;
    others: string;
  };
  outro: {
    eyebrow: string;
    titleMain: string;
    titleAccent: string;
    footer: string;
  };
};

export const en: Strings = {
  intro: {
    taglinePrefix: "One ",
    taglineCli: "CLI",
    taglineMid: ". 14+ AI models. ",
    taglineEnd: "Any agent.",
  },
  whatIsIt: {
    eyebrow: "What is it",
    title: "One skill, every agent.",
    subtitle:
      "The same CLI plugs into Claude Code, Codex, Cursor, Hermes, Copilot, and any agent that follows the AGENTS.md standard.",
    cards: [
      {
        title: "Images",
        subtitle: "Midjourney · Flux · Gemini Nano Banana · Faceswap",
      },
      {
        title: "Videos",
        subtitle: "Kling · Luma · Veo 3 · Hailuo · Hunyuan · Seedance",
      },
      {
        title: "Audio + LLM",
        subtitle: "Suno · F5-TTS · MMAudio · OpenAI-compat gateway",
      },
    ],
  },
  install: {
    eyebrow: "Step 1",
    title: "One-liner install",
    logs: [
      "→ provisioning venv at ~/.local/share/piapi-skill",
      "→ installing piapi-cli into ~/.local/bin",
      "→ copying SKILL.md to Claude · Codex · Cursor · Hermes",
    ],
    steps: [
      "Provisions Python 3.10+ virtualenv",
      "Installs piapi-cli on your PATH",
      "Drops SKILL.md into each agent",
    ],
  },
  configure: {
    eyebrow: "Step 2",
    title: "Set your API key",
    subtitle:
      "Grab one at piapi.ai/workspace/key and export it as PIAPI_API_KEY.",
    optionalComment: "# optional",
    tipLabel: "Tip:",
    tipBody:
      "persist the key in your shell rc so it never lands in command history.",
  },
  cliTour: {
    eyebrow: "Step 3",
    title: "Command tour",
    terminalTitle: "piapi-cli — playground",
    completedNote:
      "→ task_id: mj_01HZ… status: pending → processing → completed ✓",
  },
  models: {
    eyebrow: "Catalog",
    title: "14+ supported families",
    subtitle:
      "Image, video, music, 3D and LLMs through the same envelope: model + task_type + input.",
    families: { image: "image", video: "video", audio: "audio", "3d": "3d", llm: "llm" },
  },
  workflow: {
    eyebrow: "Flow",
    title: "Async-only. Always.",
    subtitle:
      "Every media job rides the same envelope. The LLM gateway is the only sync surface.",
    steps: [
      { title: "Submit", detail: "model + task_type + input" },
      { title: "Poll / Wait", detail: "status: pending → processing → completed" },
      { title: "Result", detail: "image · video · audio · text" },
    ],
  },
  agents: {
    eyebrow: "Plug & play",
    title: "Works with your favorite agent",
    subtitle: "The installer detects each host and drops the right SKILL.md.",
    others: "Others",
  },
  outro: {
    eyebrow: "⚡ Next step",
    titleMain: "Start ",
    titleAccent: "now.",
    footer: "MIT License · Wesley Simplicio · 2026",
  },
};

export const pt: Strings = {
  intro: {
    taglinePrefix: "Um ",
    taglineCli: "CLI",
    taglineMid: ". 14+ modelos de IA. ",
    taglineEnd: "Qualquer agent.",
  },
  whatIsIt: {
    eyebrow: "O que é",
    title: "Uma skill, todos os agents.",
    subtitle:
      "A mesma CLI conecta Claude Code, Codex, Cursor, Hermes, Copilot e qualquer agent que respeite o padrão AGENTS.md.",
    cards: [
      {
        title: "Imagens",
        subtitle: "Midjourney · Flux · Gemini Nano Banana · Faceswap",
      },
      {
        title: "Vídeos",
        subtitle: "Kling · Luma · Veo 3 · Hailuo · Hunyuan · Seedance",
      },
      {
        title: "Áudio + LLM",
        subtitle: "Suno · F5-TTS · MMAudio · gateway OpenAI-compat",
      },
    ],
  },
  install: {
    eyebrow: "Passo 1",
    title: "Instalação em uma linha",
    logs: [
      "→ provisionando venv em ~/.local/share/piapi-skill",
      "→ instalando piapi-cli em ~/.local/bin",
      "→ copiando SKILL.md para Claude · Codex · Cursor · Hermes",
    ],
    steps: [
      "Cria virtualenv Python 3.10+",
      "Instala piapi-cli no PATH",
      "Distribui SKILL.md para os agents",
    ],
  },
  configure: {
    eyebrow: "Passo 2",
    title: "Configure sua API key",
    subtitle:
      "Pegue em piapi.ai/workspace/key e exporte na variável PIAPI_API_KEY.",
    optionalComment: "# opcional",
    tipLabel: "Dica:",
    tipBody:
      "persista a chave no shell rc para não vazar em histórico de comandos.",
  },
  cliTour: {
    eyebrow: "Passo 3",
    title: "Tour pelos comandos",
    terminalTitle: "piapi-cli — playground",
    completedNote:
      "→ task_id: mj_01HZ… status: pending → processing → completed ✓",
  },
  models: {
    eyebrow: "Catálogo",
    title: "Mais de 14 famílias suportadas",
    subtitle:
      "Imagem, vídeo, música, 3D e LLMs no mesmo envelope: model + task_type + input.",
    families: { image: "image", video: "video", audio: "audio", "3d": "3d", llm: "llm" },
  },
  workflow: {
    eyebrow: "Fluxo",
    title: "Async-only. Sempre.",
    subtitle:
      "Todo job de mídia passa pelo mesmo envelope. O LLM gateway é a única superfície síncrona.",
    steps: [
      { title: "Submit", detail: "model + task_type + input" },
      { title: "Poll / Wait", detail: "status: pending → processing → completed" },
      { title: "Result", detail: "imagem · vídeo · áudio · texto" },
    ],
  },
  agents: {
    eyebrow: "Plug & play",
    title: "Funciona com seu agent favorito",
    subtitle: "O instalador detecta e copia a SKILL.md certa para cada host.",
    others: "Outros",
  },
  outro: {
    eyebrow: "⚡ Próximo passo",
    titleMain: "Comece ",
    titleAccent: "agora.",
    footer: "MIT License · Wesley Simplicio · 2026",
  },
};

export const strings: Record<Locale, Strings> = { en, pt };
