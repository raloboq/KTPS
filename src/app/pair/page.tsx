//import { Room } from "@/app/pair/Room";

import { CollaborativeEditor } from "@/components/CollaborativeEditor";
import Room from "@/app/pair/Room";

export default function Home() {
  return (
    <main>
      <Room>
        <CollaborativeEditor />
      </Room>
    </main>
  );
}
