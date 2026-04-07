import * as React from "react";
import { AboutModal } from "../about";
import { Frame } from "../frame";
import { InfiniteCanvas } from "../infinite-canvas";
import type { MediaItem } from "../infinite-canvas/types";
import { PageLoader } from "../loader";
import { preloadFont } from "troika-three-text";

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

export function App() {
  const [media, setMedia] = React.useState<MediaItem[]>([]);
  const [textureProgress, setTextureProgress] = React.useState(0);

  React.useEffect(() => {
    fetch("/artworks/manifest.json")
      .then((res) => res.json())
      .then((data) => setMedia(data));
  }, []);

  if (!media.length) {
    return <PageLoader progress={0} />;
  }

  return (
    <>
      <Frame />
      <AboutModal />
      <PageLoader progress={textureProgress} />
      <InfiniteCanvas media={media} onTextureProgress={setTextureProgress} />
    </>
  );
}
