import fs from 'fs';

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const BASE_URL = 'https://api.warframe.market/v2/';
const BASE_URL_V1 = 'https://api.warframe.market/v1/';

let items; let tags;

async function fetchItems() {
  console.log('- fetch items\n-- fetching from warframe market...');
  const fetchedData = await fetch(`${BASE_URL}/items`);
  items = (await fetchedData.json()).data;
  console.log('-- fetched and parsed data\n-- generating tag set...');

  const tagSet = new Set();

  items.forEach((item) => {
    item.tags.forEach((i) => {
      tagSet.add(i);
    });
  });

  tags = [...tagSet];
}

async function defineDataCache() {
  await fetchItems();

  console.log('- defining data cache');

  const results = [];

  // naively iterate over all items to check median price and volume
  // only get today because we don't really care about general averages
  // because the chances of the trend changing drastically are too low...
  for (let i = 0; i < items.length; i++) {
    console.log('-- fetching', items[i].slug);
    const response = await fetch(
      `${BASE_URL_V1}/items/${items[i].slug}/statistics`,
    );
    const result = await response.json();
    const statistics = result.payload.statistics_closed['90days'][
      result.payload.statistics_closed['90days'].length - 1
    ];
    results.push({ ...items[i], statistics });

    // this route is rate limitted to two requests a second
    if (i % 2) {
      await sleep(1000);
    }
  }

  console.log('-- writing to item-data.json');
  fs.writeFileSync('./item-data.json', JSON.stringify(results));
}

defineDataCache();
