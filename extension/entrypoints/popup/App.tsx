// entrypoints/popup/App.tsx

import FilterBar from "@/components/FilterBar";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PromptList from "@/components/PromptList";
import SearchBar from "@/components/SearchBar";
import { searchPrompts, type Prompt } from "@/lib/prompts";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";

const PromptForm = lazy(() => import("@/components/PromptForm"));

export default function App() {
  const [query, setQuery] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  // null = show list, "new" = new form, Prompt = edit form
  const [editing, setEditing] = useState<Prompt | "new" | null>(null);

  const load = useCallback(async () => {
    const result = await searchPrompts(query);
    setPrompts(onlyFavorites ? result.filter((p) => p.isFavorite) : result);
  }, [query, onlyFavorites]);

  useEffect(() => {
    load();
  }, [load]);

  function closeForm() {
    setEditing(null);
    load();
  }

  return (
    <div className="w-full h-full flex flex-col">
      <Navbar />

      <main className="flex-1 min-h-0 flex flex-col">
        {editing ? (
          <Suspense
            fallback={
              <div className="flex-1 p-4 text-sm text-on-surface-variant">
                Loading form...
              </div>
            }
          >
            <PromptForm
              prompt={editing === "new" ? undefined : editing}
              onDone={closeForm}
            />
          </Suspense>
        ) : (
          <>
            {/* Fixed part: does not scroll */}
            <div className="shrink-0">
              <SearchBar
                query={query}
                onChange={setQuery}
                onAdd={() => setEditing("new")}
              />
              <FilterBar
                onlyFavorites={onlyFavorites}
                onToggleFavorites={() => setOnlyFavorites(!onlyFavorites)}
                onChanged={load}
              />
            </div>

            {/* Only this part scrolls */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <PromptList
                prompts={prompts}
                onEdit={setEditing}
                onChanged={load}
              />
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
