import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function DataTable({ data, type }) {
  console.log(type, data);
  return (
    <div className="max-h-96 overflow-y-auto w-full">
      <Table>
        <TableCaption className="text-foreground">
          List of
          {' '}
          {type}
          {' '}
          set median prices
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky top-0 z-10 bg-background">{type}</TableHead>
            <TableHead className="sitcky top-0 z-10 bg-background">Median Price</TableHead>
            <TableHead className="sticky top-0 z-10 bg-background">Volume</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.name}>
              <TableCell className="font-base">{item.name}</TableCell>
              <TableCell>{item.medianPrice}</TableCell>
              <TableCell>{item.volume}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default DataTable;
