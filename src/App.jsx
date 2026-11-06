import React, { useState, useEffect } from 'react';
import { BOOKS } from './data/booksData';
import AudioPlayer from './components/AudioPlayer';
import ReaderView from './components/ReaderView';
import BottomNav from './components/BottomNav';
import {
  BookOpen, Search, Award, CheckCircle2, Play, Sparkles,
  Bookmark, ChevronRight, Library, Settings, Info
} from 'lucide-react';

export default function App() {
  // Navigation & Screen View States
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'books' | 'bookmarks' | 'settings'
  const [selectedBookId, setSelectedBookId] = useState('seerah');
  const [viewMode, setViewMode] = useState('home'); // 'home' | 'reader'
  
  // Chapter & Language States
  const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
    return Number(localStorage.getItem('lib_last_chapter_idx') || 0);
  });
  const [readingLanguage, setReadingLanguage] = useState(() => {
    return localStorage.getItem('lib_reading_lang') || 'en';
  });
  const [audioLanguage, setAudioLanguage] = useState(() => {
    return localStorage.getItem('lib_audio_lang') || 'en';
  });
  const [fontSize, setFontSize] = useState(() => {
    return Number(localStorage.getItem('lib_font_size') || 16);
  });

  // Independent Book Progress Tracking
  const [progressMap, setProgressMap] = useState(() => {
    const saved = localStorage.getItem('lib_progress_map');
    return saved ? JSON.parse(saved) : { seerah: [], 'fazail-e-amal': [] };
  });

  const [searchQuery, setSearchQuery] = useState('');

  const currentBook = BOOKS.find(b => b.id === selectedBookId) || BOOKS[0];
  const currentChapter = currentBook.chapters[currentChapterIndex] || currentBook.chapters[0];

  // Save State to LocalStorage
  useEffect(() => {
    localStorage.setItem('lib_last_book_id', selectedBookId);
    localStorage.setItem('lib_last_chapter_idx', currentChapterIndex);
    localStorage.setItem('lib_reading_lang', readingLanguage);
    localStorage.setItem('lib_audio_lang', audioLanguage);
    localStorage.setItem('lib_font_size', fontSize);
    localStorage.setItem('lib_progress_map', JSON.stringify(progressMap));
  }, [selectedBookId, currentChapterIndex, readingLanguage, audioLanguage, fontSize, progressMap]);

  // Handle Book Change
  const handleSelectBook = (bookId, targetMode = 'home') => {
    setSelectedBookId(bookId);
    setCurrentChapterIndex(0);
    const targetBook = BOOKS.find(b => b.id === bookId);
    if (!targetBook.readingLanguages.some(l => l.code === readingLanguage)) {
      setReadingLanguage(targetBook.readingLanguages[0].code);
    }
    if (!targetBook.audioLanguages.some(l => l.code === audioLanguage)) {
      setAudioLanguage(targetBook.audioLanguages[0].code);
    }
    setViewMode(targetMode);
  };

  const handleChapterCompleted = (bookId, chapterId) => {
    setProgressMap(prev => {
      const bookList = prev[bookId] || [];
      if (!bookList.includes(chapterId)) {
        return { ...prev, [bookId]: [...bookList, chapterId] };
      }
      return prev;
    });
  };

  const getBookProgressPercent = (bookId) => {
    const completed = progressMap[bookId]?.length || 0;
    const total = BOOKS.find(b => b.id === bookId)?.chapters.length || 1;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-screen bg-deepGreen text-creamText flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col min-h-screen relative px-3 sm:px-4 box-border">

        {/* ========================================================================= */}
        {/* VIEW: DEDICATED READER                                                    */}
        {/* ========================================================================= */}
        {viewMode === 'reader' && (
          <ReaderView
            book={currentBook}
            chapter={currentChapter}
            fontSize={fontSize}
            onBack={() => setViewMode('home')}
            onChangeFontSize={setFontSize}
            onChangeReadingLanguage={setReadingLanguage}
            readingLanguage={readingLanguage}
            onNext={() => setCurrentChapterIndex(prev => Math.min(currentBook.chapters.length - 1, prev + 1))}
            onPrev={() => setCurrentChapterIndex(prev => Math.max(0, prev - 1))}
            hasNext={currentChapterIndex < currentBook.chapters.length - 1}
            hasPrev={currentChapterIndex > 0}
          />
        )}

        {/* ========================================================================= */}
        {/* VIEW: HOME / DISCOVER TAB                                                 */}
        {/* ========================================================================= */}
        {viewMode !== 'reader' && activeTab === 'home' && (
          <div className="w-full flex-1 flex flex-col pb-44 animate-fadeIn box-border">
            {/* Top Navbar */}
            <header className="w-full pt-5 pb-3 flex items-center justify-between box-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-goldPrimary to-surfaceGreen flex items-center justify-center shadow-md">
                  <BookOpen className="w-4 h-4 text-deepGreen" />
                </div>
                <div>
                  <h1 className="font-serif text-sm tracking-wider uppercase font-bold text-goldLight">
                    Hikmah Library
                  </h1>
                  <span className="text-[9px] text-mutedEmerald">Islamic Audiobook & Reader</span>
                </div>
              </div>
              <div className="px-2.5 py-0.5 rounded-full bg-surfaceGreen border border-borderGreen text-[10px] text-goldPrimary flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-goldPrimary" /> 2 Books Available
              </div>
            </header>

            {/* Featured Book Showcase */}
            <section className="w-full mt-2 box-border space-y-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-mutedEmerald block px-1">
                Featured Books
              </span>

              {BOOKS.map((b) => {
                const progress = getBookProgressPercent(b.id);
                const isSelected = selectedBookId === b.id;

                return (
                  <div
                    key={b.id}
                    className={`w-full p-4 rounded-2xl bg-gradient-to-br from-surfaceGreen via-cardGreen to-deepGreen border transition-all box-border ${
                      isSelected ? 'border-goldPrimary shadow-xl' : 'border-borderGreen hover:border-goldPrimary/40'
                    }`}
                  >
                    <div className="flex gap-3.5 items-center w-full">
                      {/* Book Cover */}
                      <div className={`w-20 h-28 rounded-lg bg-gradient-to-br ${b.coverGradient} border border-goldPrimary/60 shadow-xl p-1.5 flex flex-col justify-between items-center text-center shrink-0`}>
                        <span className="text-[7px] text-goldPrimary">كتاب</span>
                        <div className="w-full">
                          <h4 className="font-serif text-[8px] font-bold text-goldLight uppercase tracking-tight line-clamp-1">{b.title}</h4>
                          <span className="text-[6px] text-creamText/70 tracking-tight block mt-0.5">{b.coverTag}</span>
                        </div>
                        <span className="text-[6px] text-goldPrimary/90 font-mono">Audio & Text</span>
                      </div>

                      {/* Book Details */}
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-bold text-goldPrimary uppercase tracking-wider block truncate">
                          {b.tagline}
                        </span>
                        <h2 className="text-sm font-bold text-white leading-tight truncate mt-0.5">
                          {b.title}
                        </h2>
                        <p className="text-[10px] text-goldLight font-arabic truncate">{b.arabicTitle}</p>
                        <p className="text-[10px] text-mutedEmerald truncate mt-0.5">{b.author}</p>

                        {/* Buttons */}
                        <div className="flex items-center gap-2 mt-3 w-full">
                          <button
                            onClick={() => {
                              setSelectedBookId(b.id);
                              setCurrentChapterIndex(0);
                              setViewMode('reader');
                            }}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-goldPrimary hover:bg-goldLight text-deepGreen text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition"
                          >
                            <BookOpen className="w-3 h-3" /> Read
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBookId(b.id);
                              setCurrentChapterIndex(0);
                            }}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-surfaceGreen border border-goldPrimary/40 text-goldLight hover:text-white text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition"
                          >
                            <Play className="w-3 h-3 fill-goldLight" /> Listen
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 pt-2.5 border-t border-borderGreen/60 w-full">
                      <div className="flex justify-between text-[9px] text-mutedEmerald mb-1 font-medium">
                        <span>Reading Progress</span>
                        <span>{progress}% Completed</span>
                      </div>
                      <div className="w-full h-1 bg-deepGreen rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-goldDark to-goldPrimary rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Currently Active Book's Chapters */}
            <main className="w-full mt-6 flex-1 box-border">
              <div className="flex items-center justify-between mb-2.5 px-1">
                <div>
                  <h3 className="text-xs font-bold tracking-wider uppercase text-goldLight">
                    {currentBook.title}
                  </h3>
                  <span className="text-[10px] text-mutedEmerald">Table of Contents</span>
                </div>
                <span className="text-[10px] text-mutedEmerald font-mono">{currentBook.chapters.length} Parts</span>
              </div>

              <div className="space-y-2 w-full box-border">
                {currentBook.chapters.map((ch, idx) => {
                  const isPlayingThis = selectedBookId === currentBook.id && currentChapterIndex === idx;
                  const isDone = (progressMap[currentBook.id] || []).includes(ch.id);

                  return (
                    <div
                      key={ch.id}
                      className={`w-full p-3 rounded-xl border transition-all box-border ${
                        isPlayingThis
                          ? 'bg-cardGreen border-goldPrimary shadow-md'
                          : 'bg-surfaceGreen/70 border-borderGreen hover:border-goldPrimary/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2.5 w-full">
                        <div
                          onClick={() => {
                            setCurrentChapterIndex(idx);
                            setViewMode('reader');
                          }}
                          className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            isPlayingThis
                              ? 'bg-goldPrimary text-deepGreen'
                              : isDone
                              ? 'bg-borderGreen text-goldPrimary'
                              : 'bg-deepGreen text-mutedEmerald border border-borderGreen'
                          }`}>
                            {isDone ? <CheckCircle2 className="w-4 h-4 text-goldPrimary" /> : String(ch.id).padStart(2, '0')}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className={`text-xs font-semibold truncate ${isPlayingThis ? 'text-goldLight' : 'text-creamText'}`}>
                              {ch.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-mutedEmerald font-urdu truncate" dir="rtl">{ch.titleUrdu}</span>
                              <span className="text-[9px] text-mutedEmerald/60 font-mono shrink-0">• {ch.duration}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Trigger Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setCurrentChapterIndex(idx);
                              setViewMode('reader');
                            }}
                            className="p-1.5 rounded-lg text-mutedEmerald hover:text-goldLight active:scale-95 transition"
                            title="Read text"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setCurrentChapterIndex(idx)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition active:scale-95 ${
                              isPlayingThis
                                ? 'bg-goldPrimary text-deepGreen shadow-sm'
                                : 'bg-deepGreen text-goldPrimary border border-borderGreen hover:border-goldPrimary'
                            }`}
                          >
                            <Play className="w-3.5 h-3.5 translate-x-0.5 fill-goldPrimary" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </main>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: BOOKS EXPLORER TAB                                                  */}
        {/* ========================================================================= */}
        {viewMode !== 'reader' && activeTab === 'books' && (
          <div className="w-full flex-1 flex flex-col pb-44 animate-fadeIn pt-5">
            <h2 className="text-base font-bold text-goldLight px-1">Library Catalog</h2>
            <p className="text-xs text-mutedEmerald px-1 mb-4">Choose a book to read or listen</p>

            <div className="space-y-3">
              {BOOKS.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleSelectBook(b.id, 'home')}
                  className="p-4 rounded-xl bg-surfaceGreen border border-borderGreen hover:border-goldPrimary cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-16 rounded bg-gradient-to-br ${b.coverGradient} border border-goldPrimary/40 flex items-center justify-center text-[8px] font-bold text-goldLight text-center p-1`}>
                      {b.coverTag}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-creamText">{b.title}</h3>
                      <p className="text-xs text-goldLight font-arabic">{b.arabicTitle}</p>
                      <p className="text-[10px] text-mutedEmerald mt-1">{b.author}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-goldPrimary" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: BOOKMARKS TAB                                                       */}
        {/* ========================================================================= */}
        {viewMode !== 'reader' && activeTab === 'bookmarks' && (
          <div className="w-full flex-1 flex flex-col pb-44 animate-fadeIn pt-5 text-center items-center justify-center">
            <Bookmark className="w-10 h-10 text-goldPrimary/40 mb-2" />
            <h3 className="text-sm font-bold text-creamText">No Bookmarks Saved</h3>
            <p className="text-xs text-mutedEmerald max-w-xs mt-1">
              Tap the bookmark icon in any chapter to save it for quick review.
            </p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: SETTINGS TAB                                                        */}
        {/* ========================================================================= */}
        {viewMode !== 'reader' && activeTab === 'settings' && (
          <div className="w-full flex-1 flex flex-col pb-44 animate-fadeIn pt-5 px-1">
            <h2 className="text-base font-bold text-goldLight mb-4">Preferences</h2>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-surfaceGreen rounded-xl border border-borderGreen flex justify-between items-center">
                <span>Default Reading Font Size</span>
                <span className="font-mono text-goldPrimary font-bold">{fontSize}px</span>
              </div>
              <div className="p-3 bg-surfaceGreen rounded-xl border border-borderGreen flex justify-between items-center">
                <span>App Version</span>
                <span className="text-mutedEmerald">2.0.0 (Library Edition)</span>
              </div>
              <div className="p-3 bg-surfaceGreen rounded-xl border border-borderGreen">
                <span className="font-bold text-goldLight block mb-1">About the Content</span>
                <p className="text-[11px] text-mutedEmerald leading-relaxed">
                  All texts and audio references are from authenticated collections of Ar-Raheeq Al-Makhtum and Faza'il-e-A'mal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* UNIVERSAL PERSISTENT AUDIO PLAYER                                         */}
        {/* ========================================================================= */}
        <AudioPlayer
          activeBook={currentBook}
          activeChapter={currentChapter}
          audioLanguage={audioLanguage}
          onChangeAudioLanguage={setAudioLanguage}
          onNextChapter={() => setCurrentChapterIndex(prev => Math.min(currentBook.chapters.length - 1, prev + 1))}
          onPrevChapter={() => setCurrentChapterIndex(prev => Math.max(0, prev - 1))}
          onOpenReader={() => setViewMode('reader')}
          onChapterCompleted={handleChapterCompleted}
        />

        {/* ========================================================================= */}
        {/* PERSISTENT BOTTOM NAVIGATION BAR                                          */}
        {/* ========================================================================= */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (viewMode === 'reader') setViewMode('home');
          }}
        />

      </div>
    </div>
  );
}
