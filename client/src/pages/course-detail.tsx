import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Course, CourseVideo } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, FileVideo, Info, Layers, Play } from 'lucide-react';
import { NavigationIcons } from '@/components/common/NavigationIcons';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeVideo, setActiveVideo] = useState<CourseVideo | null>(null);

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
  });

  const { data: videos, isLoading: videosLoading } = useQuery<CourseVideo[]>({
    queryKey: [`/api/courses/${courseId}/videos`],
  });

  useEffect(() => {
    // Set the first video as active when videos are loaded
    if (videos && videos.length > 0 && !activeVideo) {
      setActiveVideo(videos[0]);
    }
  }, [videos, activeVideo]);

  if (courseLoading || !course) {
    return (
      <div className="container mx-auto p-6">
        <NavigationIcons previousPath="/courses" previousLabel="Back to Courses" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <NavigationIcons previousPath="/courses" previousLabel="Back to Courses" />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
        <p className="text-lg text-muted-foreground mt-2">{course.description}</p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">
            <Info className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="videos">
            <FileVideo className="h-4 w-4 mr-2" />
            Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">{course.duration}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Modules</p>
                    <p className="text-sm text-muted-foreground">{course.modules} modules</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">What You'll Learn</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 mt-0.5 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>Comprehensive coverage of all topics in the syllabus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 mt-0.5 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>Problem-solving techniques and shortcuts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 mt-0.5 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>Regular practice tests and doubt clearing sessions</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setActiveTab('videos')} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Start Learning
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {activeVideo ? (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    {activeVideo.videoType === 'youtube' && activeVideo.videoUrl ? (
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${getYouTubeId(activeVideo.videoUrl)}`}
                        title={activeVideo.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : activeVideo.videoType === 'upload' && activeVideo.videoFile ? (
                      <video
                        className="absolute inset-0 w-full h-full"
                        src={activeVideo.videoFile}
                        controls
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        No video available
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold">{activeVideo.title}</h3>
                    {activeVideo.description && (
                      <p className="text-muted-foreground mt-2">{activeVideo.description}</p>
                    )}
                    {activeVideo.duration && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{activeVideo.duration}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed">
                  <div className="text-center">
                    <FileVideo className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">No video selected</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Course Content</h3>
              {videosLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-[60px]" />
                  <Skeleton className="h-[60px]" />
                  <Skeleton className="h-[60px]" />
                </div>
              ) : videos && videos.length > 0 ? (
                <div className="space-y-2">
                  {videos.map((video) => (
                    <Card 
                      key={video.id} 
                      className={`cursor-pointer hover:bg-accent transition-colors ${
                        activeVideo?.id === video.id ? 'border-primary bg-accent/50' : ''
                      }`}
                      onClick={() => setActiveVideo(video)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {activeVideo?.id === video.id ? (
                              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                <Play className="h-4 w-4" />
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-accent-foreground/10 flex items-center justify-center text-accent-foreground">
                                <Play className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-1 flex-1 min-w-0">
                            <p className="font-medium truncate">{video.title}</p>
                            {video.duration && (
                              <p className="text-xs text-muted-foreground">{video.duration}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No videos available for this course
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper to extract YouTube video ID from a YouTube URL
function getYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Check component
function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// Clock component
function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}