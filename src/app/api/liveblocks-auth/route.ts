/*import { Liveblocks } from "@liveblocks/node";
import { NextRequest } from "next/server";

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
*/

/*
import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";

const LIVEBLOCKS_SECRET_KEY = process.env.LIVEBLOCKS_SECRET_KEY;

if (!LIVEBLOCKS_SECRET_KEY) {
  throw new Error("LIVEBLOCKS_SECRET_KEY is not set");
}

const liveblocks = new Liveblocks({
  secret: LIVEBLOCKS_SECRET_KEY,
});

const USER_INFO = [
  {
    color: "#D583F0",
    picture: "https://liveblocks.io/avatars/avatar-1.png",
  },
  {
    color: "#87EE85",
    picture: "https://liveblocks.io/avatars/avatar-8.png",
  },
];

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("rouuuuteeee");
    console.log("Received data:", data);

    // Asegúrate de que el nombre del usuario se proporciona en la solicitud
    if (!data.userName) {
      return new NextResponse(JSON.stringify({ error: "User name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = Math.floor(Math.random() * USER_INFO.length);
    const randomUserInfo = USER_INFO[userId];

    // Crear userr2 dinámicamente con el nombre proporcionado
    const userr2 = {
      name: data.userName,
      color: randomUserInfo.color,
      picture: randomUserInfo.picture,
    };

    // Create a session for the current user
    // userInfo is made available in Liveblocks presence hooks, e.g. useOthers
    const session = liveblocks.prepareSession(`user-${userId}`, {
      userInfo: userr2,
    });

    session.allow("liveblocks:examples:*", session.FULL_ACCESS);

    const { body, status } = await session.authorize();
    return new NextResponse(body, { status });
  } catch (error) {
    console.error("Error in POST handler:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}*/
/*import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

console.log("Liveblocks API route initialized");

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
];*/

/*export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("Received data:", data);

    // Check if userName is provided
    if (!data.userName) {
      console.log("paila");
     //return NextResponse.json({ error: data }, { status: 200 });
    }
    

    const userId = Math.floor(Math.random() * USER_INFO.length);
    const randomUserInfo = USER_INFO[userId];

    const userInfo = {
      name: data.userName, // Use the provided userName
      color: randomUserInfo.color,
      picture: randomUserInfo.picture,
    };

    console.log("Creating session for user:", userInfo);

    // Create a session for the current user
    const session = liveblocks.prepareSession(`user-${userId}`, {
      userInfo: userInfo,
    });

    // Use a naming pattern to allow access to rooms with a wildcard
    session.allow(`liveblocks:examples:*`, session.FULL_ACCESS);

    // Authorize the user and return the result
    const { body, status } = await session.authorize();
    console.log("Authorization successful, status:", status);
    
    return new NextResponse(body, { status });
  

  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}*/

//ultima version 21 septiembre 
/*let callCount = 0;
let lastUserName: string | null = null;

export async function POST(request: NextRequest) {
  callCount++;
  try {
    const data = await request.json();
    console.log(`Call #${callCount} - Received data:`, data);

    let userInfo;
    let sessionId;

    if (data.room) {
      // Si se recibe 'room', usamos el último userName conocido
      console.log(`Call #${callCount} - Received room request, using last known userName:`, lastUserName);
      if (lastUserName) {
        const userId = Math.floor(Math.random() * USER_INFO.length);
        const randomUserInfo = USER_INFO[userId];
        sessionId = `user-${lastUserName}-${userId}`;
        userInfo = {
          name: lastUserName,
          color: randomUserInfo.color,
          picture: randomUserInfo.picture,
        };
      } else {
        console.log(`Call #${callCount} - No previous userName, using Anonymous`);
        sessionId = `anonymous-${Date.now()}`;
        userInfo = { name: "Anonymous" };
      }
    } else if (data.userName) {
      lastUserName = data.userName;
      const userId = Math.floor(Math.random() * USER_INFO.length);
      const randomUserInfo = USER_INFO[userId];
      sessionId = `user-${data.userName}-${userId}`;
      userInfo = {
        name: data.userName,
        color: randomUserInfo.color,
        picture: randomUserInfo.picture,
      };
    } else {
      console.log(`Call #${callCount} - userName no proporcionado`);
      sessionId = `anonymous-${Date.now()}`;
      userInfo = { name: "Anonymous" };
    }

    console.log(`Call #${callCount} - Creating session for user:`, userInfo);

    const session = liveblocks.prepareSession(sessionId, { userInfo });

    // Otorgar acceso a todas las salas
    session.allow("*", [
      "room:write",
      "room:read",
      "room:presence:write",
      "comments:write",
      "comments:read"
    ]);

    const { body, status } = await session.authorize();
    console.log(`Call #${callCount} - Authorization successful, status:`, status);
    
    return new NextResponse(body, { status });

  } catch (error) {
    console.error(`Call #${callCount} - Error in POST handler:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}*/

//nueva version 23 septiembre
import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

const USER_INFO = [
  {
    color: "#D583F0",
    picture: "https://liveblocks.io/avatars/avatar-1.png",
  },
  {
    color: "#87EE85",
    picture: "https://liveblocks.io/avatars/avatar-8.png",
  },
];

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("Received data:", data);

    let userInfo;
    let sessionId;

    // Usar el userName proporcionado o generar uno aleatorio
    const userName = data.userName || `User_${Math.random().toString(36).substr(2, 9)}`;
    
    const userId = Math.floor(Math.random() * USER_INFO.length);
    const randomUserInfo = USER_INFO[userId];
    
    sessionId = `user-${userName}-${Date.now()}`;
    userInfo = {
      name: userName,
      color: randomUserInfo.color,
      picture: randomUserInfo.picture,
    };

    console.log("Creating session for user:", userInfo);

    const session = liveblocks.prepareSession(sessionId, { userInfo });

    // Otorgar acceso a todas las salas o a una sala específica si se proporciona
    if (data.room) {
      session.allow(data.room, [
        "room:write",
        "room:read",
        "room:presence:write",
        "comments:write",
        "comments:read"
      ]);
    } else {
      session.allow("*", [
        "room:write",
        "room:read",
        "room:presence:write",
        "comments:write",
        "comments:read"
      ]);
    }

    const { body, status } = await session.authorize();
    console.log("Authorization successful, status:", status);
    
    return new NextResponse(body, { status });

  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

//nueva version 22 septiembre

/*export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("Received data:", data);

    let userInfo;
    let sessionId;

    if (data.userName) {
      const userId = Math.floor(Math.random() * USER_INFO.length);
      const randomUserInfo = USER_INFO[userId];
      sessionId = `user-${data.userName}-${userId}`;
      userInfo = {
        name: data.userName,
        color: randomUserInfo.color,
        picture: randomUserInfo.picture,
      };
    } else {
      console.log("userName no proporcionado, usando valor por defecto");
      sessionId = `anonymous-${Date.now()}`;
      userInfo = { 
        name: "Anonymous User", 
        color: "#808080", 
        picture: "default-avatar-url.jpg" 
      };
    }

    console.log("Creating session for user:", userInfo);

    const session = liveblocks.prepareSession(sessionId, { userInfo });

    // Otorgar acceso a todas las salas
    session.allow("*", [
      "room:write",
      "room:read",
      "room:presence:write",
      "comments:write",
      "comments:read"
    ]);

    const { body, status } = await session.authorize();
    console.log("Authorization successful, status:", status);
    
    return new NextResponse(body, { status });

  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}*/
