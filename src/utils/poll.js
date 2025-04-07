const restaurants = require('../data/restaurants.json');

export const orderPollOptions = {
	question: { text: 'Ăn gì trưa nay?' },
	answers: restaurants.map(restaurant => ({ text: restaurant.name })),
	allowMultiselect: true,
	duration: 1,
};
