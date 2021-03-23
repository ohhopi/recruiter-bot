import {Mutex} from "async-mutex";
import {Bot} from "../bot";
import {Party} from "./party";
import {GuildMember, MessageReaction, TextChannel, User} from "discord.js";
import {dm, dmError} from "../utils/dm";
import {isValidNickname} from "../utils/nickname";
import {emojis} from "../guild.json";
import {updatePartyMsg} from "./party-utils";

declare module "discord.js" {
    export interface ReactionCollector {
        lock: Mutex;
    }
}

export function createPartyReactionHandler(bot: Bot, party: Party) {
    if(party.channelId === null || party.msgId === null) { return; }
    bot.client.channels.fetch(party.channelId).then((channel: TextChannel) => {
        channel.messages.fetch(party.msgId).then(msg => {

            const rCollector = msg.createReactionCollector(filterReactions);
            rCollector.lock = new Mutex();

            rCollector.on("collect", async (reaction: MessageReaction, user: User) => {
                dm(user, "Your request is being processed");

                await rCollector.lock.runExclusive(async () => {
                    const role = reaction.emoji.name;
                    const member = bot.guild.member(user);

                    if(role !== "cancel") {  registerInParty(party, member, role);}
                    else {
                        unregisterFromParty(party, member, true);
                    }
                    updatePartyMsg(bot, party);
                })
            });

        });
    });
}

function filterReactions(reaction: MessageReaction, user: User) {
    if(user.bot) { return false; }

    let emoji = `${reaction.emoji.name}:${reaction.emoji.id}`;
    if(!Object.values(emojis).includes(emoji)) { reaction.remove().then(); return false; }

    return true;
}

export function registerInParty(party: Party, gm: GuildMember, role: string) {
    if(party.members.some(m => m.id === gm.user.id)) {
        dmError(gm.user, `Already registered in the ${party.title} party by ${party.leader.name}`);
        return false;
    }

    if(!gm.roles.cache.some(role => party.allowed.includes(role.name.toLowerCase().trim()))) {
        dmError(gm.user, `Incorrect role to register in the "${party.title}" party`);
        return false;
    }

    if(!isValidNickname(gm.displayName)) {
        dmError(gm.user, `Incorrect name format to register in the "${party.title}" party`);
        return false;
    }

    if(party.members.filter(m => m.role === role).length >= party.comp[role]) {
        dmError(gm.user, `No free ${role} spot in the "${party.title}" party`);
        return false;
    }

    party.members.push({ id: gm.user.id, name: gm.displayName, role: role });
    dm(gm.user, `Registered as a ${role} in the "${party.title}" party`);
    if(party.pw !== undefined) { dm(gm.user, `"${party.title}" party password is ${party.pw}`); }
    return true;
}

export function unregisterFromParty(party: Party, gm: GuildMember, forfeit: boolean) {
    let member = party.members.find(m => m.id === gm.user.id);
    if(member) {
        party.members = party.members.filter(m => m.id !== member.id);
        if(forfeit) { party.forfeits.push(member); }
        dm(gm.user, `Unregistered from the "${party.title}" party`);
        return true;
    }
    return false;
}