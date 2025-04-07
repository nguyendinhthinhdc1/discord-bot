function formatDateIfValid(value) {
	// Check if value is a Date object
	if (value instanceof Date && !isNaN(value)) {
		return new Intl.DateTimeFormat('en-GB').format(value); // DD/MM/YYYY
	}
	// Check if value is a string parseable as date
	const parsed = Date.parse(value);
	if (!isNaN(parsed)) {
		const date = new Date(parsed);
		return new Intl.DateTimeFormat('en-GB').format(date);
	}
	return value;
}

export function formatSheetDataForDiscord(sheetData) {
	// Extract the header and rows
	const [header, ...rows] = sheetData;

	const headerTitles = ['User', 'Dishes', 'Price After Discount'];

	// Prepare data rows with only relevant columns
	const dataRows = rows.map(row => {
		const [user, dish, , , , priceAfterDiscount] = row;
		return [user, dish, `${priceAfterDiscount}k`];
	});

	// Calculate max width for each column
	const colWidths = headerTitles.map((title, colIdx) => {
		const maxDataWidth = Math.max(...dataRows.map(row => (row[colIdx] ? row[colIdx].length : 0)));
		return Math.max(title.length, maxDataWidth);
	});

	// Helper to pad cell content
	const pad = (text, width) => {
		const str = text.toString();
		return str + ' '.repeat(width - str.length);
	};

	// Build header line
	let table = '';
	table += '| ' + headerTitles.map((title, idx) => pad(title, colWidths[idx])).join(' | ') + ' |\n';

	// Build separator line
	table += '|-' + colWidths.map(w => '-'.repeat(w)).join('-|-') + '-|\n';

	// Build data rows
	dataRows.forEach(row => {
		table += '| ' + row.map((cell, idx) => pad(cell, colWidths[idx])).join(' | ') + ' |\n';
	});

	return `**@everyone Billing Summary ${formatDateIfValid(new Date())}**\n\`\`\`\n${table}\`\`\``;
}
