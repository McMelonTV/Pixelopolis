// @deno-types="@discord/embedded-app-sdk"
import { DiscordSDK } from '@discord/embedded-app-sdk';
import { VITE_CLIENT_ID } from "./env.ts";

export const discordSdk = new DiscordSDK(VITE_CLIENT_ID);