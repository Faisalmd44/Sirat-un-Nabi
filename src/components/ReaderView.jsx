import React from 'react';
import { ArrowLeft, SkipBack, SkipForward } from 'lucide-react';

export default function ReaderView({
  book,
  chapter,
  readingLanguage,
  onChangeReadingLanguage,
  fontSize,
  onChangeFontSize,
  onBack,
  onNext,
  onPrev,
  hasPrev,
  hasNext
}) {
  const currentLangObj = book.readingLanguages.find(l => l.code === readingLanguage) || book.readingLanguages[0];
  const isRtl = currentLangObj.dir === 'rtl';

  return (
    <div className="w-full flex-1 flex flex-col pb-44 animate-fadeIn box-border">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-deepGreen/95 backdrop-blur-xl border-b border-borderGreen py-3 px-2 flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="p-1.5 text-goldPrimary active:scale-95 transition flex items-center gap-1 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4"/>
          <span>Back</span>
        </button>

        <div className="text-center flex-1 min-w-0 px-1">
          <span className="text-[9px] uppercase tracking-widest text-goldPrimary font-semibold block truncate">
            {book.title} • Ch. {chapter.id}
          </span>
          <h2 className="text-xs font-bold text-creamText truncate">{chapter.title}</h2>
        </div>

        {/* Font Adjuster */}
        <div className="flex items-center gap-1 bg-surfaceGreen border border-borderGreen rounded-full px-2 py-0.5 shrink-0">
          <button
            onClick={() => onChangeFontSize(Math.max(13, fontSize - 1))}
            className="text-[11px] font-bold text-mutedEmerald hover:text-goldPrimary px-1"
          >
            A-
          </button>
          <span className="text-[10px] font-mono text-goldPrimary">{fontSize}</span>
          <button
            onClick={() => onChangeFontSize(Math.min(26, fontSize + 1))}
            className="text-[11px] font-bold text-mutedEmerald hover:text-goldPrimary px-1"
          >
            A+
          </button>
        </div>
      </nav>

      {/* Reading Language Switcher */}
      <div className="w-full pt-3 pb-2 px-1">
        <div
          className={`grid bg-surfaceGreen p-1 rounded-xl border border-borderGreen shadow-inner w-full ${
            book.readingLanguages.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
          }`}
        >
          {book.readingLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onChangeReadingLanguage(lang.code)}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                readingLanguage === lang.code
                  ? 'bg-goldPrimary text-deepGreen shadow-sm'
                  : 'text-mutedEmerald hover:text-creamText'
              } ${lang.code === 'ur' ? 'font-urdu' : ''}`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reading Content */}
      <main className="w-full flex-1 py-3 px-1 box-border">
        <div className="mb-4 pb-3 border-b border-borderGreen/60 text-center">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-goldPrimary/10 border border-goldPrimary/30 text-[10px] font-semibold text-goldPrimary mb-1.5">
            {book.coverTag} • {chapter.duration}
          </span>
          <h1 className={`font-bold text-goldLight ${readingLanguage === 'ur' ? 'font-urdu text-lg leading-loose' : 'text-sm leading-snug'}`}>
            {readingLanguage === 'ur' ? chapter.titleUrdu : readingLanguage === 'roman' ? chapter.titleRoman : chapter.title}
          </h1>
        </div>

        {/* Dynamic RTL / LTR Paragraph Flow */}
        <article
          dir={isRtl ? 'rtl' : 'ltr'}
          style={{ fontSize: `${fontSize}px` }}
          className={`space-y-4 w-full box-border ${
            readingLanguage === 'ur'
              ? 'font-urdu leading-[2.5] text-right text-creamText/95'
              : 'font-sans leading-relaxed text-left text-creamText/90'
          }`}
        >
          {chapter.text[readingLanguage]?.map((para, idx) => (
            <p
              key={idx}
              className="p-3.5 rounded-xl bg-surfaceGreen/40 border border-borderGreen/50 shadow-sm transition hover:border-goldPrimary/30 break-words"
            >
              {para}
            </p>
          ))}
        </article>

        {/* Prev / Next Navigation in Reader */}
        <div className="flex items-center justify-between gap-3 mt-8 pt-4 border-t border-borderGreen/70 w-full">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="flex-1 py-2.5 px-3 rounded-xl border border-borderGreen bg-surfaceGreen text-xs font-semibold text-creamText disabled:opacity-30 active:scale-95 transition flex items-center justify-center gap-1.5"
          >
            <SkipBack className="w-3.5 h-3.5 text-goldPrimary"/> Previous Chapter
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className="flex-1 py-2.5 px-3 rounded-xl border border-borderGreen bg-surfaceGreen text-xs font-semibold text-creamText disabled:opacity-30 active:scale-95 transition flex items-center justify-center gap-1.5"
          >
            Next Chapter <SkipForward className="w-3.5 h-3.5 text-goldPrimary"/>
          </button>
        </div>
      </main>
    </div>
  );
}
