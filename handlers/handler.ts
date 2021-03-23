import { Bot } from "../bot";
import { Message } from "discord.js";

interface IMessageHandler {
    handle(bot: Bot, message: Message);
}

interface ITickHandler {
    handle(bot: Bot, now: Date);
}

export { ITickHandler, IMessageHandler }