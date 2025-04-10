import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Loader2,
  Medal,
  BarChart3,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  CircleHelp,
  BookOpen,
  TrendingUp,
  BrainCircuit,
  Home,
  LogOut,
  UserCog,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditProfileForm } from "../components/EditProfileForm";

// Types for the TestAttempt
interface TestAttempt {
  id: number;
  userId: number;
  testId: number;
  startTime: string;
  endTime: string;
  score: string;
  totalMarks: number;
  isCompleted: boolean;
  timeTaken: number | null;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  percentage: string;
  createdAt: string;
  test: {
    id: number;
    title: string;
    description: string;
    testSeriesId: number;
    duration: number;
    totalMarks: number;
    passingMarks: number;
    negativeMarking: string;
  };
}

// Component for statistics cards
const StatCard = ({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}) => (
  <Card className="col-span-1">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
);

// Component for recent test card
const RecentTestCard = ({ attempt }: { attempt: TestAttempt }) => {
  const [, navigate] = useLocation();

  const isPassed =
    parseFloat(attempt.percentage) >=
    (attempt.test.passingMarks / attempt.test.totalMarks) * 100;

  const formattedDate = new Date(attempt.endTime).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Card className="overflow-hidden border hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-md font-semibold text-primary truncate">
            {attempt.test.title}
          </CardTitle>
          <Badge variant={isPassed ? "success" : "destructive"}>
            {isPassed ? "Passed" : "Failed"}
          </Badge>
        </div>
        <CardDescription>{formattedDate}</CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            Score: {attempt.score}/{attempt.totalMarks}
          </span>
          <span className="text-sm font-medium">{attempt.percentage}%</span>
        </div>
        <Progress
          value={parseFloat(attempt.percentage)}
          className="h-2"
          indicatorClassName={isPassed ? "bg-green-500" : "bg-red-500"}
        />
        <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
          <div className="flex flex-col items-center">
            <CheckCircle2 className="h-4 w-4 mb-1 text-green-500" />
            <span>{attempt.correctAnswers} Correct</span>
          </div>
          <div className="flex flex-col items-center">
            <XCircle className="h-4 w-4 mb-1 text-red-500" />
            <span>{attempt.incorrectAnswers} Wrong</span>
          </div>
          <div className="flex flex-col items-center">
            <CircleHelp className="h-4 w-4 mb-1 text-gray-400" />
            <span>{attempt.unanswered} Skipped</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="ghost"
          className="w-full text-primary"
          onClick={() => navigate(`/test-report/${attempt.id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function StudentDashboard() {
  const { user, isLoading: isAuthLoading, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  // Fetch all test attempts for this user
  const { data: testAttempts, isLoading: isAttemptsLoading } = useQuery<
    TestAttempt[]
  >({
    queryKey: ["/api/users/test-attempts"],
    enabled: !!user,
  });

  // Calculate overall stats
  const totalTests = testAttempts?.length || 0;
  const completedTests = testAttempts?.filter((a) => a.isCompleted).length || 0;

  const averageScore =
    testAttempts && testAttempts.length > 0
      ? (
          testAttempts.reduce(
            (sum, attempt) => sum + parseFloat(attempt.percentage),
            0,
          ) / testAttempts.length
        ).toFixed(1)
      : "0";

  const passedTests =
    testAttempts?.filter(
      (attempt) =>
        parseFloat(attempt.percentage) >=
        (attempt.test.passingMarks / attempt.test.totalMarks) * 100,
    ).length || 0;

  const passRate =
    totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(0) : "0";

  // Get recent attempts
  const recentAttempts = testAttempts
    ? [...testAttempts]
        .sort(
          (a, b) =>
            new Date(b.endTime).getTime() - new Date(a.endTime).getTime(),
        )
        .slice(0, 4)
    : [];

  // Top subjects/categories
  // In a real application, we would calculate this from the test data
  // For now, we'll just show placeholder data
  const topSubjects = [
    { name: "Algebra", progress: 85 },
    { name: "Calculus", progress: 72 },
    { name: "Trigonometry", progress: 65 },
    { name: "Geometry", progress: 58 },
  ];

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Loading state
  if (isAuthLoading || isAttemptsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // No authentication
  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-12 w-12 rounded-full"
              >
                <Avatar className="h-11 w-11 border-2 border-primary">
                  <AvatarFallback className="text-lg font-semibold">
                    {user.fullName
                      ? user.fullName.charAt(0)
                      : user.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.fullName || user.username}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() =>
                    document
                      .getElementById("edit-profile-dialog-trigger")
                      ?.click()
                  }
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/")}>
                  <Home className="mr-2 h-4 w-4" />
                  <span>Homepage</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {user.fullName || user.username}'s Dashboard
            </h1>
            <p className="text-muted-foreground">Track your performance</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate("/test-series")}
          >
            <BookOpen className="h-4 w-4" />
            Test Series
          </Button>
        </div>
      </div>

      <Dialog>
        <DialogTrigger id="edit-profile-dialog-trigger" className="hidden" />
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center my-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarFallback className="text-xl font-semibold">
                {user.fullName
                  ? user.fullName.charAt(0)
                  : user.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <EditProfileForm />
        </DialogContent>
      </Dialog>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Tests Completed"
          value={completedTests}
          icon={<CheckCircle2 className="h-4 w-4 text-primary" />}
          description={`out of ${totalTests} available tests`}
        />
        <StatCard
          title="Average Score"
          value={`${averageScore}%`}
          icon={<BarChart3 className="h-4 w-4 text-primary" />}
        />
        <StatCard
          title="Pass Rate"
          value={`${passRate}%`}
          icon={<Medal className="h-4 w-4 text-primary" />}
          description={`${passedTests} tests passed`}
        />
        <StatCard
          title="Last Activity"
          value={
            recentAttempts.length > 0
              ? new Date(recentAttempts[0].endTime).toLocaleDateString()
              : "N/A"
          }
          icon={<Calendar className="h-4 w-4 text-primary" />}
        />
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                  Recent Test Activity
                </h2>

                {recentAttempts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentAttempts.map((attempt) => (
                      <RecentTestCard key={attempt.id} attempt={attempt} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-muted-foreground">
                      You haven't attempted any tests yet.
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => navigate("/test-series")}
                    >
                      Browse Available Tests
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Subject Progress */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border p-6 h-full">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <BrainCircuit className="mr-2 h-5 w-5 text-primary" />
                  Subject Mastery
                </h2>
                <div className="space-y-4">
                  {topSubjects.map((subject) => (
                    <div key={subject.name}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                          {subject.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {subject.progress}%
                        </span>
                      </div>
                      <Progress value={subject.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">Performance Analysis</h2>
            {testAttempts && testAttempts.length > 0 ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Overall Performance</h3>
                  <div className="bg-secondary/20 p-4 rounded-md">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {averageScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Average Score
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {passRate}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Pass Rate
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {completedTests}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Tests Completed
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {passedTests}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Tests Passed
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Test History</h3>
                  <div className="rounded-md border overflow-hidden">
                    <div className="bg-secondary/20 p-3 text-sm font-medium grid grid-cols-12 gap-2">
                      <div className="col-span-4">Test Name</div>
                      <div className="col-span-2 text-center">Score</div>
                      <div className="col-span-2 text-center">Percentage</div>
                      <div className="col-span-2 text-center">Result</div>
                      <div className="col-span-2 text-center">Date</div>
                    </div>
                    <div className="divide-y">
                      {testAttempts
                        .sort(
                          (a, b) =>
                            new Date(b.endTime).getTime() -
                            new Date(a.endTime).getTime(),
                        )
                        .map((attempt) => {
                          const isPassed =
                            parseFloat(attempt.percentage) >=
                            (attempt.test.passingMarks /
                              attempt.test.totalMarks) *
                              100;
                          return (
                            <div
                              key={attempt.id}
                              className="p-3 text-sm grid grid-cols-12 gap-2 hover:bg-secondary/5 cursor-pointer"
                              onClick={() =>
                                navigate(`/test-report/${attempt.id}`)
                              }
                            >
                              <div className="col-span-4 font-medium text-gray-800">
                                {attempt.test.title}
                              </div>
                              <div className="col-span-2 text-center">
                                {attempt.score}/{attempt.totalMarks}
                              </div>
                              <div className="col-span-2 text-center">
                                {attempt.percentage}%
                              </div>
                              <div className="col-span-2 text-center">
                                <Badge
                                  variant={isPassed ? "success" : "destructive"}
                                >
                                  {isPassed ? "Passed" : "Failed"}
                                </Badge>
                              </div>
                              <div className="col-span-2 text-center text-gray-500">
                                {new Date(attempt.endTime).toLocaleDateString()}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-muted-foreground">
                  No test data available yet.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Complete some tests to see your performance analysis.
                </p>
                <Button onClick={() => navigate("/test-series")}>
                  Take a Test
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
            {testAttempts && testAttempts.length > 0 ? (
              <div className="space-y-4">
                {testAttempts
                  .sort(
                    (a, b) =>
                      new Date(b.endTime).getTime() -
                      new Date(a.endTime).getTime(),
                  )
                  .map((attempt) => {
                    const date = new Date(attempt.endTime);
                    const formattedDate = date.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                    const formattedTime = date.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    const isPassed =
                      parseFloat(attempt.percentage) >=
                      (attempt.test.passingMarks / attempt.test.totalMarks) *
                        100;

                    return (
                      <div
                        key={attempt.id}
                        className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/test-report/${attempt.id}`)}
                      >
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${isPassed ? "bg-green-100" : "bg-red-100"}`}
                        >
                          {isPassed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">
                            Completed {attempt.test.title}
                            <Badge
                              variant={isPassed ? "success" : "destructive"}
                              className="ml-2"
                            >
                              {isPassed ? "Passed" : "Failed"}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            Score: {attempt.score}/{attempt.totalMarks} (
                            {attempt.percentage}%)
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {formattedDate}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formattedTime}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-muted-foreground">No activity found.</p>
                <p className="text-sm text-gray-500 mb-4">
                  Start taking tests to record your activity.
                </p>
                <Button onClick={() => navigate("/test-series")}>
                  Take a Test
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
