import * as React from "react";
import { AboutModal } from "../about";
import { Frame } from "../frame";
import { InfiniteCanvas } from "../infinite-canvas";
import type { MediaItem } from "../infinite-canvas/types";
import { PageLoader } from "../loader";
import { SourceSelector } from "../source-selector";
import type { Source } from "../source-selector";
import { ThemeToggle } from "../theme-toggle";
import { preloadFont } from "troika-three-text";

const SOURCES: Source[] = [
  {
    id: "wolverhamptongrand",
    label: "Wolverhampton Grand",
    url: "/api/events/wolverhamptongrand",
  },
  { id: "operanorth", label: "Opera North", url: "/api/events/operanorth" },
  { id: "bac", label: "BAC", url: "/api/events/bac" },
  {
    id: "leedsheritagetheatres",
    label: "Leeds Heritage",
    url: "/api/events/leedsheritagetheatres",
  },
  {
    id: "pitlochryfestivaltheatre",
    label: "Pitlochry Festival Theatre",
    url: "/api/events/pitlochryfestivaltheatre",
  },
  {
    id: "bristolbeacon",
    label: "Bristol Beacon",
    url: "/api/events/bristolbeacon",
  },
  { id: "mcc", label: "MCC Theater", url: "/api/events/mcc" },
  { id: "minack", label: "Minack Theatre", url: "/api/events/minack" },
  {
    id: "birminghamrep",
    label: "Birmingham Rep",
    url: "/api/events/birminghamrep",
  },
  {
    id: "bridgetheatrelondon",
    label: "Bridge Theatre",
    url: "/api/events/bridgetheatrelondon",
  },
];

function mapEventsToMedia(events: any[]): MediaItem[] {
  return events
    .map((e): MediaItem | null => {
      const url = e.imageUrl || e.thumbnailUrl;
      if (!url) return null;
      return {
        id: e.id,
        type: "image",
        url,
        title: e.name ?? undefined,
        artist: e.description ?? undefined,
        year: e.instanceDates ?? undefined,
      };
    })
    .filter((item): item is MediaItem => item !== null);
}

const FONT_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,'-& ";

preloadFont({
  font: "/fonts/TeX-Gyre-Heros/texgyreheroscn-bold.otf",
  characters: FONT_CHARS,
});

preloadFont({
  font: "/fonts/TeX-Gyre-Heros/texgyreheroscn-regular.otf",
  characters: FONT_CHARS,
});

const THEMES = {
  light: {
    backgroundColor: "#ffffff",
    fogColor: "#ffffff",
    textColor: "black",
    subtitleColor: "#444444",
  },
  dark: {
    backgroundColor: "#0C090A",
    fogColor: "#0C090A",
    textColor: "white",
    subtitleColor: "#aaaaaa",
  },
};

export function App() {
  const [media, setMedia] = React.useState<MediaItem[]>([]);
  const [textureProgress, setTextureProgress] = React.useState(0);
  const [selectedId, setSelectedId] = React.useState(SOURCES[0].id);
  const [loading, setLoading] = React.useState(true);
  const [canvasReady, setCanvasReady] = React.useState(false);
  const firstTextureCalledRef = React.useRef(false);
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [showHud, setShowHud] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleFirstTextureLoaded = React.useCallback(() => {
    if (!firstTextureCalledRef.current) {
      firstTextureCalledRef.current = true;
      setCanvasReady(true);
    }
  }, []);

  React.useEffect(() => {
    const source = SOURCES.find((s) => s.id === selectedId)!;
    setLoading(true);
    setTextureProgress(0);
    setCanvasReady(false);
    firstTextureCalledRef.current = false;
    fetch(source.url)
      .then((res) => res.json())
      .then((data) => {
        setMedia(mapEventsToMedia(data));
        setLoading(false);
      });
  }, [selectedId]);

  if (!media.length && loading) {
    return <PageLoader progress={0} />;
  }

  const themeColors = THEMES[theme];

  return (
    <>
      <div
        style={{
          opacity: showHud ? 1 : 0,
          pointerEvents: showHud ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      >
        <Frame />
      </div>
      <div className='controls-container'>
        <SourceSelector
          sources={SOURCES}
          selected={selectedId}
          loading={loading}
          onSelect={setSelectedId}
        />
        <AboutModal />
        <ThemeToggle
          theme={theme}
          onToggle={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
          showHud={showHud}
          onToggleHud={() => setShowHud((v) => !v)}
        />
      </div>
      <PageLoader progress={textureProgress} />
      <div
        style={{
          filter:
            loading || !canvasReady ? "blur(16px) brightness(0.5)" : "none",
          transition: loading ? "filter 0.3s ease" : "filter 0.6s ease",
          position: "fixed",
          inset: 0,
        }}
      >
        <InfiniteCanvas
          media={media}
          onTextureProgress={setTextureProgress}
          onFirstTextureLoaded={handleFirstTextureLoaded}
          {...themeColors}
        />
      </div>
    </>
  );
}
