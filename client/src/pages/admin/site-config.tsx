import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Trash2 } from "lucide-react";

// Schema for site configuration
const siteConfigSchema = z.object({
  siteName: z.string().min(3, "Site name must be at least 3 characters"),
  logoUrl: z.string().url("Must be a valid URL"),
  heroTitle: z.string().min(5, "Hero title must be at least 5 characters"),
  heroSubtitle: z.string().min(10, "Hero subtitle must be at least 10 characters"),
  heroImageUrl: z.string().url("Must be a valid URL"),
  heroButtonText: z.string().min(2, "Button text is required"),
  heroButtonUrl: z.string().min(1, "Button URL is required"),
});

// Schema for navigation item
const navItemSchema = z.object({
  label: z.string().min(1, "Label is required"),
  url: z.string().min(1, "URL is required"),
  order: z.coerce.number().min(1),
  isActive: z.boolean().default(true),
});

type SiteConfigValues = z.infer<typeof siteConfigSchema>;
type NavItemValues = z.infer<typeof navItemSchema>;

// Initial site config mock data
// In a real app, this would come from an API
const initialSiteConfig = {
  siteName: "Maths Magic Town",
  logoUrl: "https://placehold.co/200x80?text=Maths+Magic+Town",
  heroTitle: "Ace Your Math Competitive Exams",
  heroSubtitle: "Personalized coaching, expert doubt resolution, and comprehensive practice tests for JEE, NEET, NDA, and more.",
  heroImageUrl: "https://images.unsplash.com/photo-1503676382389-4809596d5290?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1744&q=80",
  heroButtonText: "Explore Courses",
  heroButtonUrl: "/courses",
};

// Initial navigation items mock data
const initialNavItems = [
  { id: 1, label: "Home", url: "/", order: 1, isActive: true },
  { id: 2, label: "Courses", url: "/courses", order: 2, isActive: true },
  { id: 3, label: "Doubt Classes", url: "/doubt-classes", order: 3, isActive: true },
  { id: 4, label: "Practice Tests", url: "/practice-tests", order: 4, isActive: true },
  { id: 5, label: "Success Stories", url: "/success-stories", order: 5, isActive: true },
  { id: 6, label: "Contact", url: "/contact", order: 6, isActive: true },
];

export default function SiteConfigManagement() {
  const { toast } = useToast();
  const [navItems, setNavItems] = useState<(NavItemValues & { id: number })[]>(initialNavItems);
  const [activeTab, setActiveTab] = useState<string>("general");
  const [isLoading, setIsLoading] = useState(false);

  // Form for site configuration
  const siteConfigForm = useForm<SiteConfigValues>({
    resolver: zodResolver(siteConfigSchema),
    defaultValues: initialSiteConfig,
  });

  // Form for navigation item
  const navItemForm = useForm<NavItemValues>({
    resolver: zodResolver(navItemSchema),
    defaultValues: {
      label: "",
      url: "",
      order: navItems.length + 1,
      isActive: true,
    },
  });

  // Mock mutation for site config (would connect to an API in a real app)
  const updateSiteConfigMutation = useMutation({
    mutationFn: async (data: SiteConfigValues) => {
      // This would be an API call in a real app
      console.log("Updating site config:", data);
      return { success: true, data };
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Site configuration updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update site configuration: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mock mutation for navigation items
  const updateNavItemsMutation = useMutation({
    mutationFn: async (data: (NavItemValues & { id: number })[]) => {
      // This would be an API call in a real app
      console.log("Updating nav items:", data);
      return { success: true, data };
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Navigation menu updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update navigation menu: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSaveSiteConfig = () => {
    siteConfigForm.handleSubmit((data) => {
      updateSiteConfigMutation.mutate(data);
    })();
  };

  const handleAddNavItem = () => {
    navItemForm.handleSubmit((data) => {
      const newItem = {
        ...data,
        id: Math.max(0, ...navItems.map(item => item.id)) + 1,
      };
      const updatedItems = [...navItems, newItem];
      setNavItems(updatedItems);
      updateNavItemsMutation.mutate(updatedItems);
      navItemForm.reset({
        label: "",
        url: "",
        order: updatedItems.length + 1,
        isActive: true,
      });
    })();
  };

  const handleDeleteNavItem = (id: number) => {
    if (window.confirm("Are you sure you want to delete this navigation item?")) {
      const updatedItems = navItems.filter(item => item.id !== id);
      setNavItems(updatedItems);
      updateNavItemsMutation.mutate(updatedItems);
    }
  };

  const handleUpdateNavItemOrder = (id: number, newOrder: number) => {
    if (newOrder < 1) return;
    
    const updatedItems = navItems.map(item => 
      item.id === id ? { ...item, order: newOrder } : item
    ).sort((a, b) => a.order - b.order);
    
    setNavItems(updatedItems);
  };

  const handleSaveNavItems = () => {
    updateNavItemsMutation.mutate(navItems);
  };

  return (
    <AdminLayout title="Site Configuration">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="navigation">Navigation Menu</TabsTrigger>
        </TabsList>
        
        {/* General Site Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Site Settings</CardTitle>
              <CardDescription>
                Configure the site name, logo, and other general settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    {...siteConfigForm.register("siteName")}
                  />
                  {siteConfigForm.formState.errors.siteName && (
                    <p className="text-sm text-red-500">{siteConfigForm.formState.errors.siteName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    {...siteConfigForm.register("logoUrl")}
                  />
                  {siteConfigForm.formState.errors.logoUrl && (
                    <p className="text-sm text-red-500">{siteConfigForm.formState.errors.logoUrl.message}</p>
                  )}
                </div>

                {siteConfigForm.watch("logoUrl") && (
                  <div className="mt-4 border rounded p-4 flex justify-center">
                    <img 
                      src={siteConfigForm.watch("logoUrl")} 
                      alt="Site Logo" 
                      className="max-h-20 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/200x60?text=Invalid+URL";
                      }}
                    />
                  </div>
                )}

                <Button 
                  type="button" 
                  onClick={handleSaveSiteConfig}
                  disabled={updateSiteConfigMutation.isPending}
                  className="mt-4"
                >
                  {updateSiteConfigMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Hero Section Settings */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section Settings</CardTitle>
              <CardDescription>
                Configure the home page hero section content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Hero Title</Label>
                  <Input
                    id="heroTitle"
                    {...siteConfigForm.register("heroTitle")}
                  />
                  {siteConfigForm.formState.errors.heroTitle && (
                    <p className="text-sm text-red-500">{siteConfigForm.formState.errors.heroTitle.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                  <Textarea
                    id="heroSubtitle"
                    rows={3}
                    {...siteConfigForm.register("heroSubtitle")}
                  />
                  {siteConfigForm.formState.errors.heroSubtitle && (
                    <p className="text-sm text-red-500">{siteConfigForm.formState.errors.heroSubtitle.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroImageUrl">Hero Image URL</Label>
                  <Input
                    id="heroImageUrl"
                    {...siteConfigForm.register("heroImageUrl")}
                  />
                  {siteConfigForm.formState.errors.heroImageUrl && (
                    <p className="text-sm text-red-500">{siteConfigForm.formState.errors.heroImageUrl.message}</p>
                  )}
                </div>

                {siteConfigForm.watch("heroImageUrl") && (
                  <div className="mt-4 border rounded p-4">
                    <img 
                      src={siteConfigForm.watch("heroImageUrl")} 
                      alt="Hero Background" 
                      className="w-full h-48 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/800x400?text=Invalid+URL";
                      }}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="heroButtonText">Button Text</Label>
                    <Input
                      id="heroButtonText"
                      {...siteConfigForm.register("heroButtonText")}
                    />
                    {siteConfigForm.formState.errors.heroButtonText && (
                      <p className="text-sm text-red-500">{siteConfigForm.formState.errors.heroButtonText.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="heroButtonUrl">Button URL</Label>
                    <Input
                      id="heroButtonUrl"
                      {...siteConfigForm.register("heroButtonUrl")}
                    />
                    {siteConfigForm.formState.errors.heroButtonUrl && (
                      <p className="text-sm text-red-500">{siteConfigForm.formState.errors.heroButtonUrl.message}</p>
                    )}
                  </div>
                </div>

                <Button 
                  type="button" 
                  onClick={handleSaveSiteConfig}
                  disabled={updateSiteConfigMutation.isPending}
                  className="mt-4"
                >
                  {updateSiteConfigMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Navigation Menu Settings */}
        <TabsContent value="navigation">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Menu Settings</CardTitle>
              <CardDescription>
                Configure the website navigation menu items.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Existing navigation items */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Current Menu Items</h3>
                  
                  <div className="border rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {navItems.sort((a, b) => a.order - b.order).map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <Input
                                type="number"
                                min="1"
                                value={item.order}
                                onChange={(e) => handleUpdateNavItemOrder(item.id, parseInt(e.target.value))}
                                className="w-16"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <Input
                                value={item.label}
                                onChange={(e) => {
                                  const updatedItems = navItems.map(navItem => 
                                    navItem.id === item.id ? { ...navItem, label: e.target.value } : navItem
                                  );
                                  setNavItems(updatedItems);
                                }}
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <Input
                                value={item.url}
                                onChange={(e) => {
                                  const updatedItems = navItems.map(navItem => 
                                    navItem.id === item.id ? { ...navItem, url: e.target.value } : navItem
                                  );
                                  setNavItems(updatedItems);
                                }}
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className={item.isActive ? "text-green-600" : "text-red-600"}>
                                {item.isActive ? "Active" : "Inactive"}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-destructive"
                                onClick={() => handleDeleteNavItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <Button 
                    type="button" 
                    onClick={handleSaveNavItems}
                    disabled={updateNavItemsMutation.isPending}
                  >
                    {updateNavItemsMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Navigation Menu"
                    )}
                  </Button>
                </div>

                {/* Add new navigation item */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-medium">Add New Menu Item</h3>
                  
                  <form className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="navLabel">Label</Label>
                      <Input
                        id="navLabel"
                        {...navItemForm.register("label")}
                      />
                      {navItemForm.formState.errors.label && (
                        <p className="text-sm text-red-500">{navItemForm.formState.errors.label.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="navUrl">URL</Label>
                      <Input
                        id="navUrl"
                        {...navItemForm.register("url")}
                      />
                      {navItemForm.formState.errors.url && (
                        <p className="text-sm text-red-500">{navItemForm.formState.errors.url.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="navOrder">Display Order</Label>
                      <Input
                        id="navOrder"
                        type="number"
                        min="1"
                        {...navItemForm.register("order", { valueAsNumber: true })}
                      />
                      {navItemForm.formState.errors.order && (
                        <p className="text-sm text-red-500">{navItemForm.formState.errors.order.message}</p>
                      )}
                    </div>
                  </form>
                  
                  <Button 
                    type="button" 
                    onClick={handleAddNavItem}
                    className="flex items-center"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Menu Item
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}