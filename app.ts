import dotenv from "dotenv"; dotenv.config();

import {NicknameNagger} from "./handlers/nickname-nagger";
import { Client, Message } from "discord.js";
import { Bot } from "./bot";
import { ClockUpdater } from "./handlers/clock";
import { PartyCleaner } from "./handlers/party-cleaner";
import { Scheduler } from "./handlers/scheduler";
import { CommandHandler } from "./handlers/command";

import logger from "./logger";
import { guildId } from "./guild.json"

const client = new Client();
const bot = new Bot(client);

client.once("ready", async () => {
    bot.guild = await client.guilds.fetch(guildId);
    bot.registerTickHandler(new ClockUpdater());
    bot.registerTickHandler(new PartyCleaner());
    bot.registerTickHandler(new Scheduler());
    bot.registerMessageHandler(new CommandHandler());
    bot.registerMessageHandler(new NicknameNagger());

    client.on("message", (message: Message) => { bot.onMessage(message); });

    bot.tick();
    bot.fixPartyReactions();

    logger.info("Chaos Bozjan Recruiter! Ready for Action!!!");
});

client.login(process.env.DSCRD_CBR_TOKEN).then();