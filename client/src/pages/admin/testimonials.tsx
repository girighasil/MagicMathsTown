import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { EditModal } from "@/components/admin/EditModal";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Testimonial } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Star, StarHalf } from "lucide-react";

const testimonialSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  testimonial: z.string().min(10, "Testimonial must be at least 10 characters"),
  rating: z.coerce.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  examName: z.string().optional(),
  rank: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional(),
});

type TestimonialValues = z.infer<typeof testimonialSchema>;

export default function TestimonialManagement() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);

  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  const form = useForm<TestimonialValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: "",
      testimonial: "",
      rating: 5,
      examName: "",
      rank: "",
      imageUrl: "",
    },
  });

  const createTestimonialMutation = useMutation({
    mutationFn: async (data: TestimonialValues) => {
      const res = await apiRequest("POST", "/api/admin/testimonials", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      toast({
        title: "Success!",
        description: "Testimonial created successfully",
      });
      setIsModalOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create testimonial: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateTestimonialMutation = useMutation({
    mutationFn: async (data: { id: number; testimonial: TestimonialValues }) => {
      const res = await apiRequest(
        "PUT", 
        `/api/admin/testimonials/${data.id}`, 
        data.testimonial
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      toast({
        title: "Success!",
        description: "Testimonial updated successfully",
      });
      setIsModalOpen(false);
      setSelectedTestimonial(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update testimonial: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/testimonials/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      toast({
        title: "Success!",
        description: "Testimonial deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete testimonial: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleOpenModal = (testimonial?: Testimonial) => {
    if (testimonial) {
      setSelectedTestimonial(testimonial);
      form.reset({
        name: testimonial.name,
        testimonial: testimonial.testimonial,
        rating: testimonial.rating,
        examName: testimonial.examName || "",
        rank: testimonial.rank || "",
        imageUrl: testimonial.imageUrl || "",
      });
    } else {
      setSelectedTestimonial(null);
      form.reset({
        name: "",
        testimonial: "",
        rating: 5,
        examName: "",
        rank: "",
        imageUrl: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    form.handleSubmit((data) => {
      if (selectedTestimonial) {
        updateTestimonialMutation.mutate({ id: selectedTestimonial.id, testimonial: data });
      } else {
        createTestimonialMutation.mutate(data);
      }
    })();
  };

  const handleDelete = (testimonial: Testimonial) => {
    if (window.confirm(`Are you sure you want to delete "${testimonial.name}"'s testimonial?`)) {
      deleteTestimonialMutation.mutate(testimonial.id);
    }
  };

  const renderRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    
    return <div className="flex">{stars}</div>;
  };

  const columns = [
    { key: "name", title: "Name" },
    { 
      key: "testimonial", 
      title: "Testimonial",
      render: (testimonial: Testimonial) => (
        <div className="max-w-[300px] truncate">
          {testimonial.testimonial}
        </div>
      )
    },
    { 
      key: "rating", 
      title: "Rating", 
      render: (testimonial: Testimonial) => renderRating(testimonial.rating)
    },
    { key: "examName", title: "Exam" },
    { key: "rank", title: "Rank" },
  ];

  const isSubmitting = createTestimonialMutation.isPending || updateTestimonialMutation.isPending;

  return (
    <AdminLayout title="Testimonial Management">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          title="Testimonials"
          data={testimonials || []}
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
        title={selectedTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
        description={selectedTestimonial 
          ? "Update the testimonial details below." 
          : "Fill in the testimonial details below."}
        isSubmitting={isSubmitting}
      >
        <form className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="testimonial">Testimonial</Label>
            <Textarea
              id="testimonial"
              rows={4}
              {...form.register("testimonial")}
            />
            {form.formState.errors.testimonial && (
              <p className="text-sm text-red-500">{form.formState.errors.testimonial.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                step="0.5"
                {...form.register("rating", { valueAsNumber: true })}
              />
              {form.formState.errors.rating && (
                <p className="text-sm text-red-500">{form.formState.errors.rating.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="examName">Exam Name (Optional)</Label>
              <Input
                id="examName"
                {...form.register("examName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rank">Rank (Optional)</Label>
              <Input
                id="rank"
                {...form.register("rank")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (Optional)</Label>
            <Input
              id="imageUrl"
              {...form.register("imageUrl")}
            />
            {form.formState.errors.imageUrl && (
              <p className="text-sm text-red-500">{form.formState.errors.imageUrl.message}</p>
            )}
          </div>
        </form>
      </EditModal>
    </AdminLayout>
  );
}