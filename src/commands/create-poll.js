const { orderPollOptions } = require('../utils/poll');

const data = {
	name: 'create-poll',
	description: 'Create a poll',
};

/**
 *
 * @param {import('commandkit').SlashCommandProps} param0
 */

function run({ interaction }) {
	interaction.channel.send({
		content: 'Ăn gì trưa nay?',
		poll: orderPollOptions,
	});
}

module.exports = { data, run };
