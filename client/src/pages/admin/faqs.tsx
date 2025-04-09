import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { EditModal } from "@/components/admin/EditModal";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FAQ } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const faqSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  answer: z.string().min(5, "Answer must be at least 5 characters"),
  order: z.coerce.number().min(1, "Order must be at least 1"),
});

type FAQValues = z.infer<typeof faqSchema>;

export default function FAQManagement() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);

  const { data: faqs, isLoading } = useQuery<FAQ[]>({
    queryKey: ["/api/faqs"],
  });

  const form = useForm<FAQValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: "",
      answer: "",
      order: 1,
    },
  });

  const createFAQMutation = useMutation({
    mutationFn: async (data: FAQValues) => {
      const res = await apiRequest("POST", "/api/admin/faqs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({
        title: "Success!",
        description: "FAQ created successfully",
      });
      setIsModalOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create FAQ: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateFAQMutation = useMutation({
    mutationFn: async (data: { id: number; faq: FAQValues }) => {
      const res = await apiRequest(
        "PUT", 
        `/api/admin/faqs/${data.id}`, 
        data.faq
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({
        title: "Success!",
        description: "FAQ updated successfully",
      });
      setIsModalOpen(false);
      setSelectedFAQ(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update FAQ: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteFAQMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/faqs/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({
        title: "Success!",
        description: "FAQ deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete FAQ: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleOpenModal = (faq?: FAQ) => {
    if (faq) {
      setSelectedFAQ(faq);
      form.reset({
        question: faq.question,
        answer: faq.answer,
        order: faq.order,
      });
    } else {
      setSelectedFAQ(null);
      form.reset({
        question: "",
        answer: "",
        order: (faqs?.length || 0) + 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    form.handleSubmit((data) => {
      if (selectedFAQ) {
        updateFAQMutation.mutate({ id: selectedFAQ.id, faq: data });
      } else {
        createFAQMutation.mutate(data);
      }
    })();
  };

  const handleDelete = (faq: FAQ) => {
    if (window.confirm(`Are you sure you want to delete this FAQ?`)) {
      deleteFAQMutation.mutate(faq.id);
    }
  };

  const columns = [
    { 
      key: "question", 
      title: "Question",
      render: (faq: FAQ) => (
        <div className="max-w-[400px] truncate font-medium">
          {faq.question}
        </div>
      )
    },
    { 
      key: "answer", 
      title: "Answer",
      render: (faq: FAQ) => (
        <div className="max-w-[400px] truncate text-muted-foreground">
          {faq.answer}
        </div>
      )
    },
    { key: "order", title: "Display Order" },
  ];

  const isSubmitting = createFAQMutation.isPending || updateFAQMutation.isPending;

  return (
    <AdminLayout title="FAQ Management">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          title="Frequently Asked Questions"
          data={faqs || []}
          columns={columns}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          onAdd={() => handleOpenModal()}
          isLoading={isLoading}
        />
      )}

      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title={selectedFAQ ? "Edit FAQ" : "Add New FAQ"}
        description={selectedFAQ 
          ? "Update the FAQ details below." 
          : "Fill in the FAQ details below."}
        isSubmitting={isSubmitting}
      >
        <form className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              {...form.register("question")}
            />
            {form.formState.errors.question && (
              <p className="text-sm text-red-500">{form.formState.errors.question.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Answer</Label>
            <Textarea
              id="answer"
              rows={4}
              {...form.register("answer")}
            />
            {form.formState.errors.answer && (
              <p className="text-sm text-red-500">{form.formState.errors.answer.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              type="number"
              min="1"
              {...form.register("order", { valueAsNumber: true })}
            />
            {form.formState.errors.order && (
              <p className="text-sm text-red-500">{form.formState.errors.order.message}</p>
            )}
          </div>
        </form>
      </EditModal>
    </AdminLayout>
  );
}