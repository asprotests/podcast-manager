import React, { useEffect, useMemo, useReducer } from "react";
import AddVideoForm from "./components/AddVideoForm.jsx";
import VideoList from "./components/VideoList.jsx";
import Player from "./components/Player.jsx";

const initial = () => {
  try {
    return (
      JSON.parse(localStorage.getItem("podcasts-plus")) ?? {
        items: [],
        activeId: null,
      }
    );
  } catch {
    return { items: [], activeId: null };
  }
};

function reducer(state, action) {
  switch (action.type) {
    case "add": {
      const exists = state.items.some((v) => v.id === action.item.id);
      if (exists) return { ...state, activeId: action.item.id };
      return {
        ...state,
        items: [action.item, ...state.items],
        activeId: action.item.id,
      };
    }
    case "remove": {
      const items = state.items.filter((v) => v.id !== action.id);
      const activeId =
        state.activeId === action.id ? items[0]?.id ?? null : state.activeId;
      return { ...state, items, activeId };
    }
    case "activate":
      return { ...state, activeId: action.id };
    case "reorder":
      return { ...state, items: action.items };
    case "hydrate":
      return action.state;
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initial);
  useEffect(() => {
    localStorage.setItem("podcasts-plus", JSON.stringify(state));
  }, [state]);

  const active = useMemo(
    () => state.items.find((v) => v.id === state.activeId) ?? null,
    [state]
  );

  return (
    <div className="container py-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="heading">
            🎧{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500">
              Binaspro's Podcast{" "}
            </span>
            <span className="text-slate-400">Manager</span>
          </h1>
          <p className="subtle mt-1">
            Add YouTube links, keep your place, and continue anytime.
          </p>
        </div>
        <a
          className="btn btn-ghost"
          href="https://youtube.com"
          target="_blank"
          rel="noreferrer"
        >
          Open YouTube
        </a>
      </header>

      <section className="card p-4 md:p-6">
        <AddVideoForm onAdd={(item) => dispatch({ type: "add", item })} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Player area is 2/3 width on large screens */}
        <div className="lg:col-span-2 card p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Player</h2>
            {active && <span className="subtle">Playing: {active.title}</span>}
          </div>
          <Player video={active} />
        </div>

        {/* Library area 1/3 width */}
        <div className="lg:col-span-1 card p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Library</h2>
            <span className="subtle">
              {state.items.length} item{state.items.length === 1 ? "" : "s"}
            </span>
          </div>
          <VideoList
            items={state.items}
            activeId={state.activeId}
            onActivate={(id) => dispatch({ type: "activate", id })}
            onRemove={(id) => dispatch({ type: "remove", id })}
            onReorder={(items) => dispatch({ type: "reorder", items })}
          />
        </div>
      </section>
    </div>
  );
}
