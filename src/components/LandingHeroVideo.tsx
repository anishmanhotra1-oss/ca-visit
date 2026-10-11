'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  Upload,
  Video as VideoIcon,
  Sparkles,
} from 'lucide-react';

interface LandingHeroVideoProps {
  className?: string;
  defaultSrc?: string;
}

export default function LandingHeroVideo({
  className = '',
  defaultSrc = '/landing-video.mp4',
}: LandingHeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const candidateSources = [
    defaultSrc,
    '/landing-video.mp4',
    '/demo-video.mp4',
    '/video.mp4',
    '/demo.mp4',
    '/preview.mp4',
  ].filter((src, index, arr) => arr.indexOf(src) === index);

  const [candidateIndex, setCandidateIndex] = useState<number>(0);
  const [videoSrc, setVideoSrc] = useState<string>(candidateSources[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeout) clearTimeout(controlsTimeout);
    };
  }, [controlsTimeout]);

  // Initialize and attempt muted autoplay (required by modern mobile & desktop browsers)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    setIsMuted(true);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setHasError(false);
        })
        .catch((err) => {
          console.warn('Autoplay prevented or video not yet loaded:', err);
          setIsPlaying(false);
        });
    }
  }, [videoSrc]);

  // Handle Play/Pause toggle
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(console.error);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    triggerControlsFade();
  };

  // Handle Mute/Unmute toggle
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
    triggerControlsFade();
  };

  // Handle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(console.error);
    } else {
      document.exitFullscreen?.().catch(console.error);
    }
  };

  // Video progress updater
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  };

  // Handle error (try next candidate source before displaying fallback UI)
  const handleVideoError = () => {
    if (candidateIndex < candidateSources.length - 1) {
      const nextIdx = candidateIndex + 1;
      setCandidateIndex(nextIdx);
      setVideoSrc(candidateSources[nextIdx]);
    } else {
      console.warn('Hero video failed to load from all candidate sources.');
      setHasError(true);
      setIsLoaded(false);
    }
  };

  // Allow user to select a local video file directly for instant testing
  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setVideoSrc(objectUrl);
      setHasError(false);
      setIsLoaded(true);
    }
  };

  // Show controls on touch/hover and auto hide
  const triggerControlsFade = () => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 2800);
    setControlsTimeout(timeout);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-xl mx-auto lg:max-w-none group select-none ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onTouchStart={triggerControlsFade}
    >
      {/* Decorative ambient backlight glow (wine & gold tones matching SAANKALP brand) */}
      <div className="absolute -inset-1 sm:-inset-1.5 rounded-3xl sm:rounded-[2rem] bg-gradient-to-r from-rose-500/25 via-amber-400/20 to-[#800020]/40 blur-xl opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Main Glassmorphic Frame */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-white/20 via-white/10 to-black/40 backdrop-blur-xl border border-white/25 sm:border-white/30 p-1.5 sm:p-2.5 shadow-2xl shadow-rose-950/40 overflow-hidden">
        {/* Top Header Mockup Bar */}
        <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 bg-black/40 backdrop-blur-md rounded-t-xl sm:rounded-t-2xl border-b border-white/10 text-white text-xs">
          {/* Window control dots */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90 shadow-sm" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90 shadow-sm" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90 shadow-sm" />
            <span className="hidden sm:inline-block ml-2 text-[11px] font-semibold tracking-wide text-rose-100/80">
              CA-VISIT Platform Demo
            </span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold text-[10px] sm:text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE PREVIEW</span>
            </span>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="relative w-full aspect-video sm:aspect-[16/10] bg-zinc-950 rounded-b-xl sm:rounded-b-2xl overflow-hidden flex items-center justify-center">
          {!hasError ? (
            <>
              <video
                ref={videoRef}
                src={videoSrc}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                preload="auto"
                onLoadedData={() => {
                  setIsLoaded(true);
                  setHasError(false);
                }}
                onTimeUpdate={handleTimeUpdate}
                onError={handleVideoError}
                onClick={togglePlay}
                className="w-full h-full object-cover cursor-pointer"
              >
                {/* Fallback source elements if direct src fails */}
                <source src={videoSrc} type="video/mp4" />
                <source src="/landing-video.mp4" type="video/mp4" />
                <source src="/demo-video.mp4" type="video/mp4" />
                <source src="/video.mp4" type="video/mp4" />
                <source src="/demo.mp4" type="video/mp4" />
                Your browser does not support playing HTML5 video.
              </video>

              {/* Click-to-Play/Pause overlay center badge */}
              {!isPlaying && isLoaded && (
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label="Play Video"
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all"
                >
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white/90 hover:bg-white text-[#800020] flex items-center justify-center shadow-xl shadow-black/50 hover:scale-110 active:scale-95 transition-transform">
                    <Play className="h-7 w-7 fill-[#800020] ml-1 text-[#800020]" />
                  </div>
                </button>
              )}

              {/* Bottom sleek control bar & volume toggle (visible on hover / touch) */}
              <div
                className={`absolute inset-x-0 bottom-0 p-2.5 sm:p-3.5 bg-gradient-to-t from-black/85 via-black/50 to-transparent flex flex-col gap-2 transition-opacity duration-300 ${
                  showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto'
                }`}
              >
                {/* Progress bar */}
                <div className="w-full bg-white/20 h-1 sm:h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-rose-400 h-full rounded-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                      className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute}
                      aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white text-[11px] font-semibold"
                    >
                      {isMuted ? (
                        <>
                          <VolumeX className="h-3.5 w-3.5 text-rose-300" />
                          <span className="text-[10px] sm:text-xs">Unmute</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3.5 w-3.5 text-emerald-300" />
                          <span className="text-[10px] sm:text-xs">Sound On</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      aria-label="Fullscreen"
                      className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* User-Friendly Fallback / Instant Local Video Previewer */
            <div className="p-5 sm:p-6 text-center text-white flex flex-col items-center justify-center gap-3.5 w-full h-full bg-gradient-to-br from-[#2A0714] via-[#190D11] to-[#3B0E1E]">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
                <VideoIcon className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>

              <div className="space-y-1 max-w-sm">
                <h4 className="font-serif-display text-sm sm:text-base font-bold text-white">
                  Video Player Ready
                </h4>
                <p className="text-[11px] sm:text-xs text-rose-200/80 leading-relaxed">
                  Place your video file in the <code className="bg-white/15 px-1 py-0.5 rounded text-amber-200 font-mono">public/</code> folder as{' '}
                  <code className="bg-white/15 px-1 py-0.5 rounded text-amber-200 font-mono">landing-video.mp4</code> or <code className="bg-white/15 px-1 py-0.5 rounded text-amber-200 font-mono">demo-video.mp4</code>.
                </p>
              </div>

              {/* Instant Local Preview Option */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 text-[#800020] text-xs font-bold hover:brightness-105 active:scale-95 transition-all shadow-md">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Select Video to Preview</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    onChange={handleLocalFileSelect}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setHasError(false);
                    setCandidateIndex(0);
                    setVideoSrc(candidateSources[0] + '?t=' + Date.now());
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
