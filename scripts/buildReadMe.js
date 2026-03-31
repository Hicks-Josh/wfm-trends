import fs from 'fs';

const data = JSON.parse(fs.readFileSync('item-data.json', 'utf-8'));

const warframeMarketURL = 'https://warframe.market/items';

const filterItems = (items, tags) =>
  items
    .filter((item) => tags.every((tag) => item.tags.includes(tag)))
    .map((item) => ({
      slug: item.slug,
      name: item.i18n.en.name,
      median: item.statistics?.median || 'not enough data...',
      volume: item.statistics?.volume || 'not enough data...',
    })).sort((a, b) => b.median - a.median);

const warframeData = filterItems(data, ['warframe', 'set']);
const weaponData = filterItems(data, ['weapon', 'set']);
const arcaneData = filterItems(data, ['arcane_enhancement']);
const modData = filterItems(data, ['mod']);

const markdown = `
# Warframe Market Trends
This is a basic trend analysis tool for [warframe.market](https://warframe.market/)
This README file is updated automatically once every week at midnight utc
If you want to dig further into the data, you can build the project, more details below.

## Warframe Trends

### Warframes
| Warframe | Median | Volume |
| --- | --- | --- |
${warframeData.slice(0, 10).map((warframe) => `| [${warframe.name}](${`${warframeMarketURL}/${warframe.slug}?type=sell`}) | ${warframe.median} | ${warframe.volume} |`).join('\n')}
<details>
  <summary>Show all</summary>

| Warframe | Median | Volume |
| --- | --- | --- |
${warframeData.map((warframe) => `| [${warframe.name}](${`${warframeMarketURL}/${warframe.slug}?type=sellc`}) | ${warframe.median} | ${warframe.volume} |`).join('\n')}
</details>

### Weapons
| Weapon | Median | Volume |
| --- | --- | --- |
${weaponData.slice(0, 10).map((weapon) => `| [${weapon.name}](${`${warframeMarketURL}/${weapon.slug}?type=sell`}) | ${weapon.median} | ${weapon.volume} |`).join('\n')}
<details>
  <summary>Show all</summary>

| Weapon | Median | Volume |
| --- | --- | --- |
${weaponData.map((weapon) => `| [${weapon.name}](${`${warframeMarketURL}/${weapon.slug}?type=sell`}) | ${weapon.median} | ${weapon.volume} |`).join('\n')}
</details>

### Arcanes
| arcane | Median | Volume |
| --- | --- | --- |
${arcaneData.slice(0, 10).map((arcane) => `| [${arcane.name}](${`${warframeMarketURL}/${arcane.slug}?type=sell`}) | ${arcane.median} | ${arcane.volume} |`).join('\n')}
<details>
  <summary>Show all</summary>

| arcane | Median | Volume |
| --- | --- | --- |
${arcaneData.map((arcane) => `| [${arcane.name}](${`${warframeMarketURL}/${arcane.slug}?type=sell`}) | ${arcane.median} | ${arcane.volume} |`).join('\n')}
</details>

### Mods
| mod | Median | Volume |
| --- | --- | --- |
${modData.slice(0, 10).map((mod) => `| [${mod.name}](${`${warframeMarketURL}/${mod.slug}?type=sell`}) | ${mod.median} | ${mod.volume} |`).join('\n')}
<details>
  <summary>Show all</summary>

| mod | Median | Volume |
| --- | --- | --- |
${modData.map((mod) => `| [${mod.name}](${`${warframeMarketURL}/${mod.slug}?type=sell`}) | ${mod.median} | ${mod.volume} |`).join('\n')}
</details>

## Build
The only dependencies are node 24 and npm
\`\`\`bash
npm i; npm start
\`\`\`


`;


fs.writeFileSync(`README.md`, markdown);
