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

function DataTable({ data }) {
  console.log('data');
  console.log(data);
  return (
    <Table>
      <TableCaption className="text-foreground">
        List of prime warframe set median prices
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Warframe</TableHead>
          <TableHead>Median Price</TableHead>
          <TableHead>Volume</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((warframe) => (
          <TableRow key={warframe.name}>
            <TableCell className="font-base">{warframe.name}</TableCell>
            <TableCell>{warframe.medianPrice}</TableCell>
            <TableCell>{warframe.volume}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default DataTable;
