import React from 'react';

import DataTable from './components/DataTable';
import ItemSelector from './components/ItemSelector';
import './index.css';

function App() {
  const [warframedata, setWarframeData] = React.useState([]);

  const getWarframeSetData = async () => {
    const response = await fetch('/api/warframe/prime-sets');
    const data = await response.json();
    setWarframeData(data);
  };

  React.useEffect(() => {
    getWarframeSetData();
  }, []);

  return (
    <DataTable data={warframedata} />
  );
}

export default App;
