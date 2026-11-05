import React, { useState, useRef, useEffect } from 'react';
import { chaptersData } from './data/chapters';
import { Play, Pause, SkipBack, SkipForward, BookOpen, Volume2, Search, Moon, Bookmark } from 'lucide-react';

export default function App() {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const audioRef = useRef(null);
  const activeChapter = chaptersData[currentChapterIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentChapterIndex]);

  const handlePlayChapter = (index) => {
    if (index === currentChapterIndex) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentChapterIndex(index);
      setIsPlaying(true);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const filteredChapters = chaptersData.filter(ch =>
    ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ch.titleUrdu.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-brand-dark text-brand-sand flex flex-col pb-28">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-brand-dark/95 backdrop-blur-md border-b border-brand-primary/40 px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-brand-gold flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Ar-Raheeq Al-Makhtum
          </h1>
          <p className="text-xs text-brand-sand/60">The Sealed Nectar • سیرت النبی ﷺ</p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-5 mt-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-brand-sand/40" />
          <input
            type="text"
            placeholder="Search chapters / ابواب تلاش کریں..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-card/80 border border-brand-primary/60 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-gold placeholder:text-brand-sand/40 text-brand-sand"
          />
        </div>
      </div>

      {/* Chapters List */}
      <main className="px-5 mt-6 flex-1 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-gold/80">Chapters</h2>
        {filteredChapters.map((ch, idx) => {
          const isSelected = currentChapterIndex === idx;
          return (
            <div
              key={ch.id}
              onClick={() => handlePlayChapter(idx)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-brand-primary border-brand-gold shadow-lg shadow-black/20'
                  : 'bg-brand-card/60 border-brand-primary/40 hover:bg-brand-card'
              }`}
            >
              <div className="flex-1 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-dark/60 text-brand-gold">
                    {String(ch.id).padStart(2, '0')}
                  </span>
                  <h3 className="text-sm font-semibold text-brand-sand">{ch.title}</h3>
                </div>
                <p className="text-xs text-brand-sand/50 mt-1 font-arabic" dir="rtl">{ch.titleUrdu}</p>
              </div>

              <button
                className={`p-2.5 rounded-full ${
                  isSelected && isPlaying
                    ? 'bg-brand-gold text-brand-dark'
                    : 'bg-brand-dark text-brand-gold'
                }`}
              >
                {isSelected && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.5" />}
              </button>
            </div>
          );
        })}
      </main>

      {/* Persistent Bottom Audio Player */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-brand-primary/95 backdrop-blur-lg border-t border-brand-gold/30 px-5 py-3 shadow-2xl">
        <audio
          ref={audioRef}
          src={activeChapter?.audioUrl}
          onTimeUpdate={onTimeUpdate}
          onEnded={() => {
            if (currentChapterIndex < chaptersData.length - 1) {
              setCurrentChapterIndex(prev => prev + 1);
            } else {
              setIsPlaying(false);
            }
          }}
        />

        {/* Progress Bar */}
        <div className="w-full flex items-center gap-3 text-[11px] text-brand-sand/60 mb-2">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-brand-dark rounded-lg appearance-none cursor-pointer accent-brand-gold"
          />
          <span>{formatTime(duration)}</span>
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-between">
          <div className="truncate max-w-[60%]">
            <h4 className="text-sm font-medium text-brand-sand truncate">{activeChapter?.title}</h4>
            <p className="text-xs text-brand-gold/80 truncate">{activeChapter?.titleUrdu}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentChapterIndex(prev => Math.max(0, prev - 1))}
              disabled={currentChapterIndex === 0}
              className="p-2 text-brand-sand/70 disabled:opacity-30"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 bg-brand-gold text-brand-dark rounded-full shadow-md active:scale-95 transition"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 translate-x-0.5" />}
            </button>

            <button
              onClick={() => setCurrentChapterIndex(prev => Math.min(chaptersData.length - 1, prev + 1))}
              disabled={currentChapterIndex === chaptersData.length - 1}
              className="p-2 text-brand-sand/70 disabled:opacity-30"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
