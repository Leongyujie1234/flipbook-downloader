"use client";

interface BookInfoCardProps {
  title: string;
  totalPages: number;
  platform: string;
}

export default function BookInfoCard({ title, totalPages, platform }: BookInfoCardProps) {
  const platformLabel = platform === "anyflip" ? "AnyFlip" : "FlipHTML5";
  const platformColor = platform === "anyflip" ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";

  return (
    <div className="w-full p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {title}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {totalPages} page{totalPages !== 1 ? "s" : ""}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${platformColor}`}>
          {platformLabel}
        </span>
      </div>
    </div>
  );
}
