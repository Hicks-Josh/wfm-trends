import React from 'react';

import DataTable from './DataTable';

function ItemTable({ itemType }) {
  const [data, setData] = React.useState([]);

  const getItemListData = React.useCallback(async () => {
    const response = await fetch(`/api/${itemType}`);
    const responseData = await response.json();
    console.log(itemType, responseData[0]);
    setData(responseData.map((item) => ({
      name: item.i18n.en.name,
      medianPrice: item.statistics?.median || 'not enough data...',
      volume: item.statistics?.volume,
    })));
  }, [itemType]);

  React.useEffect(() => {
    getItemListData();
  }, [getItemListData]);

  return <DataTable data={data} type={itemType} />;
}

export default ItemTable;
