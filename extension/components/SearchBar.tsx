// components/SearchBar.tsx

interface Props {
  query: string;
  onChange: (value: string) => void;
  onAdd: () => void;
}

export default function SearchBar({ query, onChange, onAdd }: Props) {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search prompts..."
        className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-outline outline-none focus:border-primary"
      />
      <div className="relative shrink-0 group">
        <button
          type="button"
          aria-label="Search tips"
          aria-describedby="search-tips"
          className="flex items-center justify-center w-8 h-8 rounded-full text-on-surface-variant hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-primary cursor-help"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" d="M12 11v5m0-8h.01" />
          </svg>
        </button>
        <div
          id="search-tips"
          role="tooltip"
          className="pointer-events-none absolute right-0 top-full z-10 mt-2 w-56 rounded-lg bg-inverse-surface px-3 py-2.5 text-xs text-inverse-on-surface opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <p className="mb-1 font-semibold">Search tips</p>
          <p>
            <span className="font-medium">@title</span> searches titles only.
          </p>
          <p>
            <span className="font-medium">#tag</span> searches tags only.
          </p>
          <p>Without a prefix, search titles, content, and tags.</p>
        </div>
      </div>
      <button
        onClick={onAdd}
        className="px-3 py-2 text-sm font-medium rounded-lg bg-primary text-on-primary shadow-sm shadow-shadow-primary hover:opacity-90 cursor-pointer"
      >
        + Add new
      </button>
    </div>
  );
}
