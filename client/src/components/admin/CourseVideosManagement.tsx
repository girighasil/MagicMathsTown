import React, { useState } from 'react';
import { useParams } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertCourseVideoSchema, type Course, type CourseVideo } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Upload, Youtube, Edit, Trash, Play, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Validation schema
const courseVideoFormSchema = insertCourseVideoSchema
  .omit({ courseId: true })
  .extend({
    courseId: z.number().optional(),
    videoType: z.enum(['youtube', 'upload']),
  });

type CourseVideoFormValues = z.infer<typeof courseVideoFormSchema>;

interface CourseVideosManagementProps {
  courseId: number;
}

export default function CourseVideosManagement({ courseId }: CourseVideosManagementProps) {
  const queryClient = useQueryClient();
  const [isAddVideoDialogOpen, setIsAddVideoDialogOpen] = useState(false);
  const [isEditVideoDialogOpen, setIsEditVideoDialogOpen] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState<CourseVideo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ videoFile: string; originalName: string; size: number } | null>(null);
  
  // Fetch course details
  const { data: course } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
  });

  // Fetch course videos
  const { data: videos, isLoading: videosLoading } = useQuery<CourseVideo[]>({
    queryKey: [`/api/courses/${courseId}/videos`],
  });

  // Add video form
  const addVideoForm = useForm<CourseVideoFormValues>({
    resolver: zodResolver(courseVideoFormSchema),
    defaultValues: {
      title: '',
      description: '',
      videoType: 'youtube',
      videoUrl: '',
      duration: '',
      order: 0,
      isPublished: false,
    },
  });

  // Edit video form
  const editVideoForm = useForm<CourseVideoFormValues>({
    resolver: zodResolver(courseVideoFormSchema),
    defaultValues: {
      title: '',
      description: '',
      videoType: 'youtube',
      videoUrl: '',
      videoFile: '',
      duration: '',
      order: 0,
      isPublished: false,
    },
  });

  // Reset form when dialog closes
  const resetAddVideoForm = () => {
    addVideoForm.reset();
    setUploadedFile(null);
  };

  // Set up edit form when a video is selected for editing
  const setupEditForm = (video: CourseVideo) => {
    setVideoToEdit(video);
    editVideoForm.reset({
      title: video.title,
      description: video.description || '',
      videoType: video.videoType as 'youtube' | 'upload',
      videoUrl: video.videoUrl || '',
      videoFile: video.videoFile || '',
      duration: video.duration || '',
      order: video.order,
      isPublished: video.isPublished,
    });
    setIsEditVideoDialogOpen(true);
  };

  // Upload video file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a valid video file (MP4, WebM, OGG, MOV)',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'The video file size must be less than 100MB',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('video', file);
      
      const response = await fetch('/api/admin/course-videos/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload video');
      }
      
      const data = await response.json();
      
      setUploadedFile({
        videoFile: data.videoFile,
        originalName: data.originalName,
        size: data.size,
      });
      
      // Update form values
      addVideoForm.setValue('videoFile', data.videoFile);
      
      toast({
        title: 'Video uploaded successfully',
        description: 'The video has been uploaded and is ready to be added to the course',
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload video. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Create course video mutation
  const createVideoMutation = useMutation({
    mutationFn: async (data: CourseVideoFormValues) => {
      const response = await apiRequest('POST', '/api/admin/course-videos', {
        ...data,
        courseId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/videos`] });
      setIsAddVideoDialogOpen(false);
      resetAddVideoForm();
      toast({
        title: 'Success',
        description: 'Course video added successfully',
      });
    },
    onError: (error) => {
      console.error('Error creating course video:', error);
      toast({
        title: 'Error',
        description: 'Failed to add course video',
        variant: 'destructive',
      });
    },
  });

  // Update course video mutation
  const updateVideoMutation = useMutation({
    mutationFn: async (data: CourseVideoFormValues & { id: number }) => {
      const { id, ...updateData } = data;
      const response = await apiRequest('PUT', `/api/admin/course-videos/${id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/videos`] });
      setIsEditVideoDialogOpen(false);
      setVideoToEdit(null);
      toast({
        title: 'Success',
        description: 'Course video updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating course video:', error);
      toast({
        title: 'Error',
        description: 'Failed to update course video',
        variant: 'destructive',
      });
    },
  });

  // Delete course video mutation
  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/course-videos/${videoId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/videos`] });
      toast({
        title: 'Success',
        description: 'Course video deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Error deleting course video:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete course video',
        variant: 'destructive',
      });
    },
  });

  // Handle add video form submission
  const onAddVideoSubmit = (values: CourseVideoFormValues) => {
    // Make sure we have either a YouTube URL or an uploaded file
    if (values.videoType === 'youtube' && !values.videoUrl) {
      toast({
        title: 'Missing YouTube URL',
        description: 'Please enter a YouTube video URL',
        variant: 'destructive',
      });
      return;
    }
    
    if (values.videoType === 'upload' && !values.videoFile) {
      toast({
        title: 'Missing video file',
        description: 'Please upload a video file',
        variant: 'destructive',
      });
      return;
    }
    
    // Clear the field that doesn't apply to the selected video type
    if (values.videoType === 'youtube') {
      values.videoFile = null;
    } else {
      values.videoUrl = null;
    }
    
    createVideoMutation.mutate(values);
  };

  // Handle edit video form submission
  const onEditVideoSubmit = (values: CourseVideoFormValues) => {
    if (!videoToEdit) return;
    
    // Make sure we have either a YouTube URL or an uploaded file
    if (values.videoType === 'youtube' && !values.videoUrl) {
      toast({
        title: 'Missing YouTube URL',
        description: 'Please enter a YouTube video URL',
        variant: 'destructive',
      });
      return;
    }
    
    if (values.videoType === 'upload' && !values.videoFile) {
      toast({
        title: 'Missing video file',
        description: 'Please upload a video file',
        variant: 'destructive',
      });
      return;
    }
    
    // Clear the field that doesn't apply to the selected video type
    if (values.videoType === 'youtube') {
      values.videoFile = null;
    } else {
      values.videoUrl = null;
    }
    
    updateVideoMutation.mutate({
      ...values,
      id: videoToEdit.id,
    });
  };

  // Handle video deletion
  const handleDeleteVideo = (video: CourseVideo) => {
    if (confirm(`Are you sure you want to delete the video "${video.title}"?`)) {
      deleteVideoMutation.mutate(video.id);
    }
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // Helper function to safely handle null/undefined values for form inputs
  const safeValue = (value: string | null | undefined): string => {
    return value || '';
  };

  // Get YouTube video ID from URL
  const getYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Course Videos</h2>
        <Button onClick={() => setIsAddVideoDialogOpen(true)}>Add Video</Button>
      </div>
      
      {videosLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : videos && videos.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>{video.title}</TableCell>
                    <TableCell>
                      {video.videoType === 'youtube' ? (
                        <span className="inline-flex items-center gap-1">
                          <Youtube className="h-4 w-4 text-red-500" />
                          YouTube
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Upload className="h-4 w-4 text-blue-500" />
                          Uploaded
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{video.duration || 'N/A'}</TableCell>
                    <TableCell>{video.order}</TableCell>
                    <TableCell>
                      {video.isPublished ? (
                        <span className="text-green-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-amber-600 font-medium">No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setupEditForm(video)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteVideo(video)}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No videos available</h3>
            <p className="text-muted-foreground mt-2">
              Add videos to this course to make it more engaging for students.
            </p>
            <Button onClick={() => setIsAddVideoDialogOpen(true)} className="mt-6">
              Add First Video
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Video Dialog */}
      <Dialog open={isAddVideoDialogOpen} onOpenChange={setIsAddVideoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Video to Course</DialogTitle>
          </DialogHeader>
          
          <Form {...addVideoForm}>
            <form onSubmit={addVideoForm.handleSubmit(onAddVideoSubmit)} className="space-y-4">
              <FormField
                control={addVideoForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter video title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addVideoForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Enter video description" 
                        rows={3}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addVideoForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (e.g., "15:30")</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 10:25" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addVideoForm.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={addVideoForm.control}
                name="videoType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select video type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="youtube">YouTube Video</SelectItem>
                        <SelectItem value="upload">Upload Video</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {addVideoForm.watch('videoType') === 'youtube' ? (
                <FormField
                  control={addVideoForm.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://www.youtube.com/watch?v=..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-4">
                  <FormItem>
                    <FormLabel>Upload Video</FormLabel>
                    <div className="border rounded-md p-4">
                      {uploadedFile ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{uploadedFile.originalName}</span>
                            <span className="text-sm text-muted-foreground">{formatFileSize(uploadedFile.size)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Play className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">Video uploaded successfully</span>
                          </div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full"
                            onClick={() => {
                              setUploadedFile(null);
                              addVideoForm.setValue('videoFile', '');
                            }}
                          >
                            Upload a different video
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-md bg-muted/50">
                            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground text-center">
                              Drag and drop your video file here, or click to browse
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              MP4, WebM, or OGG file. Maximum size 100MB.
                            </p>
                          </div>
                          
                          <div className="relative">
                            <Input
                              type="file"
                              accept="video/mp4,video/webm,video/ogg,video/quicktime"
                              className="absolute inset-0 opacity-0"
                              onChange={handleFileUpload}
                              disabled={isUploading}
                            />
                            <Button 
                              type="button" 
                              variant="secondary" 
                              className="w-full"
                              disabled={isUploading}
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Browse files
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </FormItem>
                </div>
              )}
              
              <Separator />
              
              <FormField
                control={addVideoForm.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Publish Video</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Make this video available to students
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddVideoDialogOpen(false);
                    resetAddVideoForm();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createVideoMutation.isPending || isUploading}
                >
                  {createVideoMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Add Video'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Video Dialog */}
      <Dialog open={isEditVideoDialogOpen} onOpenChange={setIsEditVideoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
          </DialogHeader>
          
          <Form {...editVideoForm}>
            <form onSubmit={editVideoForm.handleSubmit(onEditVideoSubmit)} className="space-y-4">
              <FormField
                control={editVideoForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter video title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editVideoForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter video description" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editVideoForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (e.g., "15:30")</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 10:25" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editVideoForm.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editVideoForm.control}
                name="videoType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select video type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="youtube">YouTube Video</SelectItem>
                        <SelectItem value="upload">Upload Video</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {editVideoForm.watch('videoType') === 'youtube' ? (
                <FormField
                  control={editVideoForm.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://www.youtube.com/watch?v=..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={editVideoForm.control}
                  name="videoFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Uploaded Video</FormLabel>
                      <FormControl>
                        <div className="border rounded-md p-4">
                          {field.value ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium truncate">{field.value}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Play className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-600">Video is ready</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center p-4 text-muted-foreground">
                              No video file uploaded
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <Separator />
              
              <FormField
                control={editVideoForm.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Publish Video</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Make this video available to students
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditVideoDialogOpen(false);
                    setVideoToEdit(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateVideoMutation.isPending}>
                  {updateVideoMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Update Video'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}