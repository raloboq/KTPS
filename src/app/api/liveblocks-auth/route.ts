import { Liveblocks } from "@liveblocks/node";
import { NextRequest } from "next/server";


/**
 * Authenticating your Liveblocks application
 * https://liveblocks.io/docs/authentication
 */

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

console.log("RRR");

export async function POST(request: NextRequest) {
  const data = await request.json();
  console.log("rrrrr"+data);
  // Get the current user's unique id from your database

  const userr = {
    id: "charlielayne@example.com",
    info: {
      name: "Charlie LayneJ",
      color: "#D583F0",
      picture: "https://liveblocks.io/avatars/avatar-1.png",
    },
  };

  const userr2 = {
    
      name: "Charlie L",
      color: "#D583F0",
      picture: "https://liveblocks.io/avatars/avatar-1.png",
    
  };


  const userId = Math.floor(Math.random() * 10) % USER_INFO.length;

  // Create a session for the current user
  // userInfo is made available in Liveblocks presence hooks, e.g. useOthers
  const session = liveblocks.prepareSession(`user-${userId}`, {
    userInfo: userr2,
  });

  // Use a naming pattern to allow access to rooms with a wildcard
  session.allow(`liveblocks:examples:*`, session.FULL_ACCESS);

  // Authorize the user and return the result
  const { body, status } = await session.authorize();
  return new Response(body, { status });
}

const USER_INFO = [
  {
    name: "Charlie LayneR",
    color: "#D583F0",
    picture: "https://liveblocks.io/avatars/avatar-1.png",
  },
  
  {
    name: "Quinn EltonR",
    color: "#87EE85",
    picture: "https://liveblocks.io/avatars/avatar-8.png",
  },
];
