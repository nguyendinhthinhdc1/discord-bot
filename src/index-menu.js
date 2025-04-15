const { Client } = require('@elastic/elasticsearch');
const { getSheet } = require('../src/services/google-api.service'); // Adjust path if needed
const { GOOGLE_SPREADSHEET_MENU_ID } = require('../src/config/google-api.config'); // Adjust path
const restaurants = require('./data/restaurants.json'); // Make sure path is correct

// --- Configuration ---
// Use the same client configuration as your main app
// Ensure your Docker container or local ES instance is running
const esClient = new Client({ node: 'http://localhost:9200' });
// --- End Configuration ---

/**
 * Fetches menu data for a specific restaurant from Google Sheets.
 * (Similar to fetchMenuData in billing.js, but adapted for this script)
 * @param {string} restaurantName
 * @returns {Promise<Array<{dishName: string, price: number}>>}
 */
async function fetchRestaurantMenu(restaurantName) {
    console.log(`Fetching menu for: ${restaurantName}`);
    const sheets = await getSheet();
    if (!sheets) {
        throw new Error('Google Sheets client not initialized.');
    }
    const range = `${restaurantName}!A:B`; // Assumes Name in A, Price in B

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SPREADSHEET_MENU_ID,
            range,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            console.warn(`No data found in the menu sheet for ${restaurantName}.`);
            return [];
        }

        // Skip header row if present (optional, adjust if needed)
        // const headerRow = rows.shift();

        const menuItems = rows
            .map(([name, price]) => {
                const dishPrice = parseFloat(String(price).trim().replace(/,/g, '')); // Clean up price
                if (name && !isNaN(price)) {
                    return { dishName: String(name).trim(), price: dishPrice };
                }
                return null;
            })
            .filter(item => item !== null); // Filter out invalid rows

        console.log(`Fetched ${menuItems.length} items for ${restaurantName}.`);
        return menuItems;

    } catch (error) {
        console.error(`Error fetching sheet for ${restaurantName}: ${error.message}`);
        // Handle specific errors like sheet not found if necessary
        if (error.code === 400 && error.errors?.[0]?.message.includes('Unable to parse range')) {
             console.warn(`Sheet or range likely not found for ${restaurantName}. Skipping.`);
             return [];
        }
        throw error; // Re-throw other errors
    }
}

/**
 * Indexes menu data into Elasticsearch using the bulk API.
 * @param {string} indexName
 * @param {Array<object>} menuItems
 */
async function indexData(indexName, menuItems) {
    if (menuItems.length === 0) {
        console.log(`No items to index for ${indexName}.`);
        return;
    }

    console.log(`Indexing ${menuItems.length} items into index: ${indexName}`);

    // Check if index exists, create if not (optional, ES can often auto-create)
    const indexExists = await esClient.indices.exists({ index: indexName });
    if (!indexExists.body) {
        console.log(`Index ${indexName} does not exist. Creating...`);
        // You might want to define mappings here for better type handling
        await esClient.indices.create({ index: indexName });
        console.log(`Index ${indexName} created.`);
    } else {
         console.log(`Index ${indexName} already exists. Adding/updating documents.`);
         // Optional: Delete existing documents if you want a fresh import
         // await esClient.deleteByQuery({ index: indexName, body: { query: { match_all: {} } } });
         // console.log(`Deleted existing documents in ${indexName}.`);
    }


    // Prepare bulk operations: pairs of { action: metadata }, { document }
    const operations = menuItems.flatMap(doc => [
        { index: { _index: indexName } }, // Action: index this document
        doc // The document itself
    ]);

    try {
        const bulkResponse = await esClient.bulk({ refresh: true, operations });

        // --- Debugging: Log the raw response ---
        // console.log('Raw bulk response:', JSON.stringify(bulkResponse, null, 2));
        // --- End Debugging ---

        // Check if body exists before accessing properties
        if (bulkResponse && bulkResponse.body) {
            if (bulkResponse.body.errors) {
                console.error(`Bulk indexing errors encountered for ${indexName}:`);
                // Log detailed errors
                bulkResponse.body.items.forEach((action, i) => {
                    const operation = Object.keys(action)[0];
                    if (action[operation].error) {
                        console.error(`  Error for item ${i}: ${JSON.stringify(action[operation].error)}`);
                        // Ensure menuItems[i] exists before logging
                        if (menuItems[i]) {
                            console.error(`  Document: ${JSON.stringify(menuItems[i])}`);
                        } else {
                             console.error(`  Document data unavailable for item ${i}.`);
                        }
                    }
                });
            } else {
                // Check if items array exists and has length
                const indexedCount = bulkResponse.body.items?.length || 0;
                console.log(`Successfully indexed ${indexedCount} items into ${indexName}.`);
            }
        } else {
            // Handle cases where the response structure is unexpected
            console.error(`Error during bulk indexing for ${indexName}: Unexpected response structure.`);
            console.error('Received bulk response:', JSON.stringify(bulkResponse, null, 2)); // Log the unexpected response
        }
    } catch (err) {
        console.error(`Error during bulk indexing for ${indexName}:`, err);
        // Log the error object itself for more details if available
        // console.error('Caught Error Object:', JSON.stringify(err, null, 2));
    }
}

// --- Main Execution ---
async function initMenu() {
    console.log('Starting menu indexing process...');
    for (const restaurant of restaurants) {
        const restaurantName = restaurant.name;
        const indexName = restaurant.indexName; // <-- Use the field from JSON

        if (!indexName) {
            console.warn(`Skipping restaurant "${restaurantName}" because 'indexName' is missing in restaurants.json.`);
            continue; // Skip if indexName is not defined
        }

        try {
            // Pass the original name to fetch from the correct sheet tab
            const menuItems = await fetchRestaurantMenu(restaurantName);
            // Pass the predefined indexName to the indexing function
            await indexData(indexName, menuItems);
        } catch (error) {
            console.error(`Failed to process restaurant ${restaurantName} (index: ${indexName}):`, error);
        }
        console.log('---'); // Separator
    }
    console.log('Menu indexing process finished.');
}

module.exports = { initMenu };