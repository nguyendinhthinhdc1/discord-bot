const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const restaurantsFilePath = path.join(__dirname, '..', 'src', 'data', 'restaurants.json'); // Adjust path if needed

/**
 * Crawls menu data from a given restaurant's GrabFood link using Puppeteer.
 *
 * NOTE: Web scraping is fragile. Selectors might break if GrabFood changes its website structure.
 *       This requires inspecting the target page's HTML to find the correct selectors.
 *       Also, respect GrabFood's terms of service regarding automated access.
 *
 * @param {object} restaurant - A restaurant object containing a 'link' property.
 * @returns {Promise<Array<{dishName: string, price: number}>>} - A promise that resolves to an array of menu items.
 */
async function crawlRestaurantMenu(restaurant) {
    if (!restaurant || !restaurant.link) {
        console.warn(`Skipping restaurant due to missing data or link: ${restaurant?.name || 'Unknown'}`);
        return [];
    }

    console.log(`Attempting to crawl menu for: ${restaurant.name} from ${restaurant.link}`);
    let browser = null; // Declare browser outside try block for finally
    const menuItems = [];

    try {
        browser = await puppeteer.launch({
            // headless: false, // Set to false to see the browser window for debugging
            // args: ['--no-sandbox', '--disable-setuid-sandbox'] // Necessary for some environments
        });
        const page = await browser.newPage();

        // Forward browser console logs to Node console
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));

        // Set a realistic user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        console.log(`Navigating to ${restaurant.link}...`);
        await page.goto(restaurant.link, { waitUntil: 'networkidle2', timeout: 60000 }); // Wait for network activity to settle

        console.log(`Page loaded for ${restaurant.name}. Waiting for menu items...`);

        // --- IMPORTANT: Selector Identification Needed ---
        // You MUST inspect the GrabFood page structure to find the correct selectors.
        // These are placeholders and WILL likely need adjustment.
        const menuItemSelector = '.category___3C8lX'; // Example: Selector for each menu item container
        const dishNameSelector = '.itemNameTitle___1sFBq'; // Example: Selector for the dish name within an item
        const priceSelector = '.discountedPrice___3MBVA'; // Example: Selector for the price within an item
        // --- End Selector Identification ---

        try {
            // Wait for at least one menu item element to appear
            await page.waitForSelector(menuItemSelector, { timeout: 30000 });
            console.log('Menu item container selector found.');
        } catch (waitError) {
            console.error(`Could not find menu item selector '${menuItemSelector}' for ${restaurant.name} within timeout.`);
            // Try capturing a screenshot for debugging
            try {
                 const screenshotPath = path.join(__dirname, `error_${restaurant.name.replace(/[^a-z0-9]/gi, '_')}.png`);
                 await page.screenshot({ path: screenshotPath });
                 console.log(`Screenshot saved to ${screenshotPath}`);
            } catch (screenshotError) {
                 console.error('Failed to save screenshot:', screenshotError);
            }
            throw waitError; // Re-throw the error after attempting screenshot
        }


        // Extract data using page.evaluate
        const items = await page.evaluate((itemSel, nameSel, priceSel) => {
            console.log("🚀 ~ items ~ itemSel:", itemSel)

            const extractedItems = [];
            // Selects ALL elements matching itemSel
            const itemElements = document.querySelectorAll(itemSel);
            console.log("🚀 ~ items ~ itemElements:", itemElements.length)

            // Iterates over EACH selected element
            itemElements.forEach(category => {
                const groupItem = category.querySelectorAll('.menuItem___1HHmD')
                groupItem.forEach(item => {
                    const nameEl = item.querySelector(nameSel);
                    const priceEl = item.querySelector(priceSel);

                    if (nameEl && priceEl) {
                        const dishName = nameEl.innerText.trim();
                        // Price cleaning might be complex (e.g., "₫50,000", "From ₫30.000")
                        const priceText = priceEl.innerText.trim().replace(/[^0-9.,]/g, '').replace(',', ''); // Basic cleaning
                        const price = parseFloat(priceText);

                        if (dishName && !isNaN(price)) {
                            extractedItems.push({ dishName, price });
                        } else {
                            console.warn(`Could not parse item: Name='${nameEl.innerText}', Price='${priceEl.innerText}'`);
                        }
                    } else {
                        // Log if selectors didn't find elements within an item container
                        if (!nameEl) console.warn(`Dish name selector '${nameSel}' not found in an item.`);
                        if (!priceEl) console.warn(`Price selector '${priceSel}' not found in an item.`);
                    }
                })
            });
            return extractedItems;
        }, menuItemSelector, dishNameSelector, priceSelector);

        menuItems.push(...items);
        console.log(`Successfully crawled ${menuItems.length} items for ${restaurant.name}.`);

    } catch (error) {
        console.error(`Error crawling ${restaurant.name} (${restaurant.link}):`, error);
        // Return empty array or re-throw depending on desired error handling
        return [];
    } finally {
        if (browser) {
            await browser.close();
            console.log(`Browser closed for ${restaurant.name}.`);
        }
    }

    return menuItems;
}

// --- Example Usage ---
async function crawlAllRestaurants() {
    try {
        const data = await fs.readFile(restaurantsFilePath, 'utf-8');
        const restaurants = JSON.parse(data);
        const allMenus = {}; // Store results by restaurant name

        console.log(`Found ${restaurants.length} restaurants in ${restaurantsFilePath}`);

        for (const restaurant of restaurants) {
            // Add a delay between requests to be polite to the server
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay

            const menu = await crawlRestaurantMenu(restaurant);
            allMenus[restaurant.name] = menu;
            // Optional: Save menu to a file immediately?
            // await fs.writeFile(path.join(__dirname, `menu_${restaurant.indexName}.json`), JSON.stringify(menu, null, 2));
            console.log('---');
        }

        console.log('\n--- Crawling Summary ---');
        for (const name in allMenus) {
            console.log(`${name}: Found ${allMenus[name].length} items.`);
        }
        console.log('--- End Summary ---');

        // You could save the combined results here if needed
        // await fs.writeFile(path.join(__dirname, 'all_crawled_menus.json'), JSON.stringify(allMenus, null, 2));
        // console.log('Saved all crawled menus to all_crawled_menus.json');

    } catch (error) {
        console.error('Error reading or processing restaurants file:', error);
    }
}

// To run the crawl for all restaurants:
// crawlAllRestaurants();

// To test with a single restaurant (replace with an actual object from your JSON):

async function testSingle() {
    const testRestaurant = {
        "name": "Cơm Thảo Phương",
        "link": "https://food.grab.com/vn/vi/restaurant/qu%C3%A1n-c%C6%A1m-th%E1%BA%A3o-ph%C6%B0%C6%A1ng-delivery/5-CY3UEPCHV3THVX",
        "indexName": "menu-com-thao-phuong"
        // ... other properties
    };
    const menu = await crawlRestaurantMenu(testRestaurant);
    console.log(`\nTest Result for ${testRestaurant.name}:`);
    console.log(JSON.stringify(menu, null, 2));
}
testSingle();

module.exports = { crawlRestaurantMenu, crawlAllRestaurants }; // Export if needed elsewhere