const { get } = require('http');
const { addToGoogleSheet, getSheet } = require('../services/google-api.service');
const { GOOGLE_SPREADSHEET_MENU_ID } = require('../config/google-api.config');
const restaurants = require('../data/restaurants.json');
const { discordConfig } = require('../config/discord.config');
const { formatSheetDataForDiscord } = require('../utils/common');
const esClient = require('../config/elastic-search.config'); // Assuming you moved client setup

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
async function run({ interaction, client }) {
	await interaction.deferReply(); // Defer the reply since this might take time

	// IDs for the source and destination channels
	const sourceChannelId = discordConfig.DISCORD_ORDER_CHANNEL_ID; // Replace with the actual source channel ID
	const destinationChannelId = discordConfig.DISCORD_BILLING_CHANNEL_ID; // Replace with the actual destination channel ID

	const restaurantName = interaction.options.getString('restaurant');
	const totalPrice = interaction.options.getInteger('total_price');
	const totalPaid = interaction.options.getInteger('total_paid');

	try {
		// Fetch the source and destination channels
		const sourceChannel = await client.channels.fetch(sourceChannelId);
		const destinationChannel = await client.channels.fetch(destinationChannelId);

		if (!sourceChannel || !sourceChannel.isTextBased()) {
			throw new Error('Invalid source channel.');
		}
		if (!destinationChannel || !destinationChannel.isTextBased()) {
			throw new Error('Invalid destination channel.');
		}

		// Fetch and process messages from the source channel
		const groupedMessages = await fetchMessagesGroupedByUser(sourceChannel);
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

		const textResult = formatSheetDataForDiscord(sheetData);
		// Send the response to the destination channel
		await destinationChannel.send(`${textResult}\nMore details: ${sheetResponse.sheetLink}`);
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
			menu[name.trim().toLowerCase()] = parseFloat(price.trim());
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
		['User', 'Dishes', 'Quantity', 'Price', 'Total', 'Price after discount', 'Date'],
		...Object.entries(data).flatMap(([user, order]) =>
			order.map(element => [
				user,
				element.name,
				element.quantity,
				element.price,
				element.total,
				element.priceAfterDiscount,
				new Date().toLocaleDateString(),
			]),
		),
	];
	return rows;
}

// Helper function to find index name (optional, but cleaner)
function getIndexNameForRestaurant(name) {
    const restaurant = restaurants.find(r => r.name === name);
    return restaurant ? restaurant.indexName : null;
}

async function transformMessages(groupedMessages, restaurantName) {
    // Find the predefined index name for the given restaurant
    const indexName = getIndexNameForRestaurant(restaurantName);

    if (!indexName) {
        console.error(`Could not find indexName for restaurant: ${restaurantName} in restaurants.json`);
        // Decide how to handle this - maybe return empty results or throw an error
        // For now, let's return empty results for users of this restaurant
        return Object.entries(groupedMessages).map(([user]) => ({ user, messages: [] }));
    }

    console.log(`Using index: ${indexName} for restaurant: ${restaurantName}`); // For debugging

    const transformedMessagesPromises = Object.entries(groupedMessages).map(async ([user, messages]) => {
        const processedMessagesPromises = messages
            .flatMap(message => {
                // Split the message by newlines and process each line
                return message.split('\n').map(line => {
                    // Updated regex to handle optional space after the `+` sign
                    const regex = /\+\s*(\d+)?\s*(.+)/;
                    const match = line.match(regex);
                    if (match) {
                        const quantity = match[1] ? parseInt(match[1], 10) : 1;
                        const dishName = match[2].trim();

                        return (async () => {
                            try {
                                // Use the indexName found from restaurants.json
                                // Get the full response object first
                                const response = await esClient.search({
                                    index: indexName, // <-- Use the predefined index name
                                    body: {
                                        query: {
                                            bool: {
                                                must: [
                                                    { match_phrase: { dishName: dishName } }
                                                ]
                                            }
                                        }
                                    }
                                });

                                // Check if response and body.hits exist before accessing properties
                                let price = 0;
                                // Check the structure returned by your Elasticsearch client library
                                // Common structures are response.body.hits or response.hits
                                const hitsData = response?.body?.hits || response?.hits; // Adjust based on your client library

                                if (hitsData && hitsData.hits && hitsData.hits.length > 0) {
                                    price = hitsData.hits[0]._source.price;
                                } else {
                                     // Only warn if the hits array is empty or doesn't exist
                                     console.warn(`Dish "${dishName}" not found or unexpected response structure in Elasticsearch index "${indexName}". Response:`, response);
                                }
                                return { dish: dishName, quantity, price };

                            } catch (error) {
                                // Log error with index name for context
                                console.error(`Error querying Elasticsearch index "${indexName}" for dish "${dishName}":`, error);
                                return { dish: dishName, quantity, price: 0 };
                            }
                        })();
                    }
                    return null;
                });
            })
            .filter(item => item !== null);

        const resolvedMessages = (await Promise.all(processedMessagesPromises)).filter(item => item !== null);

        return {
            user,
            messages: resolvedMessages,
        };
    });

    const transformedMessages = await Promise.all(transformedMessagesPromises);
    return transformedMessages;
}

module.exports = { data, run };
