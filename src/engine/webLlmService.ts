import { MLCEngine, InitProgressReport, hasModelInCache } from '@mlc-ai/web-llm';

export interface InAppModel {
  id: string;
  name: string;
  company: 'Alibaba' | 'Meta' | 'SmolLM' | 'Google' | 'Microsoft';
  size: string;
  sizeBytesApprox: number;
  isRecommended?: boolean;
  tagline: string;
  huggingFaceRepo: string;
}

export const IN_APP_MODELS: InAppModel[] = [
  {
    id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 1.5B',
    company: 'Alibaba',
    size: '980 MB',
    sizeBytesApprox: 980 * 1024 * 1024,
    isRecommended: true,
    tagline: 'Top recommended. Flawless structured JSON & task scheduling.',
    huggingFaceRepo: 'mlc-ai/Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
  },
  {
    id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 0.5B',
    company: 'Alibaba',
    size: '390 MB',
    sizeBytesApprox: 390 * 1024 * 1024,
    tagline: 'Ultra-lightweight micro model. Instant downloads and low memory.',
    huggingFaceRepo: 'mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
  },
  {
    id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 1B',
    company: 'Meta',
    size: '880 MB',
    sizeBytesApprox: 880 * 1024 * 1024,
    isRecommended: true,
    tagline: "Meta's efficient reasoning model. Great tool use & instruction following.",
    huggingFaceRepo: 'mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC',
  },
  {
    id: 'SmolLM2-360M-Instruct-q4f16_1-MLC',
    name: 'SmolLM 2 360M',
    company: 'SmolLM',
    size: '230 MB',
    sizeBytesApprox: 230 * 1024 * 1024,
    tagline: 'Tiny 230MB model by HuggingFace. Runs virtually anywhere.',
    huggingFaceRepo: 'mlc-ai/SmolLM2-360M-Instruct-q4f16_1-MLC',
  },
  {
    id: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC',
    name: 'SmolLM 2 1.7B',
    company: 'SmolLM',
    size: '1.0 GB',
    sizeBytesApprox: 1024 * 1024 * 1024,
    tagline: 'High quality on-device reasoning from HuggingFace.',
    huggingFaceRepo: 'mlc-ai/SmolLM2-1.7B-Instruct-q4f16_1-MLC',
  },
  {
    id: 'gemma-2-2b-it-q4f16_1-MLC',
    name: 'Gemma 2 2B',
    company: 'Google',
    size: '1.6 GB',
    sizeBytesApprox: 1600 * 1024 * 1024,
    tagline: "Google's lightweight model tuned for assistant dialogues.",
    huggingFaceRepo: 'mlc-ai/gemma-2-2b-it-q4f16_1-MLC',
  },
  {
    id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
    name: 'Phi 3.5 Mini',
    company: 'Microsoft',
    size: '2.2 GB',
    sizeBytesApprox: 2200 * 1024 * 1024,
    tagline: 'Strong logical reasoning and constraint satisfaction.',
    huggingFaceRepo: 'mlc-ai/Phi-3.5-mini-instruct-q4f16_1-MLC',
  },
];

let globalEngine: MLCEngine | null = null;
let currentLoadedModelId: string | null = null;

export const isWebGPUSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
};

export async function checkModelCached(modelId: string): Promise<boolean> {
  try {
    const inCache = await hasModelInCache(modelId);
    if (inCache) {
      try {
        const downloadedMap = JSON.parse(localStorage.getItem('focusflow_downloaded_models') || '{}');
        downloadedMap[modelId] = true;
        localStorage.setItem('focusflow_downloaded_models', JSON.stringify(downloadedMap));
      } catch {}
      return true;
    }
    const downloadedMap = JSON.parse(localStorage.getItem('focusflow_downloaded_models') || '{}');
    if (downloadedMap[modelId]) return true;

    return false;
  } catch {
    const downloadedMap = JSON.parse(localStorage.getItem('focusflow_downloaded_models') || '{}');
    return !!downloadedMap[modelId];
  }
}

export async function deleteInAppModelCached(modelId: string): Promise<void> {
  try {
    const downloadedMap = JSON.parse(localStorage.getItem('focusflow_downloaded_models') || '{}');
    delete downloadedMap[modelId];
    localStorage.setItem('focusflow_downloaded_models', JSON.stringify(downloadedMap));

    // Delete from CacheStorage
    if (typeof window !== 'undefined' && 'caches' in window) {
      const cacheKeys = await window.caches.keys();
      for (const key of cacheKeys) {
        if (key.includes(modelId)) {
          await window.caches.delete(key);
        } else {
          try {
            const cache = await window.caches.open(key);
            const requests = await cache.keys();
            for (const req of requests) {
              if (req.url.includes(modelId)) {
                await cache.delete(req);
              }
            }
          } catch {}
        }
      }
    }

    // Delete from IndexedDB if model stored in indexedDB
    if (typeof window !== 'undefined' && 'indexedDB' in window && 'databases' in indexedDB) {
      try {
        const dbs = await indexedDB.databases();
        for (const db of dbs) {
          if (db.name && db.name.includes(modelId)) {
            indexedDB.deleteDatabase(db.name);
          }
        }
      } catch {}
    }

    if (currentLoadedModelId === modelId) {
      globalEngine = null;
      currentLoadedModelId = null;
    }
  } catch (err) {
    console.warn('Error deleting in-app model cache:', err);
  }
}

export async function loadInAppModel(
  modelId: string,
  onProgress?: (report: InitProgressReport) => void
): Promise<MLCEngine> {
  if (globalEngine && currentLoadedModelId === modelId) {
    return globalEngine;
  }

  const engine = new MLCEngine();
  if (onProgress) {
    engine.setInitProgressCallback(onProgress);
  }

  await engine.reload(modelId);
  globalEngine = engine;
  currentLoadedModelId = modelId;

  // Persist that this model is active & downloaded
  try {
    const downloadedMap = JSON.parse(localStorage.getItem('focusflow_downloaded_models') || '{}');
    downloadedMap[modelId] = true;
    localStorage.setItem('focusflow_downloaded_models', JSON.stringify(downloadedMap));
  } catch (e) {
    // Local storage safe
  }

  return engine;
}

export function extractJsonFromText(rawText: string): any {
  if (!rawText) return null;
  const cleaned = rawText.trim();
  
  // 1. Direct parse
  try {
    return JSON.parse(cleaned);
  } catch {}

  // 2. Markdown fenced code block ```json { ... } ```
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {}
  }

  // 3. Substring between first { and last }
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose > firstOpen) {
    const jsonSub = cleaned.substring(firstOpen, lastClose + 1);
    try {
      return JSON.parse(jsonSub);
    } catch {}
  }

  return null;
}

export async function runInAppInference(
  modelId: string,
  userPrompt: string,
  systemPrompt: string,
  history: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<{ text: string; latencyMs: number }> {
  const startTime = performance.now();
  const engine = await loadInAppModel(modelId);

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-8).map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: userPrompt },
  ];

  const reply = await engine.chat.completions.create({
    messages,
    temperature: 0.1,
    max_tokens: 600,
  });

  const latencyMs = Math.round(performance.now() - startTime);
  const text = reply.choices[0]?.message?.content || '{}';
  return { text, latencyMs };
}
