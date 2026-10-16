// components/FavoritesFilter.tsx

interface Props {
  active: boolean;
  onToggle: () => void;
}

export default function FavoritesFilter({ active, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full border cursor-pointer ${
        active
          ? "bg-primary text-on-primary border-primary"
          : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
      }`}
    >
      <svg
        className="size-3.5"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
      </svg>
      Favorites
    </button>
  );
}
