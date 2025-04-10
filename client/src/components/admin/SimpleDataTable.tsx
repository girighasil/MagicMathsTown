import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ReactNode } from "react";

interface SimpleDataTableProps<T> {
  data: T[];
  columns: { 
    key: string; 
    title: string;
    render?: (item: T) => ReactNode;
  }[];
  searchField?: string;
  searchPlaceholder?: string;
}

export function SimpleDataTable<T>({
  data,
  columns,
  searchField,
  searchPlaceholder = "Search..."
}: SimpleDataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = searchField 
    ? data.filter(item => {
        const searchValue = String(item[searchField as keyof T] || '').toLowerCase();
        return searchValue.includes(searchQuery.toLowerCase());
      })
    : data;

  return (
    <div className="w-full">
      {searchField && (
        <div className="mb-4">
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}
      
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key}>{column.title}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={`${index}-${column.key}`}>
                        {column.render
                          ? column.render(item)
                          : String(item[column.key as keyof T] || '')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}