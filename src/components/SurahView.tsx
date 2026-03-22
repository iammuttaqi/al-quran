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

const ALL_LANGS = TRANSLATION_OPTIONS.map(opt => opt.id);

const getLanguageName = (identifier: string): string => {
  switch (identifier) {
    case "en.sahih": return "English";
    case "pt.elhayek": return "Portuguese";
    case "bn.bengali": return "Bangla";
    default: return identifier;
  }
};

export function SurahView({ surahId, onBack, onNavigate }: SurahViewProps) {
  const [arabicData, setArabicData] = useState<SurahDetail | null>(null);
  const [translationsData, setTranslationsData] = useState<SurahDetail[]>([]);
  const [audioData, setAudioData] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [translationLangs, setTranslationLangs] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const savedLangs = localStorage.getItem("selected-langs");
      if (savedLangs) {
        try {
          const parsed = JSON.parse(savedLangs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter(lang => ALL_LANGS.includes(lang));
          }
        } catch (e) {
          console.error("Failed to parse saved languages", e);
        }
      }
    }
    return ALL_LANGS;
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (arabicData) {
      document.title = `Surah ${arabicData.englishName} - Al Quran`;
    }
  }, [arabicData]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selected-langs", JSON.stringify(translationLangs));
    }
  }, [translationLangs]);

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

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Scroll to top or specific ayah on load
  useEffect(() => {
    if (!loading && arabicData) {
      const params = new URLSearchParams(window.location.search);
      const ayahParam = params.get("ayah");
      
      if (ayahParam) {
        const parsedAyah = parseInt(ayahParam, 10);
        if (!isNaN(parsedAyah)) {
          // Small delay to ensure rendering is complete
          setTimeout(() => {
            const element = document.getElementById(`ayah-${parsedAyah}`);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
              // Add a brief highlight effect
              element.classList.add("ring-2", "ring-primary", "ring-offset-2", "ring-offset-background");
              setTimeout(() => {
                element.classList.remove("ring-2", "ring-primary", "ring-offset-2", "ring-offset-background");
              }, 2000);
            }
          }, 100);
          return;
        }
      }
      
      // Default: scroll to top
      window.scrollTo(0, 0);
    }
  }, [loading, arabicData, surahId]);

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

  const shareAyah = async (ayahNumber: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("ayah", ayahNumber.toString());
    const shareUrl = url.toString();
    
    // Update URL without reloading
    window.history.replaceState({}, "", shareUrl);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Surah ${arabicData?.englishName} - Ayah ${ayahNumber}`,
          text: `Read Surah ${arabicData?.englishName}, Ayah ${ayahNumber} on Al Quran`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  if (loading || !arabicData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 animate-pulse">
        <div className="h-14 bg-secondary/50 rounded-lg w-full mb-8"></div>
        <div className="bg-secondary/30 rounded-2xl p-8 mb-12 h-48 w-full"></div>
        <div className="space-y-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex justify-between items-start mb-6">
                <div className="w-8 h-8 rounded-full bg-secondary/50"></div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary/50"></div>
                  <div className="w-8 h-8 rounded-full bg-secondary/50"></div>
                </div>
              </div>
              <div className="flex flex-col space-y-4">
                <div className="h-8 bg-secondary/40 rounded w-3/4 self-end"></div>
                <div className="h-8 bg-secondary/40 rounded w-1/2 self-end"></div>
                <div className="h-4 bg-secondary/30 rounded w-full mt-4"></div>
                <div className="h-4 bg-secondary/30 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <div className="sticky top-14 z-40 bg-background/70 backdrop-blur-xl border-b border-border/50 pb-4 mb-8 pt-4 flex flex-row items-center justify-between gap-3 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={onBack}
          className="flex items-center text-muted-foreground hover:text-foreground transition-all active:scale-95 shrink-0"
        >
          <ArrowLeft className="w-5 h-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Back to Surahs</span>
          <span className="sm:hidden">Back</span>
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleShare}
            className="flex items-center justify-center p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-all active:scale-95"
            title="Share Surah"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-full sm:w-64 bg-secondary border border-border text-foreground py-2 pl-4 pr-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all active:scale-[0.98]"
            >
            <span className="truncate">
              {translationLangs.length === 0
                ? "Select Translations"
                : `${translationLangs.length} Translation${translationLangs.length > 1 ? 's' : ''} Selected`}
            </span>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isDropdownOpen && "rotate-180")} />
          </button>

          {isDropdownOpen && (
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
        <div className="text-center font-arabic text-xl md:text-2xl text-foreground mb-12 leading-loose">
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
                "p-6 rounded-2xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-4",
                isBookmarked
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/30",
              )}
              style={{ animationDelay: `${Math.min(index * 50, 500)}ms`, animationFillMode: 'both' }}
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
                      "p-2 rounded-full transition-all active:scale-95",
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

                  <button
                    onClick={() => shareAyah(ayah.numberInSurah)}
                    className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-all active:scale-95"
                    title="Share this ayah"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  {audio?.audio && (
                    <button
                      onClick={() =>
                        playAudio(ayah.numberInSurah, audio.audio!)
                      }
                      className={cn(
                        "p-2 rounded-full transition-all active:scale-95",
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
                    className="text-right font-arabic text-base leading-[2.5] text-foreground"
                    dir="rtl"
                  >
                    {arabicText}{" "}
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary/30 text-primary text-sm ml-2">
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
                          "text-base text-muted-foreground leading-relaxed",
                          transData.edition.language === "bn" && "font-bengali"
                        )}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70 block mb-1 font-sans">
                          {getLanguageName(transData.edition.identifier)}
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
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-all active:scale-95 order-2 sm:order-1"
        >
          Previous Surah
        </button>
        
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-secondary/50 rounded-lg hover:bg-secondary transition-all active:scale-95 order-1 sm:order-2"
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
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-all active:scale-95 order-3"
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
