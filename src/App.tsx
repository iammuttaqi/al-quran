import { useState, useEffect } from "react";
import { Moon, Sun, BookOpen } from "lucide-react";
import { SurahList } from "./components/SurahList";
import { SurahView } from "./components/SurahView";
import { BackgroundElements } from "./components/BackgroundElements";

export default function App() {
  const [selectedSurah, setSelectedSurah] = useState<number | null>(() => {
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
    return null;
  });

  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem("app-theme");
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'sepia') {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
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
    localStorage.setItem("app-theme", theme);
    document.documentElement.classList.remove("light", "dark", "sepia");
    if (theme !== 'light') {
      document.documentElement.classList.add(theme);
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-1000 relative">
      <BackgroundElements />

      <div className="relative z-10">
        <main className="animate-in fade-in duration-700">
          {selectedSurah ? (
            <SurahView
              surahId={selectedSurah}
              onBack={() => setSelectedSurah(null)}
              onNavigate={(id) => setSelectedSurah(id)}
              theme={theme}
              cycleTheme={cycleTheme}
            />
          ) : (
            <SurahList 
              onSelectSurah={setSelectedSurah} 
              theme={theme}
              cycleTheme={cycleTheme}
            />
          )}
        </main>
      </div>
    </div>
  );
}
