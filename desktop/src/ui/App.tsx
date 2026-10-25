// src/ui/App.tsx

import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import ActionBar from "./components/ActionBar.tsx";
import Footer from "./components/Footer.tsx";
import Navbar from "./components/Navbar.tsx";
import PromptList from "./components/PromptList.tsx";
import SearchBar from "./components/SearchBar.tsx";
import { api, errorMessage, hasApi } from "./api.ts";
import type { Prompt } from "../shared/api.ts";

const PromptForm = lazy(() => import("./components/PromptForm.tsx"));

export default function App() {
  const [query, setQuery] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loadError, setLoadError] = useState("");
  const [version, setVersion] = useState(0);
  const [editing, setEditing] = useState<Prompt | "new" | null>(null);

  const load = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (!hasApi) return;
    let stale = false;

    const timer = setTimeout(
      async () => {
        try {
          const result = await api.searchPrompts(query, onlyFavorites);
          if (stale) return;
          setPrompts(result);
          setLoadError("");
        } catch (err) {
          if (!stale) setLoadError(errorMessage(err, "Could not load prompts."));
        }
      },
      query ? 150 : 0,
    );

    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [query, onlyFavorites, version]);

  useEffect(() => (hasApi ? api.onPromptsChanged(load) : undefined), [load]);

  function closeForm() {
    setEditing(null);
    load();
  }

  if (!hasApi) {
    return (
      <div className="flex items-center justify-center w-screen h-screen p-6 text-sm text-center text-on-surface-variant">
        Save Prompt must be opened in the desktop app.
      </div>
    );
  }

  return (
    <div className="flex flex-col w-screen h-screen bg-background text-on-background">
      <Navbar />

      <main className="flex flex-col flex-1 min-h-0">
        {editing ? (
          <Suspense fallback={<div className="flex-1 p-4 text-sm text-on-surface-variant">Loading form...</div>}>
            <PromptForm prompt={editing === "new" ? undefined : editing} onDone={closeForm} />
          </Suspense>
        ) : (
          <>
            <div className="shrink-0">
              <SearchBar query={query} onChange={setQuery} onAdd={() => setEditing("new")} />
              <ActionBar
                onlyFavorites={onlyFavorites}
                onToggleFavorites={() => setOnlyFavorites(!onlyFavorites)}
                onChanged={load}
              />
            </div>

            {loadError && (
              <p role="alert" className="px-4 pb-2 text-xs text-error">
                {loadError}
              </p>
            )}

            <div className="flex-1 min-h-0 overflow-y-auto">
              <PromptList prompts={prompts} isFiltered={query.trim() !== "" || onlyFavorites} onEdit={setEditing} onChanged={load} />
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
