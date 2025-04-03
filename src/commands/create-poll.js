const restaurants = require('../data/restaurants.json');

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
		poll: {
			question: { text: 'Ăn gì trưa nay?' },
			answers: restaurants.map(restaurant => ({ text: restaurant.name })),
			allowMultiSelect: true,
			duration: 1,
		},
	});
}

module.exports = { data, run };
