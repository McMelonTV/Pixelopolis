import './App.css'
// @deno-types="@types/react"
import { useState, useEffect, useRef } from 'react'

import { IRefPhaserGame, PhaserGame } from './game/PhaserGame.tsx';
import { MainMenu } from './game/scenes/MainMenu.ts';

import { VITE_CLIENT_ID } from './env.ts'

import { discordSdk } from "./discordSdk.ts";
// @deno-types="@discord/embedded-app-sdk"
import { CommandResponse } from "@discord/embedded-app-sdk";

type Auth = CommandResponse<'authenticate'>;
let auth: Auth;

async function setupDiscordSdk() {
    await discordSdk.ready();

    // Authorize with Discord Client
    const { code } = await discordSdk.commands.authorize({
        client_id: VITE_CLIENT_ID,
        response_type: 'code',
        state: '',
        prompt: 'none',
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
            'identify',
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
    const response = await fetch('/.proxy/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
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
        throw new Error('Authenticate command failed');
    }
}

function App() {
    const [loggedIn, setLoggedIn] = useState(false)
    useEffect(() => {
        setupDiscordSdk().then(() => {
            setLoggedIn(true);
            });
    }, []);

    // The sprite can only be moved in the MainMenu Scene
    const [canMoveSprite, setCanMoveSprite] = useState(true);

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });

    const changeScene = () => {

        if(phaserRef.current)
        {
            const scene = phaserRef.current.scene as MainMenu;

            if (scene)
            {
                scene.changeScene();
            }
        }
    }

    const moveSprite = () => {

        if(phaserRef.current)
        {

            const scene = phaserRef.current.scene as MainMenu;

            if (scene && scene.scene.key === 'MainMenu')
            {
                // Get the update logo position
                scene.moveLogo(({ x, y }) => {

                    setSpritePosition({ x, y });

                });
            }
        }

    }

    const addSprite = () => {

        if (phaserRef.current)
        {
            const scene = phaserRef.current.scene;

            if (scene)
            {
                // Add more stars
                const x = Phaser.Math.Between(64, scene.scale.width - 64);
                const y = Phaser.Math.Between(64, scene.scale.height - 64);

                //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
                const star = scene.add.sprite(x, y, 'star');

                //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
                //  You could, of course, do this from within the Phaser Scene code, but this is just an example
                //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
                scene.add.tween({
                    targets: star,
                    duration: 500 + Math.random() * 1000,
                    alpha: 0,
                    yoyo: true,
                    repeat: -1
                });
            }
        }
    }

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {

        setCanMoveSprite(scene.scene.key !== 'MainMenu');

    }

    return (
        loggedIn ? (
            <div id="app">
                <PhaserGame ref={phaserRef} currentActiveScene={currentScene}/>
                <div>
                    <p>Channel ID: {discordSdk.channelId}</p>
                    <div>
                        <button className="button" onClick={changeScene}>Change Scene</button>
                    </div>
                    <div>
                        <button disabled={canMoveSprite} className="button" onClick={moveSprite}>Toggle Movement
                        </button>
                    </div>
                    <div className="spritePosition">Sprite Position:
                        <pre>{`{\n  x: ${spritePosition.x}\n  y: ${spritePosition.y}\n}`}</pre>
                    </div>
                    <div>
                        <button className="button" onClick={addSprite}>Add New Sprite</button>
                    </div>
                </div>
            </div>
        ) : (
            <div>Loading...</div>
        )
    )
}

export default App