const cron = require('node-cron');
const { orderPollOptions } = require('../utils/poll');

/**
 * Initialize automatic poll creation scheduler
 * @param {import('discord.js').Client} client
 */
function initAutoPoll(client) {
	// Schedule poll creation at 9:30 AM, Monday to Friday
	cron.schedule('30 9 * * 1-5', async () => {
		try {
			const channel = await client.channels.fetch(process.env.DISCORD_ORDER_CHANNEL_ID);
			if (!channel) {
				console.error('Order channel not found');
				return;
			}
			await channel.send({
				content: '@everyone Ăn gì trưa nay?',
				poll: orderPollOptions,
			});
			console.log('Poll created successfully');
		} catch (error) {
			console.error('Error creating poll:', error);
		}
	});

	// Schedule poll result announcement at 10:35 AM, Monday to Friday
	cron.schedule('35 10 * * 1-5', async () => {
		try {
			const channel = await client.channels.fetch(process.env.DISCORD_ORDER_CHANNEL_ID);
			if (!channel) {
				console.error('Order channel not found');
				return;
			}

			// Fetch recent messages to find the latest poll
			const messages = await channel.messages.fetch({ limit: 50 });
			const pollMessage = messages.find(
				msg => msg.content === 'Ăn gì trưa nay?' && msg.poll, // check if message has poll property
			);
			if (!pollMessage) {
				console.error('Poll message not found');
				return;
			}

			const guildId = pollMessage.guildId;
			const channelId = pollMessage.channelId;
			const messageId = pollMessage.id;
			const pollUrl = `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;

			// Defensive check for poll data
			if (
				!pollMessage.poll ||
				!pollMessage.poll.answers ||
				typeof pollMessage.poll.answers.values !== 'function'
			) {
				await channel.send({
					content: `@everyone Không thể lấy kết quả bình chọn (poll data không hợp lệ). Xem poll tại: ${pollUrl}`,
				});
				console.log('Poll result link sent (invalid poll data)');
				return;
			}

			const answers = Array.from(pollMessage.poll.answers.values());
			if (!answers || answers.length === 0) {
				await channel.send({
					content: `@everyone Không thể lấy kết quả bình chọn. Xem poll tại: ${pollUrl}`,
				});
				console.log('Poll result link sent (no answers found)');
				return;
			}

			let winningAnswer = answers[0];
			for (const answer of answers) {
				if (
					answer &&
					typeof answer.voteCount === 'number' &&
					(answer.voteCount || 0) > (winningAnswer.voteCount || 0)
				) {
					winningAnswer = answer;
				}
			}

			const winningName = winningAnswer.text;

			// Load restaurant data
			const restaurants = require('../data/restaurants.json');
			const restaurant = restaurants.find(r => r.name === winningName);

			if (!restaurant) {
				await channel.send({
					content: `@everyone Nhà hàng thắng cuộc: **${winningName}**\nXem poll tại: ${pollUrl}`,
				});
				console.log('Poll result link sent (restaurant not found in data)');
				return;
			}

			const { gid, link: primaryLink, note: restaurantNote } = restaurant;
			const { GOOGLE_SPREADSHEET_MENU_URL } = require('../config/google-api.config');

			const menuLink = `${GOOGLE_SPREADSHEET_MENU_URL}?gid=${gid}#gid=${gid}`;
			const note = `${
				restaurantNote ? `${restaurantNote}\n` : ''
			}**Order theo cú pháp**\n+<số lượng> <tên món 1>\n+<số lượng> <tên món 2>\n...\n**Tên món** mọi người ghi đúng với tên trong **Link menu tiếng Việt** nha mọi người`;

			await channel.send({
				content: `@everyone Mọi người pick món nha\n**Nhà hàng thắng cuộc:** ${winningName}\n**Link menu tiếng Việt:** ${menuLink}\n**Link quán:** ${primaryLink}${
					note ? `\n**Note:** ${note}` : ''
				}\nXem poll tại: ${pollUrl}`,
			});
			console.log('Poll result with restaurant info sent successfully');
		} catch (error) {
			console.error('Error sending poll result link:', error);
		}
	});
}

module.exports = { initAutoPoll };
