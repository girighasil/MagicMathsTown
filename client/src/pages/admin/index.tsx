import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Course, TestSeries, Testimonial, FAQ } from "@/types";

export default function AdminDashboard() {
  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: testSeries, isLoading: testSeriesLoading } = useQuery<TestSeries[]>({
    queryKey: ["/api/test-series"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: testimonials, isLoading: testimonialsLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: faqs, isLoading: faqsLoading } = useQuery<FAQ[]>({
    queryKey: ["/api/faqs"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const isLoading = coursesLoading || testSeriesLoading || testimonialsLoading || faqsLoading;

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courses?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Test Series</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{testSeries?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Testimonials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{testimonials?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{faqs?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Popular Courses</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses && courses.length > 0 ? (
            courses
              .filter(course => course.popular)
              .slice(0, 3)
              .map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {course.description}
                    </p>
                    <div className="flex justify-between text-sm mt-2">
                      <span>₹{course.discountPrice || course.price}</span>
                      <span>{course.duration}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <div className="col-span-3 py-8 text-center text-muted-foreground">
              No popular courses available
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}