import { Icon } from "svg-sprite-watcher/components/react";

export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Next.js SVG Sprite Test</h1>
      <Icon name="circle" size={100} />
    </main>
  );
}
