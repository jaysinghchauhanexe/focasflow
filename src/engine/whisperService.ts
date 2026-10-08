import { pipeline, env } from '@xenova/transformers';

// Configure Transformers.js to load local bundled models from public/models/
env.allowLocalModels = true;
env.allowRemoteModels = true;
env.localModelPath = '/models/';
env.useBrowserCache = true;

// Prevent SharedArrayBuffer lockups in single-origin / Tauri environments
if (env.backends?.onnx?.wasm) {
  env.backends.onnx.wasm.numThreads = 1;
}

export const WHISPER_MODEL_NAME = 'whisper-base.en';

let transcriberPromise: Promise<any> | null = null;
let transcriberInstance: any = null;
let isModelPreloaded = false;

/**
 * Purge old legacy Whisper Tiny model files from browser CacheStorage
 */
export async function purgeOldWhisperCache(): Promise<void> {
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const keys = await caches.keys();
      for (const key of keys) {
        if (key.includes('transformers') || key.includes('xenova')) {
          const cache = await caches.open(key);
          const requests = await cache.keys();
          for (const req of requests) {
            if (req.url.includes('whisper-tiny')) {
              await cache.delete(req);
              console.log('Deleted legacy Whisper Tiny cache:', req.url);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not clear legacy whisper cache:', e);
    }
  }
}

// Purge legacy tiny model in the background
if (typeof window !== 'undefined') {
  purgeOldWhisperCache().catch(() => {});
}

/**
 * Preload and cache Whisper Base model in background from local bundled models
 */
export async function getWhisperTranscriber(
  onProgress?: (report: { status: string; progress?: number; file?: string; loaded?: number; total?: number }) => void
): Promise<any> {
  if (transcriberInstance) return transcriberInstance;

  if (!transcriberPromise) {
    transcriberPromise = pipeline('automatic-speech-recognition', WHISPER_MODEL_NAME, {
      progress_callback: onProgress,
    })
      .then((t) => {
        transcriberInstance = t;
        isModelPreloaded = true;
        return t;
      })
      .catch(async (err) => {
        console.warn('Local bundled model load failed, falling back to remote Hugging Face:', err);
        // Fallback to Hugging Face CDN if local assets cannot be served in certain deployment modes
        try {
          const fallback = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base.en', {
            progress_callback: onProgress,
          });
          transcriberInstance = fallback;
          isModelPreloaded = true;
          return fallback;
        } catch (fallbackErr) {
          transcriberPromise = null;
          console.error('Whisper pipeline loading error:', fallbackErr);
          throw fallbackErr;
        }
      });
  }

  return transcriberPromise;
}

export function isWhisperReady(): boolean {
  return isModelPreloaded && transcriberInstance !== null;
}

/**
 * Fast, accurate linear audio resampler to 16,000 Hz Mono Float32
 */
function resampleTo16kHz(input: Float32Array, sourceRate: number): Float32Array {
  if (sourceRate === 16000) {
    return input;
  }

  const ratio = sourceRate / 16000;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const srcIndex = i * ratio;
    const i0 = Math.floor(srcIndex);
    const i1 = Math.min(i0 + 1, input.length - 1);
    const frac = srcIndex - i0;
    output[i] = input[i0] * (1 - frac) + input[i1] * frac;
  }

  return output;
}

let audioCtx: AudioContext | null = null;
let mediaStream: MediaStream | null = null;
let sourceNode: MediaStreamAudioSourceNode | null = null;
let highpassNode: BiquadFilterNode | null = null;
let lowpassNode: BiquadFilterNode | null = null;
let processorNode: ScriptProcessorNode | null = null;
let muteGainNode: GainNode | null = null;
let pcmBuffer: Float32Array[] = [];

/**
 * Start direct Float32 PCM recording from microphone with vocal isolation
 */
export async function startWhisperRecording(): Promise<void> {
  // Clean up any previous session
  cancelWhisperRecording();

  // Trigger background model load if not started
  getWhisperTranscriber().catch(() => {});

  pcmBuffer = [];

  // Request microphone access with aggressive echo cancellation and noise suppression
  mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      // Chromium extended acoustic isolation constraints
      googEchoCancellation: true,
      googEchoCancellation2: true,
      googDAEchoCancellation: true,
      googNoiseSuppression: true,
      googNoiseSuppression2: true,
      googHighpassFilter: true,
      googTypingNoiseDetection: true,
    } as MediaTrackConstraints,
  });

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  audioCtx = new AudioContextClass();

  if (audioCtx.state !== 'running') {
    await audioCtx.resume();
  }

  sourceNode = audioCtx.createMediaStreamSource(mediaStream);

  // Vocal bandpass filter (80Hz to 7800Hz):
  // Strips desktop music sub-bass, kick drums, and table thumps while preserving crisp speech sibilants (s, th, ch)
  highpassNode = audioCtx.createBiquadFilter();
  highpassNode.type = 'highpass';
  highpassNode.frequency.value = 80;
  highpassNode.Q.value = 0.707;

  lowpassNode = audioCtx.createBiquadFilter();
  lowpassNode.type = 'lowpass';
  lowpassNode.frequency.value = 7800;
  lowpassNode.Q.value = 0.707;

  processorNode = audioCtx.createScriptProcessor(4096, 1, 1);

  // Bound recording to ~60s maximum to prevent runaway memory consumption
  const MAX_PCM_CHUNKS = 1200;
  processorNode.onaudioprocess = (e) => {
    if (pcmBuffer.length >= MAX_PCM_CHUNKS) return;
    const channelData = e.inputBuffer.getChannelData(0);
    const copy = new Float32Array(channelData.length);
    copy.set(channelData);
    pcmBuffer.push(copy);
  };

  // Connect DSP chain: mic -> highpass -> lowpass -> processor -> microGain -> destination
  sourceNode.connect(highpassNode);
  highpassNode.connect(lowpassNode);
  lowpassNode.connect(processorNode);

  // Use non-zero micro-gain (0.00001) so Chromium never suspends onaudioprocess for silence optimization
  muteGainNode = audioCtx.createGain();
  muteGainNode.gain.value = 0.00001;
  processorNode.connect(muteGainNode);
  muteGainNode.connect(audioCtx.destination);
}

/**
 * Stop recording and run on-device Whisper Base inference directly on captured PCM
 */
export async function stopWhisperRecordingAndTranscribe(
  onProgress?: (report: { status: string; progress?: number; file?: string }) => void
): Promise<string> {
  // 1. Snapshot all recorded chunks and sample rate BEFORE disconnecting
  const recordedChunks = [...pcmBuffer];
  const sampleRate = audioCtx?.sampleRate || 44100;

  // 2. Immediately release hardware and reset graph
  cancelWhisperRecording();

  if (recordedChunks.length === 0) {
    console.warn('No PCM audio chunks captured.');
    return '';
  }

  // 3. Merge all PCM chunks into single Float32 buffer
  const totalLength = recordedChunks.reduce((acc, chunk) => acc + chunk.length, 0);
  if (totalLength === 0) return '';

  const rawFloat32 = new Float32Array(totalLength);
  let offset = 0;
  for (const chunk of recordedChunks) {
    rawFloat32.set(chunk, offset);
    offset += chunk.length;
  }

  // 4. Resample from hardware rate (44.1kHz / 48kHz) to 16kHz for Whisper
  const audio16k = resampleTo16kHz(rawFloat32, sampleRate);

  // 5. Calculate Root Mean Square (RMS) energy & peak to detect actual human speech
  let sumSq = 0;
  let maxAbs = 0;
  for (let i = 0; i < audio16k.length; i++) {
    const val = audio16k[i];
    sumSq += val * val;
    const abs = Math.abs(val);
    if (abs > maxAbs) maxAbs = abs;
  }
  const rms = Math.sqrt(sumSq / audio16k.length);

  // If signal is essentially pure silence or faint background ambience, return early
  if (maxAbs < 0.008 || rms < 0.0015) {
    console.log('Audio energy below human speech threshold (background bleed ignored).');
    return '';
  }

  // Moderate normalization: prevent quiet background bleed from being over-boosted
  if (maxAbs > 0.015) {
    const gain = Math.min(3.5, 0.95 / maxAbs);
    for (let i = 0; i < audio16k.length; i++) {
      audio16k[i] *= gain;
    }
  }

  // 6. Run Whisper Base on-device inference (English-only model: do NOT pass language/task options)
  const transcriber = await getWhisperTranscriber(onProgress);
  const result = await transcriber(audio16k, {
    return_timestamps: false,
  });

  const text = (result?.text || '').trim();
  console.log('Whisper transcription output:', text);
  return text;
}

/**
 * Cancel active recording and release microphone hardware
 */
export function cancelWhisperRecording(): void {
  if (processorNode) {
    try {
      processorNode.disconnect();
    } catch {}
    processorNode = null;
  }

  if (lowpassNode) {
    try {
      lowpassNode.disconnect();
    } catch {}
    lowpassNode = null;
  }

  if (highpassNode) {
    try {
      highpassNode.disconnect();
    } catch {}
    highpassNode = null;
  }

  if (sourceNode) {
    try {
      sourceNode.disconnect();
    } catch {}
    sourceNode = null;
  }

  if (muteGainNode) {
    try {
      muteGainNode.disconnect();
    } catch {}
    muteGainNode = null;
  }

  if (mediaStream) {
    try {
      mediaStream.getTracks().forEach((track) => track.stop());
    } catch {}
    mediaStream = null;
  }

  if (audioCtx) {
    try {
      audioCtx.close();
    } catch {}
    audioCtx = null;
  }

  pcmBuffer = [];
}
