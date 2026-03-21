import { useState, useEffect } from "react";
import { Search, BookOpen } from "lucide-react";
import { SurahMeta, ApiResponse } from "../types";
import { cn } from "../lib/utils";

interface SurahListProps {
  onSelectSurah: (id: number) => void;
}

export function SurahList({ onSelectSurah }: SurahListProps) {
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
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
  }, []);

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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
        {filteredSurahs.map((surah) => (
          <button
            key={surah.number}
            onClick={() => onSelectSurah(surah.number)}
            className="flex items-center p-4 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all text-left group"
          >
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-secondary rounded-full text-secondary-foreground font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors relative">
              <span className="absolute inset-0 flex items-center justify-center opacity-10 text-4xl">
                <BookOpen className="w-8 h-8" />
              </span>
              {surah.number}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {surah.englishName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {surah.englishNameTranslation}
              </p>
            </div>
            <div className="text-right">
              <div className="font-arabic text-xl text-foreground">
                {surah.name}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {surah.numberOfAyahs} Ayahs
              </p>
            </div>
          </button>
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
