import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function ItemSelector({ selectedTag, setSelectedTag }) {
  return (
    <Select onValueChange={setSelectedTag}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a tag" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Tags</SelectLabel>
          {tags.map((tag) => <SelectItem value={tag}>{tag}</SelectItem>)}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default ItemSelector;
