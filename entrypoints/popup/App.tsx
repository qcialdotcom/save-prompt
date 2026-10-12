import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import PromptList from "@/components/PromptList";
import PromptForm from "@/components/PromptForm";
import { searchPrompts, type Prompt } from "@/lib/prompts";

export default function App() {
  const [query, setQuery] = useState("");
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  // null = show list, "new" = new form, Prompt = edit form
  const [editing, setEditing] = useState<Prompt | "new" | null>(null);

  const load = useCallback(async () => {
    setPrompts(await searchPrompts(query));
  }, [query]);

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
      <main className="flex-1 overflow-y-auto">
        {editing ? (
          <PromptForm
            prompt={editing === "new" ? undefined : editing}
            onDone={closeForm}
          />
        ) : (
          <>
            <SearchBar
              query={query}
              onChange={setQuery}
              onAdd={() => setEditing("new")}
            />
            <PromptList
              prompts={prompts}
              onEdit={setEditing}
              onChanged={load}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
