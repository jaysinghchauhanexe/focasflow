import { MLCEngine, InitProgressReport, hasModelInCache } from '@mlc-ai/web-llm';

export interface InAppModelMeta {
  id: string;
  name: string;
  company: string;
  size: string;
  sizeBytesApprox: number;
  tagline: string;
  huggingFaceRepo: string;
  isRecommended?: boolean;
}

export const SUPPORTED_IN_APP_MODELS: InAppModelMeta[] = [
  {
    id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 1.5B (Recommended)',
    company: 'Alibaba',
    size: '950 MB',
    sizeBytesApprox: 950 * 1024 * 1024,
    tagline: 'Fastest initialization, excellent JSON extraction & schedule planning.',
    huggingFaceRepo: 'mlc-ai/Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    isRecommended: true,
  },
  {
    id: 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 Coder 1.5B',
    company: 'Alibaba',
    size: '950 MB',
    sizeBytesApprox: 950 * 1024 * 1024,
    tagline: 'High strictness for deterministic structured operations.',
    huggingFaceRepo: 'mlc-ai/Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC',
  },
  {
    id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 1B',
    company: 'Meta',
    size: '880 MB',
    sizeBytesApprox: 880 * 1024 * 1024,
    tagline: 'Ultra-lightweight edge model by Meta.',
    huggingFaceRepo: 'mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC',
  },
  {
    id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 3B',
    company: 'Meta',
    size: '2.0 GB',
    sizeBytesApprox: 2000 * 1024 * 1024,
    tagline: 'High conversational reasoning and complex multi-tasking.',
    huggingFaceRepo: 'mlc-ai/Llama-3.2-3B-Instruct-q4f16_1-MLC',
  },
  {
    id: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC',
    name: 'SmolLM2 1.7B',
    company: 'Hugging Face',
    size: '1.0 GB',
    sizeBytesApprox: 1000 * 1024 * 1024,
    tagline: 'Specialized small language model optimized for rapid local inference.',
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

export const IN_APP_MODELS = SUPPORTED_IN_APP_MODELS;
export type InAppModel = InAppModelMeta;

let globalEngine: MLCEngine | null = null;
let currentLoadedModelId: string | null = null;
let inFlightModelLoad: { modelId: string; promise: Promise<MLCEngine> } | null = null;

export const isWebGPUSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
};

export async function checkModelCached(modelId: string): Promise<boolean> {
  try {
    const inCache = await hasModelInCache(modelId);
    const downloadedMap = JSON.parse(localStorage.getItem('focusflow_downloaded_models') || '{}');
    if (inCache) {
      downloadedMap[modelId] = true;
      localStorage.setItem('focusflow_downloaded_models', JSON.stringify(downloadedMap));
      return true;
    } else {
      // If cache inspection confirmed it's NOT in cache, clear any stale local storage flag
      if (downloadedMap[modelId]) {
        delete downloadedMap[modelId];
        localStorage.setItem('focusflow_downloaded_models', JSON.stringify(downloadedMap));
      }
      return false;
    }
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

    // Unload active engine if this model was loaded
    if (currentLoadedModelId === modelId && globalEngine) {
      try {
        await globalEngine.unload?.();
      } catch {}
      globalEngine = null;
      currentLoadedModelId = null;
    }

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

  // If a load for the same model is already in flight, reuse its promise
  if (inFlightModelLoad && inFlightModelLoad.modelId === modelId) {
    return inFlightModelLoad.promise;
  }

  const loadPromise = (async () => {
    // If switching models, cleanly dispose of previous engine
    if (globalEngine && currentLoadedModelId !== modelId) {
      try {
        await globalEngine.unload?.();
      } catch {}
      globalEngine = null;
      currentLoadedModelId = null;
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
    } catch {}

    return engine;
  })();

  inFlightModelLoad = { modelId, promise: loadPromise };

  try {
    const res = await loadPromise;
    return res;
  } finally {
    if (inFlightModelLoad?.modelId === modelId) {
      inFlightModelLoad = null;
    }
  }
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
