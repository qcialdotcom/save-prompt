// src/ui/components/ActionBar.tsx

import DeleteAllButton from "./DeleteAllButton.tsx";
import FavoritesFilter from "./FavoritesFilter.tsx";
import ImportExportButton from "./ImportExportButton.tsx";
import SettingsButton from "./SettingsButton.tsx";
import SyncButton from "./SyncButton.tsx";

interface Props {
  onlyFavorites: boolean;
  onToggleFavorites: () => void;
  onChanged: () => void;
}

export default function ActionBar({ onlyFavorites, onToggleFavorites, onChanged }: Props) {
  return (
    <div className="flex items-center gap-2 px-4 pb-3">
      <FavoritesFilter active={onlyFavorites} onToggle={onToggleFavorites} />

      <div className="flex items-center gap-2 ml-auto">
        <SyncButton onChanged={onChanged} />
        <ImportExportButton onChanged={onChanged} />
        <SettingsButton />
        <DeleteAllButton onChanged={onChanged} />
      </div>
    </div>
  );
}
