import { useState, useEffect } from 'react';
import { useSiteConfig } from '@/hooks/use-site-config';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash } from 'lucide-react';

export default function SiteConfigManagement() {
  const { config, isLoading } = useSiteConfig();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  // General site settings
  const [siteTitle, setSiteTitle] = useState('');
  
  // Hero section content
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroPrimaryBtn, setHeroPrimaryBtn] = useState('');
  const [heroPrimaryBtnUrl, setHeroPrimaryBtnUrl] = useState('');
  const [heroSecondaryBtn, setHeroSecondaryBtn] = useState('');
  const [heroSecondaryBtnUrl, setHeroSecondaryBtnUrl] = useState('');
  const [heroImage, setHeroImage] = useState('');
  
  // Navigation links
  const [navLinks, setNavLinks] = useState<Array<{ title: string; path: string }>>([]);
  
  useEffect(() => {
    if (config) {
      // Initialize site settings
      setSiteTitle(config.siteTitle || 'Maths Magic Town');
      
      // Initialize hero section
      const hero = config.hero || {};
      setHeroTitle(hero.title || 'Ace Your Math Competitive Exams');
      setHeroSubtitle(hero.subtitle || 'Personalized coaching, expert doubt resolution, and comprehensive practice tests for JEE, NEET, NDA, and more.');
      setHeroPrimaryBtn(hero.primaryButtonText || 'Explore Courses');
      setHeroPrimaryBtnUrl(hero.primaryButtonUrl || '#courses');
      setHeroSecondaryBtn(hero.secondaryButtonText || 'Try Free Demo');
      setHeroSecondaryBtnUrl(hero.secondaryButtonUrl || '#');
      setHeroImage(hero.backgroundImage || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80');
      
      // Initialize navigation links
      setNavLinks(config.navLinks || [
        { title: 'Home', path: '#home' },
        { title: 'Courses', path: '#courses' },
        { title: 'Doubt Classes', path: '#doubt-classes' },
        { title: 'Practice Tests', path: '#practice-tests' },
        { title: 'Success Stories', path: '#testimonials' },
        { title: 'Contact', path: '#contact' }
      ]);
    }
  }, [config]);
  
  const addNavLink = () => {
    setNavLinks([...navLinks, { title: '', path: '' }]);
  };
  
  const updateNavLink = (index: number, field: 'title' | 'path', value: string) => {
    const updatedLinks = [...navLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setNavLinks(updatedLinks);
  };
  
  const removeNavLink = (index: number) => {
    setNavLinks(navLinks.filter((_, i) => i !== index));
  };
  
  const saveGeneralSettings = async () => {
    setSaving(true);
    try {
      await apiRequest('PUT', `/api/admin/site-config/siteTitle`, {
        value: siteTitle
      });
      
      toast({
        title: 'Settings saved',
        description: 'General settings have been updated successfully.',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/site-config'] });
    } catch (error) {
      toast({
        title: 'Error saving settings',
        description: 'An error occurred while saving general settings.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  const saveHeroSettings = async () => {
    setSaving(true);
    try {
      const heroData = {
        title: heroTitle,
        subtitle: heroSubtitle,
        primaryButtonText: heroPrimaryBtn,
        primaryButtonUrl: heroPrimaryBtnUrl,
        secondaryButtonText: heroSecondaryBtn,
        secondaryButtonUrl: heroSecondaryBtnUrl,
        backgroundImage: heroImage
      };
      
      await apiRequest('PUT', `/api/admin/site-config/hero`, {
        value: heroData
      });
      
      toast({
        title: 'Hero settings saved',
        description: 'Hero section has been updated successfully.',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/site-config'] });
    } catch (error) {
      toast({
        title: 'Error saving hero settings',
        description: 'An error occurred while saving hero settings.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  const saveNavLinks = async () => {
    setSaving(true);
    try {
      await apiRequest('PUT', `/api/admin/site-config/navLinks`, {
        value: navLinks
      });
      
      toast({
        title: 'Navigation links saved',
        description: 'Navigation menu has been updated successfully.',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/site-config'] });
    } catch (error) {
      toast({
        title: 'Error saving navigation links',
        description: 'An error occurred while saving navigation links.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <AdminLayout title="Site Configuration">
      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="navigation">Navigation Menu</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic site settings like name and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-title">Site Title</Label>
                <Input 
                  id="site-title" 
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  placeholder="Site Title"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveGeneralSettings} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>Main banner content and appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hero-title">Title</Label>
                <Input 
                  id="hero-title" 
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Hero Title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hero-subtitle">Subtitle</Label>
                <Textarea 
                  id="hero-subtitle" 
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Hero Subtitle"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-btn-text">Primary Button Text</Label>
                  <Input 
                    id="primary-btn-text" 
                    value={heroPrimaryBtn}
                    onChange={(e) => setHeroPrimaryBtn(e.target.value)}
                    placeholder="Primary Button Text"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="primary-btn-url">Primary Button URL</Label>
                  <Input 
                    id="primary-btn-url" 
                    value={heroPrimaryBtnUrl}
                    onChange={(e) => setHeroPrimaryBtnUrl(e.target.value)}
                    placeholder="URL or anchor link"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="secondary-btn-text">Secondary Button Text</Label>
                  <Input 
                    id="secondary-btn-text" 
                    value={heroSecondaryBtn}
                    onChange={(e) => setHeroSecondaryBtn(e.target.value)}
                    placeholder="Secondary Button Text"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondary-btn-url">Secondary Button URL</Label>
                  <Input 
                    id="secondary-btn-url" 
                    value={heroSecondaryBtnUrl}
                    onChange={(e) => setHeroSecondaryBtnUrl(e.target.value)}
                    placeholder="URL or anchor link"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hero-image">Background Image URL</Label>
                <Input 
                  id="hero-image" 
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  placeholder="Image URL"
                />
                {heroImage && (
                  <div className="mt-2 rounded-md overflow-hidden w-full max-w-md">
                    <img src={heroImage} alt="Hero background preview" className="w-full h-auto" />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveHeroSettings} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Hero Section
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="navigation">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Menu</CardTitle>
              <CardDescription>Customize the site's main navigation links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {navLinks.map((link, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <Input
                      value={link.title}
                      onChange={(e) => updateNavLink(index, 'title', e.target.value)}
                      placeholder="Link Text"
                    />
                    <Input
                      value={link.path}
                      onChange={(e) => updateNavLink(index, 'path', e.target.value)}
                      placeholder="URL or Anchor (e.g. #courses)"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeNavLink(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button variant="outline" size="sm" className="mt-2" onClick={addNavLink}>
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </CardContent>
            <CardFooter>
              <Button onClick={saveNavLinks} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Navigation Menu
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}