import * as React from "react";
import { Frame } from "../frame";
import { InfiniteCanvas } from "../infinite-canvas";
import type { MediaItem } from "../infinite-canvas/types";
import { PageLoader } from "../loader";
import { preloadFont } from "troika-three-text";

preloadFont({
  characters:
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,'-& ",
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
      <PageLoader progress={textureProgress} />
      <InfiniteCanvas media={media} onTextureProgress={setTextureProgress} />
    </>
  );
}
