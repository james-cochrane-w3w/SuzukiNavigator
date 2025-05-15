# what3words search box (CDN Edition)  
### Replit • Modern Web App (React + Vite + TypeScript)

> **STOP — YOU NEED AN API KEY FIRST!**  
> 1. Open the **Secrets** tab in Replit.  
> 2. Click **+ New secret**  
>    * **Key:** `VITE_W3W_API_KEY`  
>    * **Value:** *your developer key* from <https://developer.what3words.com>  
> 3. Press **Add secret**.  
>
> The component will **not work** until this key is set.

---

## 1 · Create or open a Modern Web App

*Choose “Modern web app (React + Node.js)” when you create the Repl.*  
Replit scaffolds a folder called **`client/`** that holds the React frontend.

---

## 2 · Add the what3words component via CDN (no npm)

1. Open **`client/index.html`**.  
2. Just before `</head>` paste these two lines:

```html
<!-- what3words web-component bundle -->
<script async type="module"
        src="https://cdn.what3words.com/javascript-components@5.0.0/dist/what3words/what3words.esm.js"></script>
<script nomodule
        src="https://cdn.what3words.com/javascript-components@5.0.0/dist/what3words/what3words.js"></script>
```

That’s it — no package install, no Vite config.

---

## 3 · Replace `client/src/App.tsx` with the demo

```tsx
import { useRef, useEffect, useState } from "react";

// ⬇ pulled from Replit Secrets (must be set!)
const API_KEY = import.meta.env.VITE_W3W_API_KEY as string;

export default function App() {
  const [words, setWords] = useState("");
  const [coords, setCoords] =
    useState<{ lat: number; lng: number } | null>(null);

  const ref = useRef<HTMLWhat3wordsAutosuggestElement>(null);

  // Alert if the key is missing
  useEffect(() => {
    if (!API_KEY) {
      alert(
        "what3words API key is missing!\n" +
          "Add it in Secrets as VITE_W3W_API_KEY and restart."
      );
    }
  }, []);

  // Listen for selection events
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: any) => {
      const w = e.detail.suggestion.words as string;
      setWords(w);
      setCoords(null);
      fetch(
        `https://api.what3words.com/v3/convert-to-coordinates?words=${w}&key=${API_KEY}`
      )
        .then((r) => r.json())
        .then((d) => setCoords(d.coordinates))
        .catch(console.error);
    };
    el.addEventListener("selected_suggestion", handler);
    return () => el.removeEventListener("selected_suggestion", handler);
  }, []);

  return (
    <main style={{ fontFamily: "system-ui", padding: "4rem 1rem", color: "#0A3049" }}>
      <h1 style={{ textAlign: "center", marginBottom: "0.25rem" }}>what3words search box</h1>
      <p style={{ textAlign: "center", fontSize: 18 }}>Enter a what3words address</p>

      {/* lower-case tag provided by the CDN bundle */}
      <what3words-autosuggest api_key={API_KEY} ref={ref}>
        <input
          type="text"
          placeholder="e.g. ///filled.count.soap"
          autoComplete="off"
          style={{
            width: "100%",
            maxWidth: 500,
            padding: "0.75rem",
            fontSize: 18,
            margin: "1rem auto",
            display: "block",
            border: "2px solid #0A3049",
            borderRadius: 6,
            outlineColor: "#E11F26",
          }}
        />
      </what3words-autosuggest>

      <div
        style={{
          border: "1px dashed #0A3049",
          minHeight: 80,
          maxWidth: 500,
          margin: "2rem auto",
          display: "grid",
          placeItems: "center",
          borderRadius: 8,
          fontSize: 16,
        }}
      >
        {words
          ? coords
            ? `${words} →  ${coords.lat}, ${coords.lng}`
            : "Fetching coordinates…"
          : "Your what3words address and the corresponding GPS coordinates will appear here"}
      </div>
    </main>
  );
}
```

---

## 4 · Run & test

1. Press **Run**.  
2. In the preview, type **`filled.count.soap`**.  
3. A dropdown appears → pick **filled.count.soap**.  
4. The box below shows the three words, then the coordinates.

---

## Troubleshooting

| Issue | Checklist |
|-------|-----------|
| **No suggestions appear** | • Is `VITE_W3W_API_KEY` set in Secrets?<br>• Key valid in your W3W dashboard?<br>• Type at least two words + part of a third. |
| **“Loading what3words API…” never disappears** | • Check the CDN `<script>` URLs are pasted exactly as shown. |
| **Alert: API key missing** | • Add the secret, then **stop & Run** again so Vite reloads the env vars. |

That’s all — no bundler tweaks, no extra packages.  
Enjoy instant what3words address search in your Replit app!
