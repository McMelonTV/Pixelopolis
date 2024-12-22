import './App.css'
// @deno-types="@types/react"
import { useState, useEffect } from 'react'
// @ts-expect-error Unable to infer type at the moment
import reactLogo from './assets/react.svg'
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

    return (
        loggedIn ? (
            <>
                <div>Channel ID: {discordSdk.channelId}</div>
            </>
        ) : (
            <div>Loading...</div>
        )
    )
}

export default App