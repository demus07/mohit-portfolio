import { Loader } from "@/components/chrome/Loader";
import { Nav } from "@/components/chrome/Nav";
import { ActionBar } from "@/components/chrome/ActionBar";
import { Churchgate } from "@/components/scenes/Churchgate";
import { Promenade } from "@/components/scenes/Promenade";
import { Work } from "@/components/scenes/Work";
import { Dusk } from "@/components/scenes/Dusk";
import { Temple } from "@/components/scenes/Temple";

// One walk: off the AC local at Churchgate, across to Marine Drive in the afternoon, the work in the
// shade, the lamps coming on along the bay at dusk, and Siddhivinayak after dark, where he resets.
export default function Home() {
  return (
    <>
      <Loader />
      <div className="grain" aria-hidden="true" />
      <Nav />
      <Churchgate />
      <main>
        <Promenade />
        <Work />
        <Dusk />
      </main>
      <Temple />
      <ActionBar />
    </>
  );
}
