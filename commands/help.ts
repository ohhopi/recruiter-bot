import { Command } from "../handlers/command";
import { Bot } from "../bot";
import {GuildChannel, Message, MessageEmbed, Role, TextChannel} from "discord.js";

import { emojis } from "../guild.json"

export = class HelpCommand extends Command {

    aliases: string[] = ["help"];
    roles: string[] = null;

    async handle(bot: Bot, message: Message, args: string[]) {
        let embed = new MessageEmbed();
        embed.setColor("ORANGE").setTitle("CBR Help");
        embed.setDescription("Until daddy is competent enough to create an actual help functionality, I hope this will suffice");

        let weatherDesc = "";
        weatherDesc += `\`!cbr weather {LOOKAHED_DURATION}\``;
        weatherDesc += `\n\ndisplays bozja weather for \`{LOOKAHED_DURATION}\` upto 48 hours.`;
        weatherDesc += `\nIf not specified, \`{LOOKAHED_DURATION}\` is 24 by default`;

        embed.addField("Weather Forecast", weatherDesc);

        let guidesDesc = "";
        guidesDesc += `\`!cbr fragments\` Fragment and Actions Drops Map\n`;
        guidesDesc += `\`!cbr actions\` Actions Table for DRS\n`;
        guidesDesc += `\`!cbr knights\` Queen's Knights Reflect Positions\n`;
        guidesDesc += `\`!cbr omens\` Queen's Knights Omen Visuals\n`;
        guidesDesc += `\`!cbr bombs\` Queen's Knights Bombs Table\n`;
        guidesDesc += `\`!cbr ladder\` Katy Perry's Ladder Game\n`;
        guidesDesc += `\`!cbr cleaves\` Kate Perry's Cleaves Guide\n`;
        guidesDesc += `\`!cbr minos\` Minotaurs Ad Fight Visuals\n`;
        guidesDesc += `\`!cbr chess\` Step on Me Queen Super Chess Guide\n`;

        embed.addField("Guides", guidesDesc);

        let signUpDesc = "";
        signUpDesc += "When a party's sign up message is up plase wait until you see the \`cancel\` reaction as I only read reactions once the set is complete";
        signUpDesc += "\nDon't worry if you don't see your name on the list as I'll always DM you if you got in or not but I might be late updating the message UwU :3";
        embed.addField("Registering for parties", signUpDesc);

        embed.addField("Unregistering from parties", "As simple as reaction to \`cancel\`");

        embed.addField("Links", "[GitHub](https://github.com/MasterAbdoTGM50/chaos-bozjan-recruiter)\n[Wiki](https://github.com/MasterAbdoTGM50/chaos-bozjan-recruiter/wiki)");

        message.channel.send(embed).then();
    }

}