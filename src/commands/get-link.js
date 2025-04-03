const { GOOGLE_SPREADSHEET_MENU_URL } = require('../config/google-api.config');
const restaurants = require('../data/restaurants.json');

const data = {
	name: 'get-link',
	description: 'Get a link for the specified restaurant',
	options: [
		{
			name: 'restaurant',
			description: 'The name of the restaurant',
			type: 3,
			required: true,
			choices: restaurants.map(restaurant => ({
				name: restaurant.name,
				value: restaurant.value,
			})),
		},
	],
};

/**
 *
 * @param {import('commandkit').SlashCommandProps} param0
 */

function run({ interaction }) {
	const restaurantValue = interaction.options.getString('restaurant');
	const restaurant = restaurants.find(r => r.value === restaurantValue);
	if (!restaurant) {
		return interaction.reply('Restaurant not found!');
	}
	const { gid, link: primaryLink, note: restaurantNote } = restaurant;

	const menuLink = `${GOOGLE_SPREADSHEET_MENU_URL}?gid=${gid}#gid=${gid}`;
	const note = `${
		restaurantNote ? `${restaurantNote}\n` : ''
	}**Order theo cú pháp**\n+<số lượng> <tên món 1>\n+<số lượng> <tên món 2>\n...\n**Tên món** mọi người ghi đúng với tên trong **Link menu tiếng Việt** nha mọi người`;

	interaction.reply(
		`@everyone Mọi người pick món nha \n**Link menu tiếng Việt**: ${menuLink}\n**Link quán**: ${primaryLink}${
			note ? `\n**Note**: ${note}` : ''
		}`,
	);
}

module.exports = { data, run };
