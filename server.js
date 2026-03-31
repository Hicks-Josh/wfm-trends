import Fastify from 'fastify';
import fs from 'fs';

const fastify = Fastify({ logger: true });

let items = [];
let itemCache = [];
let itemsLastRefresh = null;
let tags = [];
let warframeSetData = null;

const FIFTEEN_MINUTES_MS = 60 * 60 * 1000 * 15;
const BASE_URL = 'https://api.warframe.market/v2/';
const BASE_URL_V1 = 'https://api.warframe.market/v1/';

const itemData = JSON.parse(await fs.readFileSync('./item-data.json'));

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function refreshItems() {
  if (!itemsLastRefresh || itemsLastRefresh + FIFTEEN_MINUTES_MS < Date.now()) {
    console.log(
      '-- re fetching data...',
      itemsLastRefresh - FIFTEEN_MINUTES_MS - Date.now(),
    );
    const fetchedData = await fetch(`${BASE_URL}/items`);
    items = await fetchedData.json();
    itemsLastRefresh = Date.now();
  }

  const tagSet = new Set();

  items.data.forEach((item) => {
    item.tags.forEach((i) => {
      tagSet.add(i);
    });
  });

  tags = [...tagSet];
  // fs.writeFileSync('./items.json', tags.toString());
}

async function initDataCache() {
  await refreshItems();

  const results = [];
  console.log('-- items', items);
  // naively iterate over all items to check median price and volume
  // only get today because we don't really care about general averages
  // because the chances of the trend changing drastically are too low...
  for (let i = 0; i < items.length; i++) {
    const response = await fetch(
      `${BASE_URL_V1}/items/${items[i].slug}/statistics`,
    );
    const result = await response.json();
    const statistics =
      result.payload.statistics_closed['90days'][
        result.payload.statistics_closed['90days'].length - 1
      ];
    results.push({
      medianPrice: statistics?.median,
      volume: statistics?.volume,
      name: items[i].i18n.en.name,
    });

    // this route is rate limitted to two requests a second
    if (i % 2) {
      await sleep(1000);
    }
  }
  console.log('----\n\n');
  console.log(results);
  itemCache = results;

  fs.writeFileSync('./data.json', JSON.stringify(itemCache));
}

async function initWarframeSetData() {
  await refreshItems();

  const primeWarframeSets = items.data.filter((item) =>
    ['prime', 'set', 'warframe'].every((t) => item.tags.includes(t)),
  );

  const results = [];

  // naively iterate over all prime sets to check median price and volume
  // only get today because we don't really care about general averages
  // because the chances of the trend changing drastically are too low...
  for (let i = 0; i < primeWarframeSets.length; i++) {
    const response = await fetch(
      `${BASE_URL_V1}/items/${primeWarframeSets[i].slug}/statistics`,
    );
    const result = await response.json();
    const statistics =
      result.payload.statistics_closed['90days'][
        result.payload.statistics_closed['90days'].length - 1
      ];
    results.push({
      medianPrice: statistics?.median,
      volume: statistics?.volume,
      name: primeWarframeSets[i].i18n.en.name,
    });

    // this route is rate limitted to two requests a second
    if (i % 2) {
      await sleep(1000);
    }
  }

  warframeSetData = results;

  fs.writeFileSync('./set-data.json', JSON.stringify(warframeSetData));
}

async function initMarketData() {
  // check if a file exists, if not
  // pull all items two at a time down
  // save to a file to avoid having to do this every stack reset
  console.log('--- initializing market data');
  const fetchedItemData = await fetch(`${BASE_URL}/items`);
  const { data: itemData } = await fetchedItemData.json();
  const itemsLastRefreshed = Date.now();

  console.log('-- starting statistic grabber');

  for (let i = 0; i < itemData?.length; i++) {
    console.log('fetching', itemData[i].slug);
    const response = await fetch(
      `${BASE_URL_V1}/items/${itemData[i].slug}/statistics`,
    );
    const result = await response.json();
    const statistics =
      result.payload.statistics_closed['90days'][
        result.payload.statistics_closed['90days'].length - 1
      ];
    itemData[i].statistics = statistics;

    // this route is rate limitted to two requests a second
    if (i % 2) {
      await sleep(1_000);
    }
  }

  fs.writeFileSync('./item-data.json', JSON.stringify(itemData));
  console.log('--- completed');
}

async function syncItems(itemSet) {
  const results = [];
  for (let i = 0; i < itemSet?.length; i++) {
    console.log('fetching', itemSet[i].slug);
    const response = await fetch(
      `${BASE_URL_V1}/items/${itemSet[i].slug}/statistics`,
    );
    const result = await response.json();
    const statistics =
      result.payload.statistics_closed['90days'][
        result.payload.statistics_closed['90days'].length - 1
      ];
    results.push(statistics);

    // this route is rate limitted to two requests a second
    if (i % 2) {
      await sleep(1_000);
    }
  }

  return results;
}

// fastify.get('/api/warframes', async () => {
// await refreshItems();
// await initMarketData();
// return
// return items;
// });

// fastify.get('/api/warframe/item-tags', async () => {
//   await refreshItems();
//   return tags;
// });
//
// fastify.get('/api/warframe/test', async () => {
//   // await refreshItems();
//
//   const urlName = 'chroma_prime_systems_blueprint';
//   const response = await fetch(' https://api.warframe.market/v1/items/arcane_energize/statistics ');
//   console.log('- response', response);
//   const data = await response.json();
//   console.log('--\n\n---\n', data);
//   // Filter completed/closed orders
//   return data;
//   const completed = data.payload.orders.filter((order) => order.status === 'closed');
//   return completed;
//
//   return items.data
//     .filter((item) => ['legendary', 'mod'].every((tag) => item.tags.includes(tag)))
//     .map((item) => `${item.i18n.en.name} - ${item.slug}`);
// });
//
// // fastify.get('/api/warframes', async () => {
// //
// // await initDataCache()
// //   await initWarframeSetData();
// //
// //   console.log('-- returning after sort');
// //
// // return itemCache;
// //   return warframeSetData.sort((a,b) => a.medianPrice - b.medianPrice).reverse();
// // });
// //

fastify.get('/api/warframes', async () => {
  return itemData.filter((item) =>
    ['warframe', 'set'].every((tag) => item.tags.includes(tag)),
  );
});

fastify.get('/api/weapons', async () => {
  return itemData.filter((item) =>
    ['weapon', 'set'].every((tag) => item.tags.includes(tag)),
  );
});
fastify.get('/api/arcanes', async () => {
  return itemData.filter((item) =>
    ['arcane_enhancement'].every((tag) => item.tags.includes(tag)),
  );
});

fastify.get('/api/mods', async () => {
  return itemData.filter((item) =>
    ['mod'].every((tag) => item.tags.includes(tag)),
  );
});
// fastify.get('/api/misc', async () => {});

fastify.listen({ port: 3001 });
