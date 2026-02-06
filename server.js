import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

let items = [];
let itemsLastRefresh = null;
let tags = [];
let warframeSetData = null;

const FIFTEEN_MINUTES_MS = 60 * 60 * 1000 * 15;
const BASE_URL = 'https://api.warframe.market/v2/';
const BASE_URL_V1 = 'https://api.warframe.market/v1/';

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function refreshItems() {
  if (!itemsLastRefresh || itemsLastRefresh + FIFTEEN_MINUTES_MS < Date.now()) {
    console.log('-- re fetching data...', itemsLastRefresh - FIFTEEN_MINUTES_MS - Date.now());
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
}

async function initWarframeSetData() {
  await refreshItems();

  const primeWarframeSets = items.data
    .filter((item) => ['prime', 'set', 'warframe']
      .every((t) => item.tags.includes(t)));

  const results = [];

  // naively iterate over all prime sets to check median price and volume
  // only get today because we don't really care about general averages
  // because the chances of the trend changing drastically are too low...
  for (let i = 0; i < primeWarframeSets.length; i++) {
    const response = await fetch(`${BASE_URL_V1}/items/${primeWarframeSets[i].slug}/statistics`);
    const result = await response.json();
    const statistics = result.payload.statistics_closed['90days'][result.payload.statistics_closed['90days'].length -1];
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
}

fastify.get('/api/warframe/items', async () => {
  await refreshItems();
  return items;
});

fastify.get('/api/warframe/item-tags', async () => {
  await refreshItems();
  return tags;
});

fastify.get('/api/warframe/test', async () => {
  // await refreshItems();

  const urlName = 'chroma_prime_systems_blueprint';
  const response = await fetch(' https://api.warframe.market/v1/items/arcane_energize/statistics ');
  console.log('- response', response);
  const data = await response.json();
  console.log('--\n\n---\n', data);
  // Filter completed/closed orders
  return data;
  const completed = data.payload.orders.filter((order) => order.status === 'closed');
  return completed;

  return items.data
    .filter((item) => ['legendary', 'mod'].every((tag) => item.tags.includes(tag)))
    .map((item) => `${item.i18n.en.name} - ${item.slug}`);
});

// so I want to do a couple of things here.
// 1. it's cool to have a graph, but also not really that important.
//  all I care about is how much a set is worth
// 2. the data would get rather crowded if we have a bunch of graphs
// so for v1 let's make this only return the averages of each set from the past
fastify.get('/api/warframe/prime-sets', async () => {
  await initWarframeSetData();

  return warframeSetData.sort((a,b) => a.medianPrice - b.medianPrice).reverse();
});

fastify.listen({ port: 3001 });
