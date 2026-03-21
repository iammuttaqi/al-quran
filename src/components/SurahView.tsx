import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  Bookmark,
  Settings,
  ChevronDown,
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
  { id: "en.sahih", name: "English (Saheeh)" },
  { id: "pt.elhayek", name: "Portuguese (El-Hayek)" },
  { id: "bn.bengali", name: "Bangla (Muhiuddin Khan)" },
];

export function SurahView({ surahId, onBack, onNavigate }: SurahViewProps) {
  const [arabicData, setArabicData] = useState<SurahDetail | null>(null);
  const [translationData, setTranslationData] = useState<SurahDetail | null>(
    null,
  );
  const [audioData, setAudioData] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [translationLang, setTranslationLang] =
    useState<TranslationLanguage>("en.sahih");

  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [bookmarkedAyah, setBookmarkedAyah] = useState<number | null>(() => {
    const saved = localStorage.getItem(`bookmark-${surahId}`);
    return saved ? parseInt(saved, 10) : null;
  });

  useEffect(() => {
    setLoading(true);
    // Fetch Arabic, Translation, and Audio
    fetch(
      `https://api.alquran.cloud/v1/surah/${surahId}/editions/quran-uthmani,${translationLang},ar.alafasy`,
    )
      .then((res) => res.json())
      .then((data: ApiResponse<SurahDetail[]>) => {
        setArabicData(data.data[0]);
        setTranslationData(data.data[1]);
        setAudioData(data.data[2]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch surah details:", err);
        setLoading(false);
      });
  }, [surahId, translationLang]);

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

  if (loading || !arabicData || !translationData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border pb-4 mb-8 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Surahs
        </button>

        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <select
              value={translationLang}
              onChange={(e) =>
                setTranslationLang(e.target.value as TranslationLanguage)
              }
              className="appearance-none w-full bg-secondary border border-border text-foreground py-2 pl-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              {TRANSLATION_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
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
      {surahId !== 9 && surahId !== 1 && (
        <div className="text-center font-arabic text-3xl md:text-4xl text-foreground mb-12 leading-loose">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </div>
      )}

      {/* Ayahs List */}
      <div className="space-y-8">
        {arabicData.ayahs.map((ayah, index) => {
          const translation = translationData.ayahs[index];
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

              <div className="flex flex-col space-y-6">
                <div
                  className="text-right font-arabic text-3xl md:text-4xl leading-[2.5] text-foreground"
                  dir="rtl"
                >
                  {arabicText}{" "}
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary/30 text-primary text-lg ml-2">
                    {ayah.numberInSurah}
                  </span>
                </div>

                <div className="text-lg text-muted-foreground leading-relaxed">
                  {translation.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="mt-12 flex justify-between items-center border-t border-border pt-8">
        <button
          onClick={() => {
            if (surahId > 1) {
              onNavigate(surahId - 1);
              window.scrollTo(0, 0);
            }
          }}
          disabled={surahId === 1}
          className="px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
        >
          Previous Surah
        </button>
        <button
          onClick={() => {
            if (surahId < 114) {
              onNavigate(surahId + 1);
              window.scrollTo(0, 0);
            }
          }}
          disabled={surahId === 114}
          className="px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
        >
          Next Surah
        </button>
      </div>
    </div>
  );
}
