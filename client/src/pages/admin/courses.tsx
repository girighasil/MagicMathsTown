import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { EditModal } from "@/components/admin/EditModal";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Course } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  duration: z.string().min(1, "Duration is required"),
  modules: z.coerce.number().min(1, "Must have at least 1 module"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  discountPrice: z.coerce.number().optional(),
  imageUrl: z.string().url("Must be a valid URL"),
  category: z.string().min(1, "Category is required"),
  popular: z.boolean().default(false),
  isLive: z.boolean().default(true),
});

type CourseValues = z.infer<typeof courseSchema>;

export default function CourseManagement() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const form = useForm<CourseValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: "",
      modules: 1,
      price: 0,
      discountPrice: 0,
      imageUrl: "",
      category: "",
      popular: false,
      isLive: true,
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: CourseValues) => {
      const res = await apiRequest("POST", "/api/admin/courses", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Success!",
        description: "Course created successfully",
      });
      setIsModalOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create course: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async (data: { id: number; course: CourseValues }) => {
      const res = await apiRequest(
        "PUT", 
        `/api/admin/courses/${data.id}`, 
        data.course
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Success!",
        description: "Course updated successfully",
      });
      setIsModalOpen(false);
      setSelectedCourse(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update course: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/courses/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Success!",
        description: "Course deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete course: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleOpenModal = (course?: Course) => {
    if (course) {
      setSelectedCourse(course);
      form.reset({
        title: course.title,
        description: course.description,
        duration: course.duration,
        modules: course.modules,
        price: course.price,
        discountPrice: course.discountPrice || 0,
        imageUrl: course.imageUrl,
        category: course.category,
        popular: course.popular,
        isLive: course.isLive,
      });
    } else {
      setSelectedCourse(null);
      form.reset({
        title: "",
        description: "",
        duration: "",
        modules: 1,
        price: 0,
        discountPrice: 0,
        imageUrl: "",
        category: "",
        popular: false,
        isLive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    form.handleSubmit((data) => {
      if (selectedCourse) {
        updateCourseMutation.mutate({ id: selectedCourse.id, course: data });
      } else {
        createCourseMutation.mutate(data);
      }
    })();
  };

  const handleDelete = (course: Course) => {
    if (window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
      deleteCourseMutation.mutate(course.id);
    }
  };

  const columns = [
    { key: "title", title: "Title" },
    { 
      key: "price", 
      title: "Price", 
      render: (course: Course) => (
        <div>
          {course.discountPrice ? (
            <div>
              <span className="line-through text-gray-400">₹{course.price}</span>
              {" "}
              <span className="font-medium">₹{course.discountPrice}</span>
            </div>
          ) : (
            <span>₹{course.price}</span>
          )}
        </div>
      ) 
    },
    { key: "duration", title: "Duration" },
    { key: "category", title: "Category" },
    { 
      key: "popular", 
      title: "Popular", 
      render: (course: Course) => (
        <div className={course.popular ? "text-green-600" : "text-red-600"}>
          {course.popular ? "Yes" : "No"}
        </div>
      ) 
    },
    { 
      key: "isLive", 
      title: "Status", 
      render: (course: Course) => (
        <div className={course.isLive ? "text-green-600" : "text-red-600"}>
          {course.isLive ? "Live" : "Draft"}
        </div>
      ) 
    },
  ];

  const isSubmitting = createCourseMutation.isPending || updateCourseMutation.isPending;

  return (
    <AdminLayout title="Course Management">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          title="Courses"
          data={courses || []}
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
        title={selectedCourse ? "Edit Course" : "Add New Course"}
        description={selectedCourse 
          ? "Update the course details below." 
          : "Fill in the course details below."}
        isSubmitting={isSubmitting}
      >
        <form className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                {...form.register("category")}
              />
              {form.formState.errors.category && (
                <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                {...form.register("duration")}
              />
              {form.formState.errors.duration && (
                <p className="text-sm text-red-500">{form.formState.errors.duration.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="modules">Number of Modules</Label>
              <Input
                id="modules"
                type="number"
                {...form.register("modules", { valueAsNumber: true })}
              />
              {form.formState.errors.modules && (
                <p className="text-sm text-red-500">{form.formState.errors.modules.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                {...form.register("price", { valueAsNumber: true })}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountPrice">Discount Price (₹) (Optional)</Label>
              <Input
                id="discountPrice"
                type="number"
                {...form.register("discountPrice", { valueAsNumber: true })}
              />
              {form.formState.errors.discountPrice && (
                <p className="text-sm text-red-500">{form.formState.errors.discountPrice.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              {...form.register("imageUrl")}
            />
            {form.formState.errors.imageUrl && (
              <p className="text-sm text-red-500">{form.formState.errors.imageUrl.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Switch
                id="popular"
                {...form.register("popular")}
                checked={form.watch("popular")}
                onCheckedChange={(checked) => form.setValue("popular", checked)}
              />
              <Label htmlFor="popular">Popular Course</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isLive"
                {...form.register("isLive")}
                checked={form.watch("isLive")}
                onCheckedChange={(checked) => form.setValue("isLive", checked)}
              />
              <Label htmlFor="isLive">Live Course</Label>
            </div>
          </div>
        </form>
      </EditModal>
    </AdminLayout>
  );
}