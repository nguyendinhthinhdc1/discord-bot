import {
  __commonJS,
  __name,
  init_esm_shims
} from "../chunk-M3OKE2XU.mjs";

// src/commands/ping.js
var require_ping = __commonJS({
  "src/commands/ping.js"(exports, module) {
    init_esm_shims();
    var data = {
      name: "ping",
      description: "Pong!"
    };
    function run({ interaction, client }) {
      interaction.reply(`:ping_pong: Pong! ${client.ws.ping}ms`);
    }
    __name(run, "run");
    var options = {};
    module.exports = { data, run, options };
  }
});
export default require_ping();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2NvbW1hbmRzL3BpbmcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKiBAdHlwZSB7aW1wb3J0KCdjb21tYW5ka2l0JykuQ29tbWFuZERhdGF9ICovXHJcbmNvbnN0IGRhdGEgPSB7XHJcblx0bmFtZTogJ3BpbmcnLFxyXG5cdGRlc2NyaXB0aW9uOiAnUG9uZyEnXHJcbn1cclxuXHJcbi8qKiBAcGFyYW0ge2ltcG9ydCgnY29tbWFuZGtpdCcpLlNsYXNoQ29tbWFuZFByb3BzfSBwYXJhbTAgKi9cclxuZnVuY3Rpb24gcnVuKHsgaW50ZXJhY3Rpb24sIGNsaWVudCB9KSB7XHJcblx0aW50ZXJhY3Rpb24ucmVwbHkoYDpwaW5nX3Bvbmc6IFBvbmchICR7Y2xpZW50LndzLnBpbmd9bXNgKVxyXG59XHJcblxyXG4vKiogQHR5cGUge2ltcG9ydCgnY29tbWFuZGtpdCcpLkNvbW1hbmRPcHRpb25zfSAqL1xyXG5jb25zdCBvcHRpb25zID0ge31cclxuXHJcbm1vZHVsZS5leHBvcnRzID0geyBkYXRhLCBydW4sIG9wdGlvbnMgfVxyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQ0EsUUFBTSxPQUFPO0FBQUEsTUFDWixNQUFNO0FBQUEsTUFDTixhQUFhO0FBQUEsSUFDZDtBQUdBLGFBQVMsSUFBSSxFQUFFLGFBQWEsT0FBTyxHQUFHO0FBQ3JDLGtCQUFZLE1BQU0scUJBQXFCLE9BQU8sR0FBRyxJQUFJLElBQUk7QUFBQSxJQUMxRDtBQUZTO0FBS1QsUUFBTSxVQUFVLENBQUM7QUFFakIsV0FBTyxVQUFVLEVBQUUsTUFBTSxLQUFLLFFBQVE7QUFBQTtBQUFBOyIsCiAgIm5hbWVzIjogW10KfQo=