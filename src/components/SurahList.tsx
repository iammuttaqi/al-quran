import { useState, useEffect } from "react";
import { Search, BookOpen } from "lucide-react";
import { SurahMeta, ApiResponse } from "../types";
import { cn } from "../lib/utils";

interface SurahListProps {
  onSelectSurah: (id: number) => void;
  initialData?: any;
}

export function SurahList({ onSelectSurah, initialData }: SurahListProps) {
  const [surahs, setSurahs] = useState<SurahMeta[]>(() => {
    return initialData?.surahs || [];
  });
  const [loading, setLoading] = useState(() => {
    return !initialData?.surahs;
  });
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
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
            className="group relative flex flex-col p-4 bg-card border border-border/60 rounded-2xl hover:border-primary/50 hover:shadow-md transition-all duration-300 active:scale-[0.98] text-left animate-in fade-in slide-in-from-bottom-4 overflow-hidden"
            style={{ animationDelay: `${Math.min(index * 30, 500)}ms`, animationFillMode: 'both' }}
          > 
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="flex justify-between items-start mb-3 relative z-10">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/80 text-secondary-foreground font-medium text-xs group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {surah.number}
              </div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider bg-secondary/40 px-2.5 py-1 rounded-full">
                {surah.revelationType} • {surah.numberOfAyahs} Ayahs
              </div>
            </div>
            
            <div className="relative z-10 flex justify-between items-end mt-2">
              <div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {surah.englishName}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {surah.englishNameTranslation}
                </p>
              </div>
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
