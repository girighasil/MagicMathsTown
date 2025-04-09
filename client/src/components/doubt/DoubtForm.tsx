import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudUpload } from "lucide-react";
import { SUBJECTS, TIME_SLOTS } from "@/lib/constants";

const doubtFormSchema = z.object({
  subject: z.string().min(1, "Please select a subject"),
  date: z.string().min(1, "Please select a date"),
  timeSlot: z.string().min(1, "Please select a time slot"),
  description: z.string().min(10, "Please describe your doubt in at least 10 characters"),
  imageUrl: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
});

type DoubtFormValues = z.infer<typeof doubtFormSchema>;

export default function DoubtForm() {
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  const form = useForm<DoubtFormValues>({
    resolver: zodResolver(doubtFormSchema),
    defaultValues: {
      subject: "",
      date: "",
      timeSlot: "",
      description: "",
      imageUrl: "",
      name: "",
      email: "",
      phone: "",
    },
  });
  
  const bookSession = useMutation({
    mutationFn: async (data: DoubtFormValues) => {
      return apiRequest("POST", "/api/doubt-sessions", data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your doubt session has been booked successfully.",
        variant: "default",
      });
      form.reset();
      setUploadedImage(null);
    },
    onError: (error) => {
      toast({
        title: "Error booking session",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DoubtFormValues) => {
    bookSession.mutate(data);
  };

  // Mock file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server
      // For now, we'll just use a local URL
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      form.setValue("imageUrl", "example-image-url.jpg");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="p-6">
      <div className="mb-4">
        <Label htmlFor="subject">Select Subject</Label>
        <Select 
          onValueChange={(value) => form.setValue("subject", value)}
          defaultValue={form.getValues("subject")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {SUBJECTS.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.subject && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.subject.message}</p>
        )}
      </div>

      <div className="mb-4">
        <Label htmlFor="date">Select Date</Label>
        <Input
          type="date"
          id="date"
          min={new Date().toISOString().split('T')[0]}
          {...form.register("date")}
        />
        {form.formState.errors.date && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.date.message}</p>
        )}
      </div>

      <div className="mb-4">
        <Label htmlFor="timeSlot">Preferred Time Slot</Label>
        <Select 
          onValueChange={(value) => form.setValue("timeSlot", value)}
          defaultValue={form.getValues("timeSlot")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a time slot" />
          </SelectTrigger>
          <SelectContent>
            {TIME_SLOTS.map((slot) => (
              <SelectItem key={slot} value={slot}>
                {slot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.timeSlot && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.timeSlot.message}</p>
        )}
      </div>

      <div className="mb-4">
        <Label htmlFor="name">Your Name</Label>
        <Input id="name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="mb-4">
        <Label htmlFor="email">Your Email</Label>
        <Input id="email" type="email" {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="mb-4">
        <Label htmlFor="phone">Phone Number (Optional)</Label>
        <Input id="phone" {...form.register("phone")} />
      </div>

      <div className="mb-4">
        <Label htmlFor="description">Brief Description of Your Doubt</Label>
        <Textarea 
          id="description" 
          rows={3} 
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="mb-6">
        <Label htmlFor="image">Upload Image (Optional)</Label>
        <div
          className="border border-dashed border-gray-300 rounded p-4 text-center cursor-pointer hover:bg-gray-50"
          onClick={() => document.getElementById("image-upload")?.click()}
        >
          <input
            type="file"
            id="image-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />
          {uploadedImage ? (
            <div className="flex flex-col items-center">
              <img src={uploadedImage} alt="Uploaded" className="h-20 object-contain mb-2" />
              <p className="text-green-600 text-sm">Image uploaded successfully</p>
            </div>
          ) : (
            <>
              <CloudUpload className="mx-auto text-gray-400 mb-2 h-8 w-8" />
              <p className="text-gray-500 text-sm">Click to upload or drag and drop</p>
            </>
          )}
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold"
        disabled={bookSession.isPending}
      >
        {bookSession.isPending ? "Booking..." : "Book Session Now"}
      </Button>
    </form>
  );
}
