import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play, Pause, RotateCcw, RotateCw, SkipForward, SkipBack,
  Volume2, AlertCircle, Loader2, Globe
} from 'lucide-react';

export default function AudioPlayer({
  activeBook,
  activeChapter,
  audioLanguage,
  onChangeAudioLanguage,
  onNextChapter,
  onPrevChapter,
  onOpenReader,
  onChapterCompleted
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [audioError, setAudioError] = useState(null);

  const currentAudioUrl = activeChapter?.audioUrl?.[audioLanguage] || null;

  // Sync Audio Source when Chapter or Audio Language Changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setAudioError(null);

    if (!currentAudioUrl) {
      audio.pause();
      setIsPlaying(false);
      setAudioError(`${audioLanguage.toUpperCase()} audio is not yet available for this chapter.`);
      return;
    }

    const previousTime = audio.currentTime;
    audio.load();

    if (isPlaying) {
      setIsLoading(true);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (previousTime > 0) audio.currentTime = previousTime;
            setIsLoading(false);
          })
          .catch((err) => {
            console.warn('Playback error:', err);
            setIsPlaying(false);
            setIsLoading(false);
          });
      }
    }
  }, [activeChapter?.id, audioLanguage, currentAudioUrl]);

  // Audio Play/Pause Toggle with Safety
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentAudioUrl) {
      setAudioError(`${audioLanguage.toUpperCase()} audio is not available.`);
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      setAudioError(null);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch((err) => {
            console.error('Audio stream failure:', err);
            setIsPlaying(false);
            setIsLoading(false);
            setAudioError('Unable to connect to audio source.');
          });
      }
    }
  }, [isPlaying, currentAudioUrl, audioLanguage]);

  const handleSkip = (seconds) => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = Math.min(Math.max(audio.currentTime + seconds, 0), duration || 9999);
    audio.currentTime = target;
    setCurrentTime(target);
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    const nextSpeed = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeed(nextSpeed);
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
  };

  // Lockscreen MediaSession API Sync
  useEffect(() => {
    if ('mediaSession' in navigator && activeChapter && activeBook) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: activeChapter.title,
        artist: activeBook.author,
        album: `${activeBook.title} (${audioLanguage.toUpperCase()})`,
        artwork: [
          { src: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=512&q=80', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', togglePlay);
      navigator.mediaSession.setActionHandler('pause', togglePlay);
      navigator.mediaSession.setActionHandler('seekbackward', () => handleSkip(-15));
      navigator.mediaSession.setActionHandler('seekforward', () => handleSkip(15));
      navigator.mediaSession.setActionHandler('previoustrack', onPrevChapter);
      navigator.mediaSession.setActionHandler('nexttrack', onNextChapter);
    }
  }, [activeBook, activeChapter, audioLanguage, togglePlay, onPrevChapter, onNextChapter]);

  const formatSecs = (sec) => {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <footer className="fixed bottom-14 left-0 right-0 z-50 bg-surfaceGreen/95 backdrop-blur-2xl border-t border-goldPrimary/40 px-3 pt-2 pb-3 w-full max-w-md mx-auto shadow-2xl box-border">
      <audio
        ref={audioRef}
        src={currentAudioUrl || undefined}
        preload="metadata"
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
            setIsLoading(false);
          }
        }}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          setIsLoading(false);
          setIsPlaying(false);
          if (currentAudioUrl) setAudioError('Audio playback failed for this stream.');
        }}
        onEnded={() => {
          setIsPlaying(false);
          if (onChapterCompleted) onChapterCompleted(activeBook.id, activeChapter.id);
          onNextChapter();
        }}
      />

      {/* Honest Error/Notice Toast */}
      {audioError && (
        <div className="w-full mb-1.5 px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-700/60 text-[10px] text-red-200 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 truncate">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0"/>
            <span className="truncate">{audioError}</span>
          </div>
          <button onClick={() => setAudioError(null)} className="text-[10px] underline ml-1">Dismiss</button>
        </div>
      )}

      {/* Seek Track */}
      <div className="w-full flex items-center gap-2 text-[9px] font-mono text-mutedEmerald mb-1">
        <span className="shrink-0">{formatSecs(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={(e) => {
            const val = Number(e.target.value);
            setCurrentTime(val);
            if (audioRef.current) audioRef.current.currentTime = val;
          }}
          className="w-full h-1 bg-deepGreen rounded-lg appearance-none cursor-pointer accent-goldPrimary"
        />
        <span className="shrink-0">{formatSecs(duration)}</span>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-1">
        {/* Track Title + Click to Open Reader */}
        <div onClick={onOpenReader} className="flex-1 min-w-0 pr-1.5 cursor-pointer active:opacity-80">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-bold uppercase text-goldPrimary bg-goldPrimary/10 px-1.5 py-0.2 rounded border border-goldPrimary/30">
              {activeBook?.coverTag}
            </span>
            <h5 className="text-[11px] font-bold text-creamText truncate">{activeChapter?.title}</h5>
          </div>
          <p className="text-[9px] text-mutedEmerald font-urdu truncate mt-0.5" dir="rtl">{activeChapter?.titleUrdu}</p>
        </div>

        {/* Audio Language Switcher in Player */}
        {activeBook.audioLanguages.length > 1 && (
          <div className="flex items-center bg-deepGreen rounded-lg border border-borderGreen p-0.5 shrink-0">
            {activeBook.audioLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onChangeAudioLanguage(lang.code)}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition ${
                  audioLanguage === lang.code
                    ? 'bg-goldPrimary text-deepGreen shadow-sm'
                    : 'text-mutedEmerald hover:text-creamText'
                }`}
              >
                {lang.code.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={cycleSpeed}
            className="text-[9px] font-mono font-bold px-1 py-0.5 rounded bg-deepGreen border border-borderGreen text-goldPrimary active:scale-95"
          >
            {speed}x
          </button>

          <button onClick={() => handleSkip(-15)} className="p-1 text-mutedEmerald hover:text-creamText active:scale-90" title="Rewind 15s">
            <RotateCcw className="w-3.5 h-3.5"/>
          </button>

          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-8 h-8 bg-goldPrimary hover:bg-goldLight text-deepGreen rounded-xl flex items-center justify-center shadow-md active:scale-95 transition"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin"/>
            ) : isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-deepGreen"/>
            ) : (
              <Play className="w-3.5 h-3.5 translate-x-0.5 fill-deepGreen"/>
            )}
          </button>

          <button onClick={() => handleSkip(15)} className="p-1 text-mutedEmerald hover:text-creamText active:scale-90" title="Forward 15s">
            <RotateCw className="w-3.5 h-3.5"/>
          </button>

          <button onClick={onNextChapter} className="p-1 text-mutedEmerald hover:text-creamText active:scale-90" title="Next Chapter">
            <SkipForward className="w-3.5 h-3.5"/>
          </button>
        </div>
      </div>
    </footer>
  );
}
