import { CREDENTIALS, SPREADSHEET_ID } from '../config/google-api.config';
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

const auth = new JWT({
	email: CREDENTIALS.client_email,
	key: CREDENTIALS.private_key,
	scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

/**
 * Creates a new sheet (tab) in the spreadsheet
 * @param {Object} auth - JWT auth client
 * @param {string} sheetTitle - Title for the new sheet
 * @returns {Promise<string>} - A promise that resolves to the sheet ID
 */
async function createNewSheet(auth, sheetTitle) {
	const sheets = google.sheets({ version: 'v4', auth });

	try {
		// Add a new sheet
		const addSheetResponse = await sheets.spreadsheets.batchUpdate({
			spreadsheetId: SPREADSHEET_ID,
			requestBody: {
				requests: [
					{
						addSheet: {
							properties: {
								title: sheetTitle,
							},
						},
					},
				],
			},
		});

		// Extract the new sheet ID
		const sheetId = addSheetResponse.data.replies[0].addSheet.properties.sheetId;
		return sheetId;
	} catch (error) {
		// If sheet already exists, just return its title for using in range
		if (error.message.includes('already exists')) {
			return sheetTitle;
		}
		throw error;
	}
}

async function getSheet() {
	// Create Google Sheets client
	return google.sheets({ version: 'v4', auth });
}

/**
 * Add messages to Google Sheet, creating a new sheet with the current date if needed
 * @param {Object} sheetData - The data to be added to the sheet
 * @returns {Promise<Object>} - A promise that resolves to an object containing the sheet title and link
 * @property {string} sheetTitle - The title of the sheet
 * @property {string} sheetLink - The link to the specific sheet
 */
async function addToGoogleSheet(sheetData) {
	try {
		const sheets = await getSheet();

		// Create a sheet with today's date as the title
		const today = new Date();
		const sheetTitle = `${today.getFullYear()}-${(today.getMonth() + 1)
			.toString()
			.padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

		// Create the sheet or get existing one with the same name
		const sheetId = await createNewSheet(auth, sheetTitle);

		// Update the new sheet
		await sheets.spreadsheets.values.update({
			spreadsheetId: SPREADSHEET_ID,
			range: `${sheetTitle}!A1`, // Use the new sheet title in the range
			valueInputOption: 'RAW',
			requestBody: {
				values: sheetData,
			},
		});

		// Construct the link to the specific sheet
		const sheetLink = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit#gid=${sheetId}`;

		return {
			sheetTitle,
			sheetLink,
		};
	} catch (error) {
		console.error('Error adding to Google Sheet:', error);
		throw new Error(`Failed to add data to Google Sheet: ${error.message}`);
	}
}

// Add a function to add to a specific sheet
async function addToSpecificSheet(groupedMessages, sheetTitle) {
	try {
		// Set up authentication
		const auth = new JWT({
			email: CREDENTIALS.client_email,
			key: CREDENTIALS.private_key,
			scopes: ['https://www.googleapis.com/auth/spreadsheets'],
		});

		// Create or ensure sheet exists
		await createNewSheet(auth, sheetTitle);

		// Create Google Sheets client
		const sheets = google.sheets({ version: 'v4', auth });

		// Prepare values to update
		const rows = [
			['User', 'Dishes', 'Date', 'Time'], // Header row
		];

		// Add data rows
		for (const [user, messages] of Object.entries(groupedMessages)) {
			const now = new Date();
			rows.push([user, messages.join('\n'), now.toLocaleDateString(), now.toLocaleTimeString()]);
		}

		// Update the sheet
		await sheets.spreadsheets.values.update({
			spreadsheetId: SPREADSHEET_ID,
			range: `${sheetTitle}!A1`,
			valueInputOption: 'RAW',
			requestBody: {
				values: rows,
			},
		});

		return `Data successfully added to Google Sheet in tab "${sheetTitle}"!`;
	} catch (error) {
		console.error('Error adding to Google Sheet:', error);
		throw new Error(`Failed to add data to Google Sheet: ${error.message}`);
	}
}

export { addToGoogleSheet, addToSpecificSheet, getSheet };
