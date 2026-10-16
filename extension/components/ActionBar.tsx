// components/ActionBar.tsx

import DeleteAllButton from "@/components/DeleteAllButton";
import FavoritesFilter from "@/components/FavoritesFilter";
import ImportExportButton from "@/components/ImportExportButton";
import SettingsButton from "@/components/SettingsButton";
import SyncButton from "@/components/SyncButton";

interface Props {
  onlyFavorites: boolean;
  onToggleFavorites: () => void;
  onChanged: () => void; // reload list after delete all / import / sync
}

export default function ActionBar({
  onlyFavorites,
  onToggleFavorites,
  onChanged,
}: Props) {
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
