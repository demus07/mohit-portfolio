import { Loader } from "@/components/chrome/Loader";
import { Nav } from "@/components/chrome/Nav";
import { ActionBar } from "@/components/chrome/ActionBar";
import { Bhayandar } from "@/components/scenes/Bhayandar";
import { Route } from "@/components/scenes/Route";
import { Station } from "@/components/scenes/Station";
import { Dalal } from "@/components/scenes/Dalal";
import { Wankhede } from "@/components/scenes/Wankhede";
import { Temple } from "@/components/scenes/Temple";

// The evening local pulling into Bhayandar, then the story of how he got on it: the ride in,
// Churchgate, Dalal Street at noon, Wankhede at dusk, and Siddhivinayak after dark to close.
export default function Home() {
  return (
    <>
      <Loader />
      <div className="grain" aria-hidden="true" />
      <Nav />
      <Bhayandar />
      <main>
        <Route />
        <Station />
        <Dalal />
        <Wankhede />
      </main>
      <Temple />
      <ActionBar />
    </>
  );
}
