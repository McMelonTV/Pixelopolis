import "./App.css";
// @deno-types="@types/react"
import {useEffect, useRef, useState} from "react";
import {Canvas, useFrame} from "@react-three/fiber";
import {
    BufferGeometry,
    Euler,
    EventHandlers,
    ExtendedColors,
    Layers,
    Material,
    Matrix4,
    Mesh,
    NodeProps,
    NonFunctionKeys,
    NormalBufferAttributes,
    Object3DEventMap,
    Overwrite,
    Quaternion,
    Vector3,
} from "three";
import {JSX} from "react/jsx-runtime";

import {VITE_CLIENT_ID} from "./env.ts";

import {discordSdk} from "./discordSdk.ts"; // @deno-types="@discord/embedded-app-sdk"
import {CommandResponse} from "@discord/embedded-app-sdk";

type Auth = CommandResponse<"authenticate">;
let auth: Auth;

async function setupDiscordSdk() {
  await discordSdk.ready();

  // Authorize with Discord Client
  const { code } = await discordSdk.commands.authorize({
    client_id: VITE_CLIENT_ID,
    response_type: "code",
    state: "",
    prompt: "none",
    // More info on scopes here: https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
    scope: [
      // Activities will launch through app commands and interactions of user-installable apps.
      // https://discord.com/developers/docs/tutorials/developing-a-user-installable-app#configuring-default-install-settings-adding-default-install-settings
      // 'applications.commands',

      // "applications.builds.upload",
      // "applications.builds.read",
      // "applications.store.update",
      // "applications.entitlements",
      // "bot",
      "identify",
      // "connections",
      // "email",
      // "gdm.join",
      // 'guilds',
      // "guilds.join",
      // 'guilds.members.read',
      // "messages.read",
      // "relationships.read",
      // 'rpc.activities.write',
      // "rpc.notifications.read",
      // "rpc.voice.write",
      // 'rpc.voice.read',
      // "webhook.incoming",
    ],
  });

  // Retrieve an access_token from your activity's server
  // /.proxy/ is prepended here in compliance with CSP
  // see https://discord.com/developers/docs/activities/development-guides#construct-a-full-url
  const response = await fetch("/.proxy/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
    }),
  });

  const { access_token } = await response.json();

  // Authenticate with Discord client (using the access_token)
  auth = await discordSdk.commands.authenticate({
    access_token,
  });

  if (auth == null) {
    throw new Error("Authenticate command failed");
  }
}

function Box(
  props:
    & JSX.IntrinsicAttributes
    & Omit<
      ExtendedColors<
        Overwrite<
          Partial<
            Mesh<
              BufferGeometry<NormalBufferAttributes>,
              Material | Material[],
              Object3DEventMap
            >
          >,
          NodeProps<
            Mesh<
              BufferGeometry<NormalBufferAttributes>,
              Material | Material[],
              Object3DEventMap
            >,
            Mesh
          >
        >
      >,
      NonFunctionKeys<
        {
          position?: Vector3;
          up?: Vector3;
          scale?: Vector3;
          rotation?: Euler;
          matrix?: Matrix4;
          quaternion?: Quaternion;
          layers?: Layers;
          dispose?: (() => void) | null;
        }
      >
    >
    & {
      position?: Vector3;
      up?: Vector3;
      scale?: Vector3;
      rotation?: Euler;
      matrix?: Matrix4;
      quaternion?: Quaternion;
      layers?: Layers;
      dispose?: (() => void) | null;
    }
    & EventHandlers,
) {
  // This reference will give us direct access to the mesh
  const meshRef = useRef();
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    return (meshRef.current as any).rotation.x += delta;
  });
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    setupDiscordSdk().then(() => {
      setLoggedIn(true);
    });
  }, []);

  return (
    loggedIn
      ? (
        <>
          <p>Channel ID: {discordSdk.channelId}</p>
          <Canvas>
            <ambientLight intensity={Math.PI / 2} />
            <spotLight
              position={[10, 10, 10]}
              angle={0.15}
              penumbra={1}
              decay={0}
              intensity={Math.PI}
            />
            <pointLight
              position={[-10, -10, -10]}
              decay={0}
              intensity={Math.PI}
            />
            <Box position={[-1.2, 0, 0]} />
            <Box position={[1.2, 0, 0]} />
          </Canvas>
        </>
      )
      : <div>Loading...</div>
  );
}

export default App;
