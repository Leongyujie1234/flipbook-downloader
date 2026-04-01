"use client";

interface PageRangeSelectorProps {
  totalPages: number;
  fromPage: number;
  toPage: number;
  onFromChange: (page: number) => void;
  onToChange: (page: number) => void;
  disabled?: boolean;
}

export default function PageRangeSelector({
  totalPages,
  fromPage,
  toPage,
  onFromChange,
  onToChange,
  disabled,
}: PageRangeSelectorProps) {
  function setAll() {
    onFromChange(1);
    onToChange(totalPages);
  }

  function setFirst(n: number) {
    onFromChange(1);
    onToChange(Math.min(n, totalPages));
  }

  const pageCount = toPage - fromPage + 1;

  return (
    <div className="w-full flex flex-col gap-3">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Page Range
      </label>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500 dark:text-zinc-400">From</label>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={fromPage}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 1 && v <= totalPages) onFromChange(v);
            }}
            disabled={disabled}
            className="w-20 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500 dark:text-zinc-400">To</label>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={toPage}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 1 && v <= totalPages) onToChange(v);
            }}
            disabled={disabled}
            className="w-20 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          ({pageCount} page{pageCount !== 1 ? "s" : ""})
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={setAll}
          disabled={disabled}
          className="px-3 py-1.5 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          All pages
        </button>
        <button
          onClick={() => setFirst(10)}
          disabled={disabled}
          className="px-3 py-1.5 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          First 10
        </button>
        <button
          onClick={() => setFirst(25)}
          disabled={disabled}
          className="px-3 py-1.5 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          First 25
        </button>
        <button
          onClick={() => setFirst(50)}
          disabled={disabled}
          className="px-3 py-1.5 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          First 50
        </button>
      </div>
    </div>
  );
}
