import { Loader } from "@/components/chrome/Loader";
import { Nav } from "@/components/chrome/Nav";
import { ActionBar } from "@/components/chrome/ActionBar";
import { Walk } from "@/components/paint/Walk";

// One walk through his Mumbai: the city from the air, the bay from the parapet, the work, the line
// down to Churchgate stopping at every role, and Wankhede under its lights.
export default function Home() {
  return (
    <>
      <Loader />
      <div className="grain" aria-hidden="true" />
      <Nav />
      <Walk />
      <ActionBar />
    </>
  );
}
