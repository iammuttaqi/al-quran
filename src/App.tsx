import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { SurahList } from "./components/SurahList";
import { SurahView } from "./components/SurahView";

export default function App() {
  const [selectedSurah, setSelectedSurah] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const surahParam = params.get("surah");
      if (surahParam) {
        const parsed = parseInt(surahParam, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 114) {
          return parsed;
        }
      }
    }
    return null;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        document.documentElement.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (selectedSurah) {
        url.searchParams.set("surah", selectedSurah.toString());
      } else {
        url.searchParams.delete("surah");
      }
      window.history.pushState({}, "", url.toString());
    }
  }, [selectedSurah]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const surahParam = params.get("surah");
      if (surahParam) {
        const parsed = parseInt(surahParam, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 114) {
          setSelectedSurah(parsed);
        } else {
          setSelectedSurah(null);
        }
      } else {
        setSelectedSurah(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-4xl">
          <div
            className="font-bold text-xl tracking-tight cursor-pointer text-primary"
            onClick={() => setSelectedSurah(null)}
          >
            Al Quran
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      <main>
        {selectedSurah ? (
          <SurahView
            surahId={selectedSurah}
            onBack={() => setSelectedSurah(null)}
            onNavigate={(id) => setSelectedSurah(id)}
          />
        ) : (
          <SurahList onSelectSurah={setSelectedSurah} />
        )}
      </main>
    </div>
  );
}
