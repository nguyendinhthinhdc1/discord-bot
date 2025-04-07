const data = {
	name: 'end-poll',
	description: 'End a poll by providing the poll message ID and channel ID',
	options: [
		{
			name: 'message_id',
			description: 'The ID of the poll message',
			type: 3, // STRING
			required: true,
		},
	],
};

/**
 *
 * @param {import('commandkit').SlashCommandProps} param0
 */
async function run({ interaction }) {
	const messageId = interaction.options.getString('message_id');
	const targetMessage = await interaction.channel.messages.fetch(messageId);
	targetMessage.poll?.end(); // End the poll
}

module.exports = { data, run };
