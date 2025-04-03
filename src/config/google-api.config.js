// Instead of hardcoding credentials
export const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
export const CREDENTIALS = {
	client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
	private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Fix for escaped newlines
};
export const GOOGLE_SPREADSHEET_MENU_URL =
	process.env.GOOGLE_SPREADSHEET_MENU_URL ||
	'https://docs.google.com/spreadsheets/d/1K28IKNsz-82qA37GoYW4OWKDvsr9qEU4o51xGSH6WqA/edit#gid=0';
export const GOOGLE_SPREADSHEET_MENU_ID =
	process.env.GOOGLE_SPREADSHEET_MENU_ID || '1K28IKNsz-82qA37GoYW4OWKDvsr9qEU4o51xGSH6WqA';
