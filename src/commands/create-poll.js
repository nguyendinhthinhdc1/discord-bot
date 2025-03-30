const data = {
	name: 'create-poll',
	description: 'Create a poll'
}

/**
 *
 * @param {import('commandkit').SlashCommandProps} param0
 */

function run({ interaction }) {
	console.log('🚀 ~ run ~ interaction:', interaction.channel)
	interaction.channel.send({
		content: 'Ăn gì trưa nay?',
		poll: {
			question: { text: 'Ăn gì trưa nay?' },
			answers: [{ text: 'Cơm Thảo Phương' }, { text: 'Cơm Việt Nam' }, { text: 'Cơm thố' }, { text: 'Cơm gà Tân Hải Nam' }],
			allowMultiSelect: true,
			duration: 1
		}
	})
	console.log('🚀 ~ run ~ message: end')
}

module.exports = { data, run }
