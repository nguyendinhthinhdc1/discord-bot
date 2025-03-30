

;await (async()=>{
  'use strict';
// --- CommandKit require() polyfill ---
  if (typeof require === "undefined") {
    const { createRequire } = await import("node:module");
    const __require = createRequire(import.meta.url);
    Object.defineProperty(globalThis, "require", {
      value: (id) => {
        return __require(id);
      },
      configurable: true,
      enumerable: false,
      writable: true,
    });
  }
// --- CommandKit require() polyfill ---


})();



import {
  __dirname,
  __require,
  init_esm_shims
} from "./chunk-M3OKE2XU.mjs";

// src/index.js
init_esm_shims();
var { Client } = __require("discord.js");
var { CommandKit } = __require("commandkit");
var client = new Client({
  intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"]
});
new CommandKit({
  client,
  commandsPath: `${__dirname}/commands`,
  eventsPath: `${__dirname}/events`,
  bulkRegister: true
});
client.login(process.env.DISCORD_BOT_TOKEN);
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2luZGV4LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCB7IENsaWVudCB9ID0gcmVxdWlyZSgnZGlzY29yZC5qcycpXHJcbmNvbnN0IHsgQ29tbWFuZEtpdCB9ID0gcmVxdWlyZSgnY29tbWFuZGtpdCcpXHJcblxyXG5jb25zdCBjbGllbnQgPSBuZXcgQ2xpZW50KHtcclxuXHRpbnRlbnRzOiBbJ0d1aWxkcycsICdHdWlsZE1lbWJlcnMnLCAnR3VpbGRNZXNzYWdlcycsICdNZXNzYWdlQ29udGVudCddXHJcbn0pXHJcblxyXG5uZXcgQ29tbWFuZEtpdCh7XHJcblx0Y2xpZW50LFxyXG5cdGNvbW1hbmRzUGF0aDogYCR7X19kaXJuYW1lfS9jb21tYW5kc2AsXHJcblx0ZXZlbnRzUGF0aDogYCR7X19kaXJuYW1lfS9ldmVudHNgLFxyXG5cdGJ1bGtSZWdpc3RlcjogdHJ1ZVxyXG59KVxyXG5cclxuY2xpZW50LmxvZ2luKHByb2Nlc3MuZW52LkRJU0NPUkRfQk9UX1RPS0VOKVxyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7O0FBQUE7QUFBQSxJQUFNLEVBQUUsT0FBTyxJQUFJLFVBQVEsWUFBWTtBQUN2QyxJQUFNLEVBQUUsV0FBVyxJQUFJLFVBQVEsWUFBWTtBQUUzQyxJQUFNLFNBQVMsSUFBSSxPQUFPO0FBQUEsRUFDekIsU0FBUyxDQUFDLFVBQVUsZ0JBQWdCLGlCQUFpQixnQkFBZ0I7QUFDdEUsQ0FBQztBQUVELElBQUksV0FBVztBQUFBLEVBQ2Q7QUFBQSxFQUNBLGNBQWMsR0FBRyxTQUFTO0FBQUEsRUFDMUIsWUFBWSxHQUFHLFNBQVM7QUFBQSxFQUN4QixjQUFjO0FBQ2YsQ0FBQztBQUVELE9BQU8sTUFBTSxRQUFRLElBQUksaUJBQWlCOyIsCiAgIm5hbWVzIjogW10KfQo=