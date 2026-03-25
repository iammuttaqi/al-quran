import { useState, useEffect } from "react";
import { Search, BookOpen, Sun, Moon } from "lucide-react";
import { SurahMeta, ApiResponse } from "../types";
import { cn } from "../lib/utils";

interface SurahListProps {
  onSelectSurah: (id: number) => void;
  theme: string;
  cycleTheme: () => void;
}

export function SurahList({ onSelectSurah, theme, cycleTheme }: SurahListProps) {
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (surahs.length > 0) return;
    fetch("https://api.alquran.cloud/v1/surah")
      .then((res) => res.json())
      .then((data: ApiResponse<SurahMeta[]>) => {
        setSurahs(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch surahs:", err);
        setLoading(false);
      });
  }, [surahs.length]);

  const filteredSurahs = surahs.filter(
    (surah) =>
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.englishNameTranslation
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      surah.name.includes(searchQuery),
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="h-10 bg-secondary/50 rounded w-48 mb-4"></div>
          <div className="h-4 bg-secondary/30 rounded w-64"></div>
        </div>
        <div className="relative mb-8 max-w-md mx-auto">
          <div className="h-12 bg-secondary/40 rounded-xl w-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-5 bg-card border border-border/60 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/50"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-secondary/40 rounded w-24"></div>
                  <div className="h-3 bg-secondary/30 rounded w-16"></div>
                </div>
              </div>
              <div className="h-6 bg-secondary/40 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <div className="absolute top-4 right-4 sm:top-8 sm:right-4">
        <button
          onClick={cycleTheme}
          className="p-2.5 rounded-full bg-card border border-border/60 hover:bg-secondary hover:border-primary/50 transition-all duration-500 active:scale-95 shadow-sm"
          aria-label="Toggle theme"
          title={`Current theme: ${theme}`}
        >
          {theme === 'light' && <Sun className="w-5 h-5 text-foreground" />}
          {theme === 'dark' && <Moon className="w-5 h-5 text-foreground" />}
          {theme === 'sepia' && <BookOpen className="w-5 h-5 text-foreground" />}
        </button>
      </div>

      <div className="mb-8 text-center pt-8 sm:pt-4">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Al Quran</h1>
        <p className="text-muted-foreground">
          Read, study, and learn The Noble Quran.
        </p>
      </div>

      <div className="relative mb-8 max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl leading-5 bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-shadow"
          placeholder="Search by Surah name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSurahs.map((surah, index) => (
          <a
            key={surah.number}
            href={`/${surah.number}`}
            onClick={(e) => {
              e.preventDefault();
              onSelectSurah(surah.number);
            }}
            className="group relative flex items-center p-5 bg-card border border-border/60 rounded-2xl hover:border-primary/50 hover:shadow-md transition-all duration-300 active:scale-[0.98] text-left animate-in fade-in slide-in-from-bottom-4 overflow-hidden"
            style={{ animationDelay: `${Math.min(index * 30, 500)}ms`, animationFillMode: 'both' }}
          > 
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="flex items-center justify-center shrink-0 w-12 h-12 rounded-full bg-secondary/80 text-secondary-foreground font-semibold text-base group-hover:bg-primary/10 group-hover:text-primary transition-colors mr-4 relative z-10">
              {surah.number}
            </div>

            <div className="flex-1 min-w-0 relative z-10 pr-2">
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                {surah.englishName}
              </h3>
              <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-1.5">
                <span className="truncate">{surah.englishNameTranslation}</span>
                <span className="shrink-0 opacity-50">•</span>
                <span className="shrink-0">{surah.numberOfAyahs} Ayahs</span>
              </div>
            </div>

            <div className="shrink-0 relative z-10 text-muted-foreground/50 group-hover:text-primary transition-all duration-300 transform group-hover:translate-x-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
            
            {/* Decorative background element on the right */}
            <div className="absolute -right-6 -bottom-6 opacity-[0.02] group-hover:opacity-[0.06] transition-all duration-500 pointer-events-none text-foreground transform group-hover:rotate-12">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" transform="rotate(45 12 12)" />
              </svg>
            </div>
          </a>
        ))}
      </div>

      {filteredSurahs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No Surahs found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
}
