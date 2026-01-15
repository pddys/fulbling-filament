import * as React from "react";
import { Frame } from "../frame";
import { InfiniteCanvas } from "../infinite-canvas";
import type { MediaItem } from "../infinite-canvas/types";
import { PageLoader } from "../loader";

export function App() {
  const [media, setMedia] = React.useState<MediaItem[]>([]);
  const [textureProgress, setTextureProgress] = React.useState(0);

  React.useEffect(() => {
    fetch('/artworks/manifest.json')
      .then(res => res.json())
      .then(data => {
        const cards: MediaItem[] = [
          { 
            id: 'card-1', 
            src: '', 
            type: 'card',
            content: { title: 'Hello World', description: 'This is a card' }
          },
          { 
            id: 'card-2', 
            src: '', 
            type: 'card',
            content: { title: 'Another Card', description: 'More content here' }
          },
        ];
        
        const combined = [...data];
        setMedia(combined);
      });
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