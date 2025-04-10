import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Contact } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

export default function ContactsManagement() {
  const { toast } = useToast();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Fetch all contact messages
  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ['/api/admin/contacts'],
    refetchOnWindowFocus: true,
  });

  // Delete contact message mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/contacts/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Contact message deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contacts'] });
      setIsDeleteOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete contact message: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleView = (contact: Contact) => {
    setSelectedContact(contact);
    setIsViewOpen(true);
  };

  const handleDelete = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedContact) {
      deleteContactMutation.mutate(selectedContact.id);
    }
  };

  // Table columns configuration
  const columns = [
    { 
      key: "name", 
      title: "Name" 
    },
    { 
      key: "phone", 
      title: "Phone" 
    },
    { 
      key: "email", 
      title: "Email",
      render: (contact: Contact) => (
        <span>{contact.email || 'N/A'}</span>
      )
    },
    { 
      key: "subject", 
      title: "Subject" 
    },
    {
      key: "createdAt",
      title: "Date",
      render: (contact: Contact) => (
        <span title={new Date(contact.createdAt).toLocaleString()}>
          {formatDistanceToNow(new Date(contact.createdAt), { addSuffix: true })}
        </span>
      )
    }
  ];

  return (
    <AdminLayout title="Contact Messages">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Contact Messages</CardTitle>
            <CardDescription>
              View and manage messages from the contact form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              title="Contact Messages"
              data={contacts || []}
              columns={columns}
              onEdit={handleView}
              onDelete={handleDelete}
              onAdd={() => {}} // Not needed for contact messages
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      )}

      {/* View Contact Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Contact Message Details</DialogTitle>
            <DialogDescription>
              Message from {selectedContact?.name} sent {selectedContact?.createdAt ? new Date(selectedContact.createdAt).toLocaleString() : ''}
            </DialogDescription>
          </DialogHeader>
          
          {selectedContact && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Name:</div>
                <div className="col-span-3">{selectedContact.name}</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Phone:</div>
                <div className="col-span-3">{selectedContact.phone}</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Email:</div>
                <div className="col-span-3">{selectedContact.email || 'Not provided'}</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Subject:</div>
                <div className="col-span-3">{selectedContact.subject}</div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="font-medium">Message:</div>
                <div className="col-span-3 whitespace-pre-wrap">{selectedContact.message}</div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => {
                setIsViewOpen(false);
                setIsDeleteOpen(true);
              }}
            >
              Delete
            </Button>
            <Button onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the contact message from {selectedContact?.name}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteContactMutation.isPending}
            >
              {deleteContactMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}