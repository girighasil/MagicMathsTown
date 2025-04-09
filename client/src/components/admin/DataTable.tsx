import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2, Plus } from "lucide-react";
import { ReactNode } from "react";

interface DataTableProps<T> {
  data: T[];
  columns: { 
    key: string; 
    title: string;
    render?: (item: T) => ReactNode;
  }[];
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  onAdd: () => void;
  isLoading?: boolean;
  keyField?: keyof T;
  title: string;
}

export function DataTable<T>({
  data,
  columns,
  onEdit,
  onDelete,
  onAdd,
  isLoading = false,
  keyField = 'id' as keyof T,
  title
}: DataTableProps<T>) {
  return (
    <Card className="w-full">
      <div className="p-4 flex justify-between items-center border-b">
        <h3 className="text-lg font-medium">{title}</h3>
        <Button onClick={onAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add New
        </Button>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No data available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key}>{column.title}</TableHead>
                  ))}
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={String(item[keyField])}>
                    {columns.map((column) => (
                      <TableCell key={`${String(item[keyField])}-${column.key}`}>
                        {column.render
                          ? column.render(item)
                          : String(item[column.key as keyof T] || '')}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive"
                          onClick={() => onDelete(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Card>
  );
}