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
      <button
        onClick={onAdd}
        className="px-3 py-2 text-sm font-medium rounded-lg bg-primary text-on-primary shadow-sm shadow-shadow-primary hover:opacity-90 cursor-pointer"
      >
        + Add new
      </button>
    </div>
  );
}
