const { get } = require('http');
const { addToGoogleSheet, getSheet } = require('../services/google-api.service');
const { GOOGLE_SPREADSHEET_MENU_ID } = require('../config/google-api.config');
const restaurants = require('../data/restaurants.json');

const data = {
	name: 'billing',
	description: 'Billing',
	options: [
		{
			name: 'restaurant',
			description: 'The name of the restaurant',
			type: 3, // STRING type
			required: true,
			choices: restaurants.map(restaurant => ({
				name: restaurant.name,
				value: restaurant.name,
			})),
		},
		{
			name: 'total_price',
			description: 'Total price',
			type: 4, // INTEGER type
			required: true,
		},
		{
			name: 'total_paid',
			description: 'Total paid',
			type: 4, // INTEGER type
			required: true,
		},
	],
};

/**
 *
 * @param {import('commandkit').SlashCommandProps} param0
 */

// Example usage in the `run` function
async function run({ interaction }) {
	await interaction.deferReply(); // Defer the reply since this might take time
	const restaurantName = interaction.options.getString('restaurant');
	const totalPrice = interaction.options.getInteger('total_price');
	const totalPaid = interaction.options.getInteger('total_paid');
	const channel = interaction.channel;

	try {
		const groupedMessages = await fetchMessagesGroupedByUser(channel);
		const transformedMessages = await transformMessages(groupedMessages, restaurantName);
		const orderData = await calculatePrice(
			transformedMessages,
			restaurantName,
			totalPrice,
			totalPaid,
		);
		const sheetData = buildSheetData(orderData);

		// Add data to Google Sheet
		const sheetResponse = await addToGoogleSheet(sheetData);
		await interaction.editReply(sheetResponse);
	} catch (error) {
		await interaction.editReply(`Error: ${error.message}`);
	}
}

/**
 * Fetches the last `n` messages from a Discord channel and groups them by user for a specific date.
 * @param {TextChannel} channel - The Discord channel to fetch messages from.
 * @param {Date} targetDate - The date to filter messages by.
 * @param {number} limit - The number of messages to fetch.
 * @returns {Promise<Object>} - A promise that resolves to an object where keys are user IDs and values are arrays of messages.
 */
async function fetchMessagesGroupedByUser(channel, targetDate = new Date(), limit = 100) {
	if (!channel || !channel.isTextBased()) {
		throw new Error('Invalid channel provided.');
	}

	const fetchedMessages = await channel.messages.fetch({ limit });
	const groupedMessages = {};

	fetchedMessages.forEach(message => {
		// Convert the message timestamp to a Date object
		const messageDate = new Date(message.createdTimestamp);

		// Check if the message is from the target date
		if (
			!message.author.bot &&
			!message.content.includes('Poll') &&
			message.content?.startsWith('+') &&
			messageDate.toDateString() === targetDate.toDateString() // Compare dates
		) {
			const globalName = message.author.globalName;
			if (!groupedMessages[globalName]) {
				groupedMessages[globalName] = [];
			}
			groupedMessages[globalName].push(message.content);
		}
	});

	return groupedMessages;
}

/**
 * Fetches the menu data from the Google Sheet.
 * @param {string} restaurantName - The Restaurant name.
 * @returns {Promise<Object>} - A promise that resolves to a mapping of dish names to their prices.
 */
async function fetchMenuData(restaurantName) {
	const sheets = await getSheet();
	if (!sheets) {
		throw new Error('Google Sheets client not initialized.');
	}
	const range = `${restaurantName}!A:B`; // Adjust range based on your sheet structure (e.g., "Name" in column A, "Price" in column B)

	const response = await sheets.spreadsheets.values.get({
		spreadsheetId: GOOGLE_SPREADSHEET_MENU_ID,
		range,
	});

	const rows = response.data.values;
	if (!rows || rows.length === 0) {
		throw new Error('No data found in the menu sheet.');
	}

	// Create a mapping of dish names to prices
	const menu = {};
	rows.forEach(([name, price]) => {
		if (name && price) {
			menu[name.trim()] = parseFloat(price.trim());
		}
	});

	return menu;
}

async function calculatePrice(transformedMessages, restaurantName, totalPrice, totalPaid) {
	const sheetData = {};
	const discountPrice = totalPrice - totalPaid;
	const totalValidMessages = transformedMessages.reduce((acc, messages) => {
		const validMessages = messages.messages.filter(item => item.price > 10);
		const totalQuantity = validMessages.reduce((sum, message) => {
			return sum + message.quantity;
		}, 0);
		return acc + totalQuantity;
	}, 0);

	const discountPerDish = discountPrice / totalValidMessages;

	transformedMessages.forEach(user => {
		const userName = user.user;
		const order = user.messages
			.map(message => {
				const { quantity, dish, price } = message;
				const discountRatio = price / (totalPrice / totalValidMessages);
				return {
					name: dish,
					quantity,
					price,
					total: price * quantity,
					priceAfterDiscount: Math.round((price - discountPerDish * discountRatio) * quantity),
				};
			})
			.filter(item => item !== null);
		sheetData[userName] = order;
	});
	return sheetData;
}

function buildSheetData(data) {
	// Prepare values to update
	const rows = [
		['User', 'Dishes', 'Quantity', 'Price', 'Total', 'Price after discount'],
		...Object.entries(data).flatMap(([user, order]) =>
			order.map(element => [
				user,
				element.name,
				element.quantity,
				element.price,
				element.total,
				element.priceAfterDiscount,
			]),
		),
	];
	return rows;
}

async function transformMessages(groupedMessages, restaurantName) {
	const menu = await fetchMenuData(restaurantName);

	const transformedMessages = Object.entries(groupedMessages).map(([user, messages]) => {
		return {
			user,
			messages: messages
				.map(message => {
					const regex = /\+(\d+)?(.+)/;
					const match = message.match(regex);
					if (match) {
						const quantity = match[1] ? parseInt(match[1], 10) : 1;
						const dish = match[2].trim();
						const price = menu[dish] || 0;
						return { dish, quantity, price };
					}
					return null;
				})
				.filter(item => item !== null),
		};
	});
	return transformedMessages;
}

module.exports = { data, run };
