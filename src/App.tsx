import { useState, useEffect } from "react";
import { Moon, Sun, BookOpen } from "lucide-react";
import { SurahList } from "./components/SurahList";
import { SurahView } from "./components/SurahView";

export default function App() {
  const [selectedSurah, setSelectedSurah] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        const parsed = parseInt(pathParts[0], 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 114) {
          return parsed;
        }
      }

      // Fallback for old query param format
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

  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("app-theme");
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'sepia') {
        return savedTheme;
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const currentSurah = pathParts.length > 0 ? pathParts[0] : null;
      const newSurah = selectedSurah ? selectedSurah.toString() : null;
      
      if (currentSurah !== newSurah) {
        if (selectedSurah) {
          window.history.pushState({}, "", `/${selectedSurah}`);
        } else {
          window.history.pushState({}, "", "/");
        }
      }
    }
  }, [selectedSurah]);

  useEffect(() => {
    const handlePopState = () => {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        const parsed = parseInt(pathParts[0], 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 114) {
          setSelectedSurah(parsed);
          return;
        }
      }

      // Fallback for old query param format
      const params = new URLSearchParams(window.location.search);
      const surahParam = params.get("surah");
      if (surahParam) {
        const parsed = parseInt(surahParam, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 114) {
          setSelectedSurah(parsed);
          return;
        }
      }
      
      setSelectedSurah(null);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("app-theme", theme);
      document.documentElement.classList.remove("light", "dark", "sepia");
      if (theme !== 'light') {
        document.documentElement.classList.add(theme);
      }
    }
  }, [theme]);

  const cycleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'sepia';
      return 'light';
    });
  };

  useEffect(() => {
    if (!selectedSurah) {
      document.title = "Al Quran";
    }
  }, [selectedSurah]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-4xl">
          <a
            href="/"
            className="font-bold text-xl tracking-tight cursor-pointer text-primary"
            onClick={(e) => {
              e.preventDefault();
              setSelectedSurah(null);
            }}
          >
            Al Quran
          </a>
          <button
            onClick={cycleTheme}
            className="p-2 rounded-full hover:bg-secondary transition-all active:scale-95"
            aria-label="Toggle theme"
            title={`Current theme: ${theme}`}
          >
            {theme === 'light' && <Sun className="w-5 h-5" />}
            {theme === 'dark' && <Moon className="w-5 h-5" />}
            {theme === 'sepia' && <BookOpen className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="animate-in fade-in duration-500">
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
