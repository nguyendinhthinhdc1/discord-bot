import {
  __commonJS,
  __name,
  init_esm_shims
} from "../chunk-M3OKE2XU.mjs";

// src/commands/create-poll.js
var require_create_poll = __commonJS({
  "src/commands/create-poll.js"(exports, module) {
    init_esm_shims();
    var data = {
      name: "create-poll",
      description: "Create a poll"
    };
    function run({ interaction }) {
      console.log("\u{1F680} ~ run ~ interaction:", interaction.channel);
      interaction.channel.send({
        content: "\u0102n g\xEC tr\u01B0a nay?",
        poll: {
          question: { text: "\u0102n g\xEC tr\u01B0a nay?" },
          answers: [{ text: "C\u01A1m Th\u1EA3o Ph\u01B0\u01A1ng" }, { text: "C\u01A1m Vi\u1EC7t Nam" }, { text: "C\u01A1m th\u1ED1" }, { text: "C\u01A1m g\xE0 T\xE2n H\u1EA3i Nam" }],
          allowMultiSelect: true,
          duration: 1
        }
      });
      console.log("\u{1F680} ~ run ~ message: end");
    }
    __name(run, "run");
    module.exports = { data, run };
  }
});
export default require_create_poll();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2NvbW1hbmRzL2NyZWF0ZS1wb2xsLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBkYXRhID0ge1xyXG5cdG5hbWU6ICdjcmVhdGUtcG9sbCcsXHJcblx0ZGVzY3JpcHRpb246ICdDcmVhdGUgYSBwb2xsJ1xyXG59XHJcblxyXG4vKipcclxuICpcclxuICogQHBhcmFtIHtpbXBvcnQoJ2NvbW1hbmRraXQnKS5TbGFzaENvbW1hbmRQcm9wc30gcGFyYW0wXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gcnVuKHsgaW50ZXJhY3Rpb24gfSkge1xyXG5cdGNvbnNvbGUubG9nKCdcdUQ4M0RcdURFODAgfiBydW4gfiBpbnRlcmFjdGlvbjonLCBpbnRlcmFjdGlvbi5jaGFubmVsKVxyXG5cdGludGVyYWN0aW9uLmNoYW5uZWwuc2VuZCh7XHJcblx0XHRjb250ZW50OiAnXHUwMTAybiBnXHUwMEVDIHRyXHUwMUIwYSBuYXk/JyxcclxuXHRcdHBvbGw6IHtcclxuXHRcdFx0cXVlc3Rpb246IHsgdGV4dDogJ1x1MDEwMm4gZ1x1MDBFQyB0clx1MDFCMGEgbmF5PycgfSxcclxuXHRcdFx0YW5zd2VyczogW3sgdGV4dDogJ0NcdTAxQTFtIFRoXHUxRUEzbyBQaFx1MDFCMFx1MDFBMW5nJyB9LCB7IHRleHQ6ICdDXHUwMUExbSBWaVx1MUVDN3QgTmFtJyB9LCB7IHRleHQ6ICdDXHUwMUExbSB0aFx1MUVEMScgfSwgeyB0ZXh0OiAnQ1x1MDFBMW0gZ1x1MDBFMCBUXHUwMEUybiBIXHUxRUEzaSBOYW0nIH1dLFxyXG5cdFx0XHRhbGxvd011bHRpU2VsZWN0OiB0cnVlLFxyXG5cdFx0XHRkdXJhdGlvbjogMVxyXG5cdFx0fVxyXG5cdH0pXHJcblx0Y29uc29sZS5sb2coJ1x1RDgzRFx1REU4MCB+IHJ1biB+IG1lc3NhZ2U6IGVuZCcpXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0geyBkYXRhLCBydW4gfVxyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFBTSxPQUFPO0FBQUEsTUFDWixNQUFNO0FBQUEsTUFDTixhQUFhO0FBQUEsSUFDZDtBQU9BLGFBQVMsSUFBSSxFQUFFLFlBQVksR0FBRztBQUM3QixjQUFRLElBQUksa0NBQTJCLFlBQVksT0FBTztBQUMxRCxrQkFBWSxRQUFRLEtBQUs7QUFBQSxRQUN4QixTQUFTO0FBQUEsUUFDVCxNQUFNO0FBQUEsVUFDTCxVQUFVLEVBQUUsTUFBTSwrQkFBa0I7QUFBQSxVQUNwQyxTQUFTLENBQUMsRUFBRSxNQUFNLHNDQUFrQixHQUFHLEVBQUUsTUFBTSx5QkFBZSxHQUFHLEVBQUUsTUFBTSxvQkFBVSxHQUFHLEVBQUUsTUFBTSxxQ0FBcUIsQ0FBQztBQUFBLFVBQ3BILGtCQUFrQjtBQUFBLFVBQ2xCLFVBQVU7QUFBQSxRQUNYO0FBQUEsTUFDRCxDQUFDO0FBQ0QsY0FBUSxJQUFJLGdDQUF5QjtBQUFBLElBQ3RDO0FBWlM7QUFjVCxXQUFPLFVBQVUsRUFBRSxNQUFNLElBQUk7QUFBQTtBQUFBOyIsCiAgIm5hbWVzIjogW10KfQo=