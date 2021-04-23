export function isValidNickname(inp: string): boolean {
    return inp.match(/\[\w+]\s*\w+\s*\w*/) !== null
}

export function toMiniNickname(name: string): string {
    name = name.replace(/\[\w+]\s*/, match => "[" + match[1] + "]");
    name = name.replace(/['"][\w\s]*['"]/, "").replace(/\s+/," ").trim();
    return name;
}