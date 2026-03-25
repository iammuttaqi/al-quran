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
  Copy,
  Sparkles,
  Loader2,
  X,
  BookOpen,
  Languages,
  Moon,
  Sun
} from "lucide-react";
import { SurahDetail, ApiResponse } from "../types";
import { cn } from "../lib/utils";
import { GoogleGenAI } from "@google/genai";
import Markdown from "react-markdown";

interface SurahViewProps {
  surahId: number;
  onBack: () => void;
  onNavigate: (id: number) => void;
  theme: 'light' | 'dark' | 'sepia';
  cycleTheme: () => void;
  initialData?: any;
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

export function SurahView({ surahId, onBack, onNavigate, theme, cycleTheme, initialData }: SurahViewProps) {
  const [arabicData, setArabicData] = useState<SurahDetail | null>(() => {
    if (initialData?.surahDetail && initialData.surahDetail[0].number === surahId) {
      return initialData.surahDetail[0];
    }
    return null;
  });
  const [translationsData, setTranslationsData] = useState<SurahDetail[]>(() => {
    if (initialData?.surahDetail && initialData.surahDetail[0].number === surahId) {
      const audioIndex = initialData.surahDetail.length - 1;
      return initialData.surahDetail.slice(1, audioIndex);
    }
    return [];
  });
  const [audioData, setAudioData] = useState<SurahDetail | null>(() => {
    if (initialData?.surahDetail && initialData.surahDetail[0].number === surahId) {
      const audioIndex = initialData.surahDetail.length - 1;
      return initialData.surahDetail[audioIndex];
    }
    return null;
  });
  const [loading, setLoading] = useState(() => {
    if (initialData?.surahDetail && initialData.surahDetail[0].number === surahId) {
      return false;
    }
    return true;
  });
  const [translationLangs, setTranslationLangs] = useState<string[]>(ALL_LANGS);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const savedLangs = localStorage.getItem("selected-langs");
      if (savedLangs) {
        try {
          const parsed = JSON.parse(savedLangs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTranslationLangs(parsed.filter(lang => ALL_LANGS.includes(lang)));
          }
        } catch (e) {
          console.error("Failed to parse saved languages", e);
        }
      }
    }
  }, []);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showShareToast, setShowShareToast] = useState(false);

  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [bookmarkedAyah, setBookmarkedAyah] = useState<number | null>(() => {
    const saved = localStorage.getItem(`bookmark-${surahId}`);
    return saved ? parseInt(saved, 10) : null;
  });

  const [tafsirLoading, setTafsirLoading] = useState<number | null>(null);
  const [tafsirData, setTafsirData] = useState<{ [ayahNumber: number]: string }>({});
  const [expandedTafsir, setExpandedTafsir] = useState<number | null>(null);
  
  const [meaningfulLoading, setMeaningfulLoading] = useState<number | null>(null);
  const [meaningfulData, setMeaningfulData] = useState<{ [ayahNumber: number]: string }>({});
  const [expandedMeaningful, setExpandedMeaningful] = useState<number | null>(null);
  
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showTafsirCopyToast, setShowTafsirCopyToast] = useState(false);
  const [showMeaningfulCopyToast, setShowMeaningfulCopyToast] = useState(false);

  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (err) {
      console.error('Wake Lock error:', err);
    }
  };

  const releaseWakeLock = async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    } catch (err) {
      console.error('Wake Lock release error:', err);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && playingAyah !== null) {
        await requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [playingAyah]);

  useEffect(() => {
    // Skip fetch if we already have the data from initialData and it matches the requested languages
    if (arabicData && arabicData.number === surahId) {
      const apiLangs = translationLangs.filter(id => id !== 'arabic_original');
      const currentLangs = translationsData.map(t => t.edition.identifier);
      
      // Check if currentLangs has all the requested apiLangs
      const hasAllLangs = apiLangs.every(lang => currentLangs.includes(lang));
      if (hasAllLangs) {
        // We have the data, just ensure we only show the requested ones
        // (The rendering logic will filter them based on translationLangs)
        setLoading(false);
        return;
      }
    }

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
        
        const langOrder = ['en.sahih', 'pt.elhayek', 'bn.bengali'];
        translations.sort((a, b) => {
          const indexA = langOrder.indexOf(a.edition.identifier);
          const indexB = langOrder.indexOf(b.edition.identifier);
          
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.edition.identifier.localeCompare(b.edition.identifier);
        });

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

  const playAudio = async (ayahNumber: number, audioUrl: string) => {
    if (playingAyah === ayahNumber) {
      audioRef.current?.pause();
      setPlayingAyah(null);
      await releaseWakeLock();
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play();
      setPlayingAyah(ayahNumber);
      await requestWakeLock();

      audio.onended = async () => {
        setPlayingAyah(null);
        // Auto-play next ayah (optional feature)
        const nextAyah = audioData?.ayahs.find(
          (a) => a.numberInSurah === ayahNumber + 1,
        );
        if (nextAyah && nextAyah.audio) {
          playAudio(nextAyah.numberInSurah, nextAyah.audio);
        } else {
          await releaseWakeLock();
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
      releaseWakeLock();
    };
  }, []);

  // Scroll to playing ayah
  useEffect(() => {
    if (playingAyah !== null) {
      const element = document.getElementById(`ayah-${playingAyah}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [playingAyah]);

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Scroll to top or specific ayah on load
  useEffect(() => {
    if (!loading && arabicData) {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      let ayahParam = null;
      if (pathParts.length > 1) {
        ayahParam = pathParts[1];
      } else {
        // Fallback for old query param format
        const params = new URLSearchParams(window.location.search);
        ayahParam = params.get("ayah");
      }
      
      if (ayahParam) {
        const parsedAyah = parseInt(ayahParam, 10);
        if (!isNaN(parsedAyah)) {
          // Small delay to ensure rendering is complete
          setTimeout(() => {
            const element = document.getElementById(`ayah-${parsedAyah}`);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "start" });
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
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Error sharing:", err);
          navigator.clipboard.writeText(url);
          setShowShareToast(true);
          setTimeout(() => setShowShareToast(false), 2000);
        }
      }
    } else {
      navigator.clipboard.writeText(url);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  const shareAyah = async (ayahNumber: number) => {
    const shareUrl = `${window.location.origin}/${surahId}/${ayahNumber}`;
    
    // Update URL without reloading
    window.history.replaceState({}, "", shareUrl);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Surah ${arabicData?.englishName} - Ayah ${ayahNumber}`,
          text: `Read Surah ${arabicData?.englishName}, Ayah ${ayahNumber} on Al Quran`,
          url: shareUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Error sharing:", err);
          navigator.clipboard.writeText(shareUrl);
          setShowShareToast(true);
          setTimeout(() => setShowShareToast(false), 2000);
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  const copyAyah = (ayahNumber: number, arabicText: string) => {
    const arabicNumerals = ayahNumber.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d as any]);
    
    let textToCopy = `[${surahId}:${ayahNumber}] Surah ${arabicData?.englishName}\n\n`;
    if (translationLangs.includes('arabic_original')) {
      textToCopy += `${arabicText} ﴿${arabicNumerals}﴾\n\n`;
    }
    
    translationsData.forEach(t => {
      textToCopy += `[${getLanguageName(t.edition.identifier)}]\n${ayahNumber}. ${t.ayahs[ayahNumber - 1].text}\n\n`;
    });

    navigator.clipboard.writeText(textToCopy.trim());
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };

  const copyTafsir = (ayahNumber: number) => {
    const tafsirText = tafsirData[ayahNumber];
    if (!tafsirText) return;
    
    const textToCopy = `[${surahId}:${ayahNumber}] Surah ${arabicData?.englishName} - AI Tafsir\n\n${tafsirText}`;
    navigator.clipboard.writeText(textToCopy.trim());
    setShowTafsirCopyToast(true);
    setTimeout(() => setShowTafsirCopyToast(false), 2000);
  };

  const copyMeaningful = (ayahNumber: number) => {
    const meaningfulText = meaningfulData[ayahNumber];
    if (!meaningfulText) return;
    
    const textToCopy = `[${surahId}:${ayahNumber}] Surah ${arabicData?.englishName} - AI Translation\n\n${meaningfulText}`;
    navigator.clipboard.writeText(textToCopy.trim());
    setShowMeaningfulCopyToast(true);
    setTimeout(() => setShowMeaningfulCopyToast(false), 2000);
  };

  const fetchMeaningfulTranslation = async (ayahNumber: number, englishText: string) => {
    setExpandedMeaningful(ayahNumber);
    if (meaningfulData[ayahNumber]) {
      return;
    }

    setMeaningfulLoading(ayahNumber);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const targetLangs = translationLangs
        .filter(id => id !== 'arabic_original' && id !== 'en.sahih')
        .map(id => getLanguageName(id));
      
      const langsString = targetLangs.length > 0 ? targetLangs.join(" and ") : "English";
      const multiLangInstruction = targetLangs.length > 1 
        ? `\n\nIMPORTANT: Since multiple languages are requested, provide the translation in EACH of the requested languages (${langsString}), separated by a horizontal rule (---) and clear headings (e.g., ### English, ### Bangla).` 
        : "";

      const prompt = `Provide a meaningful and natural translation of the following Quranic verse.
      
English Verse: ${englishText}

Please translate this English verse into the following language(s): ${langsString}.${multiLangInstruction}
Make the translation meaningful and natural in the target language, avoiding strict word-for-word literal translation if it sounds unnatural. Format using Markdown.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setMeaningfulData(prev => ({ ...prev, [ayahNumber]: response.text || "No translation available." }));
    } catch (error) {
      console.error("Error fetching Translation:", error);
      setMeaningfulData(prev => ({ ...prev, [ayahNumber]: "Failed to load translation. Please try again later." }));
    } finally {
      setMeaningfulLoading(null);
    }
  };

  const fetchTafsir = async (ayahNumber: number, arabicText: string) => {
    setExpandedTafsir(ayahNumber);
    if (tafsirData[ayahNumber]) {
      return;
    }

    setTafsirLoading(ayahNumber);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      let translationText = "";
      if (translationsData.length > 0) {
        translationText = translationsData[0].ayahs[ayahNumber - 1].text;
      }

      const targetLangs = translationLangs
        .filter(id => id !== 'arabic_original')
        .map(id => getLanguageName(id));
      
      const langsString = targetLangs.length > 0 ? targetLangs.join(" and ") : "English";
      const multiLangInstruction = targetLangs.length > 1 
        ? `\n\nIMPORTANT: Since multiple languages are requested, provide the Tafsir in EACH of the requested languages (${langsString}), separated by a horizontal rule (---) and clear headings (e.g., ### English, ### Bangla).` 
        : "";

      const prompt = `Provide a brief, authentic, and easy-to-understand Tafsir (explanation) for Surah ${arabicData?.englishName}, Ayah ${ayahNumber}.
      
Arabic: ${arabicText}
Translation: ${translationText}

Focus on the context of revelation (if applicable), key themes, and practical lessons. Keep it concise (around 2-3 paragraphs per language). Format using Markdown.

Please provide the Tafsir in the following language(s): ${langsString}.${multiLangInstruction}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setTafsirData(prev => ({ ...prev, [ayahNumber]: response.text || "No explanation available." }));
    } catch (error) {
      console.error("Error fetching Tafsir:", error);
      setTafsirData(prev => ({ ...prev, [ayahNumber]: "Failed to load Tafsir. Please try again later." }));
    } finally {
      setTafsirLoading(null);
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
    <div className="pb-16">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 pb-3 pt-3 flex flex-row items-center justify-between gap-3">
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
              onClick={cycleTheme}
              className="flex items-center justify-center p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-all active:scale-95"
              title={`Current theme: ${theme}`}
            >
              {theme === 'light' && <Sun className="w-5 h-5" />}
              {theme === 'dark' && <Moon className="w-5 h-5" />}
              {theme === 'sepia' && <BookOpen className="w-5 h-5" />}
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
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 pt-4">
        {/* Surah Title Card */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 text-center mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
        <h1 className="text-4xl md:text-5xl font-arabic text-primary mb-4 leading-tight">
          {arabicData.name}
        </h1>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          {surahId}. {arabicData.englishName}
        </h2>
        <p className="text-muted-foreground uppercase tracking-widest text-sm font-medium">
          {arabicData.englishNameTranslation} • {arabicData.revelationType} •{" "}
          {arabicData.numberOfAyahs} Ayahs
        </p>
      </div>

      {/* Bismillah (except for Surah 9) */}
      {surahId !== 9 && surahId !== 1 && translationLangs.includes('arabic_original') && (
        <div className="text-center font-arabic text-xl md:text-2xl text-foreground mb-6 leading-loose">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </div>
      )}

      {/* Ayahs List */}
      <div className="space-y-4">
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
                "p-4 rounded-xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 scroll-mt-24",
                isBookmarked
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/30",
              )}
              style={{ animationDelay: `${Math.min(index * 50, 500)}ms`, animationFillMode: 'both' }}
              id={`ayah-${ayah.numberInSurah}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center w-full gap-2 flex-wrap">
                  <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                    {ayah.numberInSurah}
                  </span>

                  {audio?.audio && (
                    <button
                      onClick={() =>
                        playAudio(ayah.numberInSurah, audio.audio!)
                      }
                      className={cn(
                        "p-2 rounded-full transition-all active:scale-95 shrink-0",
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

                  <button
                    onClick={() => fetchTafsir(ayah.numberInSurah, arabicText)}
                    className={cn(
                      "p-2 rounded-full transition-all active:scale-95 flex items-center gap-1.5 shrink-0",
                      expandedTafsir === ayah.numberInSurah
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                    title="AI Tafsir (Explanation)"
                  >
                    {tafsirLoading === ayah.numberInSurah ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span className="text-xs font-medium hidden sm:inline-block">Tafsir</span>
                  </button>

                  <button
                    onClick={() => {
                      const englishText = translationsData.length > 0 ? translationsData[0].ayahs[index].text : "";
                      fetchMeaningfulTranslation(ayah.numberInSurah, englishText);
                    }}
                    className={cn(
                      "p-2 rounded-full transition-all active:scale-95 flex items-center gap-1.5 shrink-0",
                      expandedMeaningful === ayah.numberInSurah
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                    title="AI Meaningful Translation"
                  >
                    {meaningfulLoading === ayah.numberInSurah ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Languages className="w-4 h-4" />
                    )}
                    <span className="text-xs font-medium hidden sm:inline-block">Translate</span>
                  </button>

                  <button
                    onClick={() => copyAyah(ayah.numberInSurah, arabicText)}
                    className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-all active:scale-95 shrink-0"
                    title="Copy Ayah"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => shareAyah(ayah.numberInSurah)}
                    className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-all active:scale-95 shrink-0"
                    title="Share Ayah"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleBookmark(ayah.numberInSurah)}
                    className={cn(
                      "p-2 rounded-full transition-all active:scale-95 shrink-0",
                      isBookmarked
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                    title={isBookmarked ? "Remove Bookmark" : "Bookmark Ayah"}
                  >
                    <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                {translationLangs.includes('arabic_original') && (
                  <div
                    className="text-right font-arabic text-base leading-[2.5] text-foreground"
                    dir="rtl"
                  >
                    {arabicText}
                  </div>
                )}

                {translationsData.filter(t => translationLangs.includes(t.edition.identifier)).length > 0 && (
                  <div className={cn("flex flex-col space-y-4 border-border/50", translationLangs.includes('arabic_original') && "mt-4 pt-4 border-t")}>
                    {translationsData.filter(t => translationLangs.includes(t.edition.identifier)).map((transData) => (
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

      {/* Copy Toast */}
      {showCopyToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium animate-in fade-in slide-in-from-bottom-4">
          Ayah copied to clipboard!
        </div>
      )}

      {/* Tafsir Copy Toast */}
      {showTafsirCopyToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium animate-in fade-in slide-in-from-bottom-4">
          Tafsir copied to clipboard!
        </div>
      )}

      {/* Meaningful Copy Toast */}
      {showMeaningfulCopyToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium animate-in fade-in slide-in-from-bottom-4">
          Translation copied to clipboard!
        </div>
      )}

      {/* Tafsir Modal */}
      {expandedTafsir !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-lg rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-semibold">AI Tafsir - Ayah {expandedTafsir}</h3>
              </div>
              <div className="flex items-center gap-1">
                {!tafsirLoading && tafsirData[expandedTafsir] && (
                  <button
                    onClick={() => copyTafsir(expandedTafsir)}
                    className="p-2 rounded-md hover:bg-secondary text-muted-foreground transition-colors"
                    title="Copy Tafsir"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setExpandedTafsir(null)}
                  className="p-2 rounded-md hover:bg-secondary text-muted-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto">
              {tafsirLoading === expandedTafsir ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p>Generating explanation...</p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                  <Markdown
                    components={{
                      hr: ({node, ...props}) => <hr className="my-8 border-t-2 border-border/60" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-foreground mt-8 mb-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-foreground mt-8 mb-4" {...props} />,
                    }}
                  >
                    {tafsirData[expandedTafsir]}
                  </Markdown>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Meaningful Translation Modal */}
      {expandedMeaningful !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-lg rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center p-4 border-b border-border">
              <div className="flex items-center gap-2 text-primary">
                <Languages className="w-5 h-5" />
                <h3 className="font-semibold">AI Translation - Ayah {expandedMeaningful}</h3>
              </div>
              <div className="flex items-center gap-1">
                {!meaningfulLoading && meaningfulData[expandedMeaningful] && (
                  <button
                    onClick={() => copyMeaningful(expandedMeaningful)}
                    className="p-2 rounded-md hover:bg-secondary text-muted-foreground transition-colors"
                    title="Copy Translation"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setExpandedMeaningful(null)}
                  className="p-2 rounded-md hover:bg-secondary text-muted-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto">
              {meaningfulLoading === expandedMeaningful ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p>Generating translation...</p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                  <Markdown
                    components={{
                      hr: ({node, ...props}) => <hr className="my-8 border-t-2 border-border/60" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-foreground mt-8 mb-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-foreground mt-8 mb-4" {...props} />,
                    }}
                  >
                    {meaningfulData[expandedMeaningful]}
                  </Markdown>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
