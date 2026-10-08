import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { LOFI_STATIONS } from '../engine/lofiStations';

export const LofiBackgroundPlayer: React.FC = () => {
  const { activeLofiStation, isPlayingLofi, lofiVolume } = useAppStore();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const fallbackAudioRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const station = LOFI_STATIONS[activeLofiStation] || LOFI_STATIONS.study;

  // Send command to YouTube iframe via postMessage API
  const sendCommand = (func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      } catch (e) {
        // ignore
      }
    }
  };

  // Update volume in both YouTube iframe and Web Audio fallback
  useEffect(() => {
    sendCommand('setVolume', [lofiVolume]);
    if (gainNodeRef.current) {
      try {
        gainNodeRef.current.gain.value = (lofiVolume / 100) * 0.08;
      } catch (e) {
        // ignore
      }
    }
  }, [lofiVolume]);

  // Handle Play / Pause & Station changes
  useEffect(() => {
    if (isPlayingLofi) {
      stopFallbackAudio();
      sendCommand('playVideo');
      sendCommand('setVolume', [lofiVolume]);
    } else {
      sendCommand('pauseVideo');
      stopFallbackAudio();
    }
  }, [isPlayingLofi, activeLofiStation, lofiVolume]);

  // Web Audio Fallback Ambient Generator (Relaxing Pink/Brown Noise + Soft Tones)
  const playFallbackAudio = () => {
    try {
      if (!fallbackAudioRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        fallbackAudioRef.current = ctx;

        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 2.5;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 300;

        const gainNode = ctx.createGain();
        gainNode.gain.value = (lofiVolume / 100) * 0.08;
        gainNodeRef.current = gainNode;

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        whiteNoise.start();
      } else if (fallbackAudioRef.current.state === 'suspended') {
        fallbackAudioRef.current.resume();
      }
    } catch (e) {
      // ignore
    }
  };

  const stopFallbackAudio = () => {
    try {
      if (fallbackAudioRef.current) {
        fallbackAudioRef.current.close();
        fallbackAudioRef.current = null;
        gainNodeRef.current = null;
      }
    } catch (e) {
      // ignore
    }
  };

  // Ensure audio resources are released when unmounting
  useEffect(() => {
    return () => {
      stopFallbackAudio();
    };
  }, []);

  // Safe YouTube embed URL with loop and playlist
  const embedUrl = `https://www.youtube-nocookie.com/embed/${station.youtubeId}?enablejsapi=1&autoplay=${isPlayingLofi ? 1 : 0}&playsinline=1&controls=0&disablekb=1&loop=1&playlist=${station.youtubeId}`;

  return (
    <div 
      className="fixed -bottom-96 -right-96 w-1 h-1 opacity-0 pointer-events-none overflow-hidden" 
      aria-hidden="true"
    >
      <iframe
        ref={iframeRef}
        key={`${station.youtubeId}-${isPlayingLofi ? 'play' : 'pause'}`}
        src={embedUrl}
        title="Lofi Background Stream"
        allow="autoplay; encrypted-media; picture-in-picture"
        className="w-1 h-1 border-0"
        onLoad={() => {
          if (isPlayingLofi) {
            sendCommand('playVideo');
            sendCommand('setVolume', [lofiVolume]);
          }
        }}
        onError={() => playFallbackAudio()}
      />
    </div>
  );
};
