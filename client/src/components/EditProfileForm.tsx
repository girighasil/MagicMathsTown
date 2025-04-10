import React, { useState, useRef, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  photoUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function EditProfileForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone ?? "",
      photoUrl: user?.photoUrl || "",
    },
  });

  // Function to handle photo selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Here you would typically upload the file to a server/cloud storage
    // and get back a URL to store in the user's profile
    setIsUploading(true);
    
    // Mock upload - in a real app, you'd upload to a server
    setTimeout(() => {
      // For demo, we're just using the data URL as the "uploaded" image URL
      form.setValue('photoUrl', reader.result as string);
      setIsUploading(false);
      toast({
        title: "Photo uploaded",
        description: "Your profile photo has been uploaded.",
      });
    }, 1500);
  };

  // Function to trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const response = await apiRequest("PUT", `/api/users/${user?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      // Invalidate user data to refresh it
      queryClient.invalidateQueries({ queryKey: ['/api/session'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: ProfileFormValues) {
    updateProfileMutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Hidden file input for photo upload */}
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handlePhotoChange}
        />
        
        {/* Photo upload UI */}
        <div className="flex flex-col items-center justify-center mb-4">
          <div 
            className="relative group cursor-pointer"
            onClick={triggerFileInput}
          >
            <Avatar className="h-24 w-24 border-2 border-primary">
              {photoPreview ? (
                <AvatarImage src={photoPreview} alt="Profile preview" />
              ) : user?.photoUrl ? (
                <AvatarImage src={user.photoUrl} alt={user.fullName || user.username} />
              ) : (
                <AvatarFallback className="text-2xl font-semibold">
                  {user?.fullName ? user.fullName.charAt(0) : user?.username.charAt(0)}
                </AvatarFallback>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </div>
            </Avatar>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Click to change photo</p>
        </div>
        
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button 
            type="submit" 
            disabled={updateProfileMutation.isPending || isUploading}
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : "Update Profile"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}