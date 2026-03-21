import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  Bookmark,
  Settings,
  ChevronDown,
  Check,
  Share2,
} from "lucide-react";
import { SurahDetail, ApiResponse } from "../types";
import { cn } from "../lib/utils";

interface SurahViewProps {
  surahId: number;
  onBack: () => void;
  onNavigate: (id: number) => void;
}

type TranslationLanguage = "en.sahih" | "pt.elhayek" | "bn.bengali";

const TRANSLATION_OPTIONS = [
  { id: "arabic_original", name: "Arabic (Original)" },
  { id: "en.sahih", name: "English (Saheeh)" },
  { id: "pt.elhayek", name: "Portuguese (El-Hayek)" },
  { id: "bn.bengali", name: "Bangla (Muhiuddin Khan)" },
];

export function SurahView({ surahId, onBack, onNavigate }: SurahViewProps) {
  const [arabicData, setArabicData] = useState<SurahDetail | null>(null);
  const [translationsData, setTranslationsData] = useState<SurahDetail[]>([]);
  const [audioData, setAudioData] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [translationLangs, setTranslationLangs] = useState<string[]>(['arabic_original', 'en.sahih']);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [bookmarkedAyah, setBookmarkedAyah] = useState<number | null>(() => {
    const saved = localStorage.getItem(`bookmark-${surahId}`);
    return saved ? parseInt(saved, 10) : null;
  });

  useEffect(() => {
    setLoading(true);
    // Fetch Arabic, Translations, and Audio
    const apiLangs = translationLangs.filter(id => id !== 'arabic_original');
    const langsQuery = apiLangs.length > 0 ? `,${apiLangs.join(',')}` : '';
    fetch(
      `https://api.alquran.cloud/v1/surah/${surahId}/editions/quran-uthmani${langsQuery},ar.alafasy`,
    )
      .then((res) => res.json())
      .then((data: ApiResponse<SurahDetail[]>) => {
        setArabicData(data.data[0]);
        
        const audioIndex = data.data.length - 1;
        setAudioData(data.data[audioIndex]);
        
        const translations = data.data.slice(1, audioIndex);
        setTranslationsData(translations);
        
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch surah details:", err);
        setLoading(false);
      });
  }, [surahId, translationLangs]);

  const toggleLanguage = (langId: string) => {
    setTranslationLangs((prev) => {
      if (prev.includes(langId)) {
        return prev.filter((id) => id !== langId);
      } else {
        return [...prev, langId];
      }
    });
  };

  const toggleBookmark = (ayahNumber: number) => {
    if (bookmarkedAyah === ayahNumber) {
      setBookmarkedAyah(null);
      localStorage.removeItem(`bookmark-${surahId}`);
    } else {
      setBookmarkedAyah(ayahNumber);
      localStorage.setItem(`bookmark-${surahId}`, ayahNumber.toString());
    }
  };

  const playAudio = (ayahNumber: number, audioUrl: string) => {
    if (playingAyah === ayahNumber) {
      audioRef.current?.pause();
      setPlayingAyah(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play();
      setPlayingAyah(ayahNumber);

      audio.onended = () => {
        setPlayingAyah(null);
        // Auto-play next ayah (optional feature)
        const nextAyah = audioData?.ayahs.find(
          (a) => a.numberInSurah === ayahNumber + 1,
        );
        if (nextAyah && nextAyah.audio) {
          playAudio(nextAyah.numberInSurah, nextAyah.audio);
        }
      };
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Scroll to playing ayah
  useEffect(() => {
    if (playingAyah !== null) {
      const element = document.getElementById(`ayah-${playingAyah}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [playingAyah]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Surah ${arabicData?.englishName}`,
          text: `Read Surah ${arabicData?.englishName} on Al Quran`,
          url: url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  if (loading || !arabicData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border pb-4 mb-8 pt-4 flex flex-row items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Back to Surahs</span>
          <span className="sm:hidden">Back</span>
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleShare}
            className="flex items-center justify-center p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
            title="Share Surah"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-full sm:w-64 bg-secondary border border-border text-foreground py-2 pl-4 pr-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-colors"
            >
            <span className="truncate">
              {translationLangs.length === 0
                ? "Select Translations"
                : `${translationLangs.length} Translation${translationLangs.length > 1 ? 's' : ''} Selected`}
            </span>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isDropdownOpen && "rotate-180")} />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-full sm:w-64 bg-card border border-border rounded-lg shadow-lg z-20 py-1 overflow-hidden">
                {TRANSLATION_OPTIONS.map((opt) => {
                  const isActive = translationLangs.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleLanguage(opt.id)}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-left hover:bg-secondary transition-colors"
                    >
                      <div className={cn(
                        "flex items-center justify-center w-4 h-4 mr-3 rounded border",
                        isActive ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                      )}>
                        {isActive && <Check className="w-3 h-3" />}
                      </div>
                      <span className={isActive ? "text-foreground font-medium" : "text-muted-foreground"}>
                        {opt.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
          </div>
        </div>
      </div>

      {/* Surah Title Card */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8 text-center mb-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
        <h1 className="text-4xl md:text-5xl font-arabic text-primary mb-4 leading-tight">
          {arabicData.name}
        </h1>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          {arabicData.englishName}
        </h2>
        <p className="text-muted-foreground uppercase tracking-widest text-sm font-medium">
          {arabicData.englishNameTranslation} • {arabicData.revelationType} •{" "}
          {arabicData.numberOfAyahs} Ayahs
        </p>
      </div>

      {/* Bismillah (except for Surah 9) */}
      {surahId !== 9 && surahId !== 1 && translationLangs.includes('arabic_original') && (
        <div className="text-center font-arabic text-3xl md:text-4xl text-foreground mb-12 leading-loose">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </div>
      )}

      {/* Ayahs List */}
      <div className="space-y-8">
        {arabicData.ayahs.map((ayah, index) => {
          const audio = audioData?.ayahs[index];
          const isBookmarked = bookmarkedAyah === ayah.numberInSurah;
          const isPlaying = playingAyah === ayah.numberInSurah;

          // Remove Bismillah from the first ayah text if it's not Surah Al-Fatihah
          let arabicText = ayah.text;
          if (surahId !== 1 && ayah.numberInSurah === 1) {
            arabicText = arabicText.replace(
              "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ",
              "",
            );
          }

          return (
            <div
              key={ayah.number}
              className={cn(
                "p-6 rounded-2xl border transition-all duration-300",
                isBookmarked
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/30",
              )}
              id={`ayah-${ayah.numberInSurah}`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                    {ayah.numberInSurah}
                  </span>

                  <button
                    onClick={() => toggleBookmark(ayah.numberInSurah)}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      isBookmarked
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                    title={
                      isBookmarked ? "Remove bookmark" : "Bookmark this ayah"
                    }
                  >
                    <Bookmark
                      className={cn("w-4 h-4", isBookmarked && "fill-current")}
                    />
                  </button>

                  {audio?.audio && (
                    <button
                      onClick={() =>
                        playAudio(ayah.numberInSurah, audio.audio!)
                      }
                      className={cn(
                        "p-2 rounded-full transition-colors",
                        isPlaying
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                      title={isPlaying ? "Pause audio" : "Play audio"}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                {translationLangs.includes('arabic_original') && (
                  <div
                    className="text-right font-arabic text-2xl md:text-3xl leading-[2.5] text-foreground"
                    dir="rtl"
                  >
                    {arabicText}{" "}
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary/30 text-primary text-lg ml-2">
                      {ayah.numberInSurah}
                    </span>
                  </div>
                )}

                {translationsData.length > 0 && (
                  <div className={cn("flex flex-col space-y-4 border-border/50", translationLangs.includes('arabic_original') && "mt-4 pt-4 border-t")}>
                    {translationsData.map((transData) => (
                      <div
                        key={transData.edition.identifier}
                        className={cn(
                          "text-lg text-muted-foreground leading-relaxed",
                          transData.edition.language === "bn" && "font-bengali"
                        )}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70 block mb-1 font-sans">
                          {transData.edition.englishName}
                        </span>
                        {transData.ayahs[index].text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="mt-12 flex flex-col sm:flex-row justify-between items-center border-t border-border pt-8 gap-4">
        <button
          onClick={() => {
            if (surahId > 1) {
              onNavigate(surahId - 1);
              window.scrollTo(0, 0);
            }
          }}
          disabled={surahId === 1}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors order-2 sm:order-1"
        >
          Previous Surah
        </button>
        
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-secondary/50 rounded-lg hover:bg-secondary transition-colors order-1 sm:order-2"
        >
          Back to Surahs
        </button>

        <button
          onClick={() => {
            if (surahId < 114) {
              onNavigate(surahId + 1);
              window.scrollTo(0, 0);
            }
          }}
          disabled={surahId === 114}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors order-3"
        >
          Next Surah
        </button>
      </div>

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium animate-in fade-in slide-in-from-bottom-4">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}
