
# Quickstart: Build a what3words Map in Replit (React, **CDN build**)

## Overview
Embed the what3words Map component in a fresh React Replit *without editing `vite.config`*. We load the component directly from the CDN so Vite’s dependency optimiser never touches it.

---

## 1 · Create a React project
1. Log in to Replit and click **➕ Create Repl**.  
2. Choose **React (Vite)** *or* **Modern Web App** – the CDN route works with either template.  
3. Name it `w3w-map-cdn` and hit **Create Repl**.

> **Why CDN?** Templates often lock or omit `vite.config`; loading the component from the CDN sidesteps Vite’s pre‑bundling step entirely.

---

## 2 · Load the what3words components from the CDN
Open **public/index.html** and, just before `</head>`, add:

```html
<!-- what3words custom elements -->
<script type="module" defer
        src="https://cdn.what3words.com/javascript-components@5.0.0/dist/what3words/what3words.esm.js"></script>
<script nomodule defer
        src="https://cdn.what3words.com/javascript-components@5.0.0/dist/what3words/what3words.js"></script>
```

---

## 3 · Reset global styles (stop scrollbars)
Add to **`src/index.css`** (or global stylesheet):

```css
html, body, #root {
  height: 100%;   /* let the React root fill the viewport */
  margin: 0;      /* remove default body margin that causes a scrollbar */
}

body {
  overflow: hidden;                /* prevent the map from scrolling the page */
  -webkit-overflow-scrolling: touch;
}
```

---

## 4 · Store your API keys as secrets
1. In Replit’s sidebar click **Secrets** 🔑  
2. Add with the `VITE_` prefix:  
   - `VITE_W3W_API_KEY` → *your‑w3w‑key*  
   - `VITE_GOOGLE_MAP_API_KEY` → *your‑google‑maps‑key*  
3. Restart the dev server so Vite exposes them.

---

## 5 · Create the Map component
Add `src/Map.jsx`:

```jsx
export default function W3WMap() {
  return (
    <what3words-map
      id="w3w-map"
      api_key={import.meta.env.VITE_W3W_API_KEY}
      map_api_key={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
      words="filled.count.soap"
      disable_default_ui
      fullscreen_control
      current_location_control_position="9"
      fullscreen_control_position="3"
      search_control_position="2"
    >
      {/* map canvas fills exactly the visible viewport on mobile & desktop */}
      <div slot="map" style={{ width: "100vw", height: "100dvh" }}></div>

      {/* centred, responsive search bar */}
      <div
        slot="search-control"
        style={{
          position: "absolute",
          top: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
        }}
      >
        <what3words-autosuggest>
          <input
            type="text"
            placeholder="Search what3words address"
            autoComplete="off"
            style={{
              width: "clamp(260px, 32ch, 380px)",
              padding: "12px 16px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              fontSize: "14px",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
        </what3words-autosuggest>
      </div>
    </what3words-map>
  );
}
```

> **Why `height:100dvh`?** The *dynamic* viewport unit always equals the space actually visible, so the map never hides behind browser chrome or causes scrollbars.

---

## 6 · Render the map
Replace `src/App.jsx` with:

```jsx
import W3WMap from "./Map";

export default function App() {
  return <W3WMap />;
}
```

---

## 7 · Run & test
Click **Run** ▶️ or run `npm run dev`. The preview shows a full‑height map with a centred search bar and **no white space or scrollbars** on desktop or mobile.

---

## 8 · Customise
| Feature | Example |
|---------|---------|
| Language | `<what3words-map language="fr">` |
| Map type | `map_type="satellite"` |
| Event listener | `mapEl.addEventListener('wordsChanged', e => console.log(e.detail.words));` |

---

## 9 · Troubleshooting
| Symptom | Fix |
|---------|-----|
| Grey tiles | Check Google Maps key & HTTP referrer restrictions |
| `api_key` error | Ensure secrets start with `VITE_` & restart server |
| Dropdown hidden | Give `<what3words-autosuggest>` a higher `z-index` |

---

## Further resources
- **Using the Web Map Component** tutorial  
- **@what3words/javascript-components** CDN reference  
- GitHub samples (React & Vanilla JS)
