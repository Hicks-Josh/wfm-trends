import React from 'react';

import ItemTable from './components/ItemTable';

import './index.css';

function App() {
  return (
    <div className="bg-[radial-gradient(#000_0.1px,transparent_0.75px)] bg-[size:20px_20px]">
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 p-5">
        {/* <div className="col-span-2">toggle for sets only or to include parts</div> */}
        <ItemTable itemType="warframes" />
        <ItemTable itemType="weapons" />
        <ItemTable itemType="arcanes" />
        <ItemTable itemType="mods" />
      </div>
    </div>
  );
}

export default App;
