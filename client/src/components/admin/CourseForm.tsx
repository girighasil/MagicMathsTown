import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Course } from '@/types';
import { Badge } from '@/components/ui/badge';

type CourseFormProps = {
  course?: Course;
  onSubmit: (courseData: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

export function CourseForm({ course, onSubmit, onCancel, isSubmitting }: CourseFormProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [modules, setModules] = useState(0);
  const [price, setPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState<number | null | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [popular, setPopular] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Fetch all available exam categories
  const { data: config } = useQuery<Record<string, any>>({
    queryKey: ['/api/site-config'],
  });
  
  const examCategories = config?.examCategories || [];

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description);
      setDuration(course.duration);
      setModules(course.modules);
      setPrice(course.price);
      setDiscountPrice(course.discountPrice);
      setImageUrl(course.imageUrl);
      
      // Handle both the new categories array and backward compatibility with category string
      if (Array.isArray(course.categories)) {
        setSelectedCategories(course.categories);
      } else if (course.category) {
        setSelectedCategories([course.category]);
      } else {
        setSelectedCategories([]);
      }
      
      setPopular(course.popular);
      setIsLive(course.isLive);
    }
  }, [course]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !duration || modules <= 0 || price <= 0 || !imageUrl || selectedCategories.length === 0) {
      toast({
        title: 'Missing fields',
        description: 'Please fill all required fields including at least one category.',
        variant: 'destructive',
      });
      return;
    }
    
    const courseData = {
      title,
      description,
      duration,
      modules,
      price,
      discountPrice: discountPrice || null,
      imageUrl,
      categories: selectedCategories,
      popular,
      isLive,
    };
    
    onSubmit(courseData);
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const addNewCategory = () => {
    if (newCategory.trim() && !selectedCategories.includes(newCategory.trim())) {
      setSelectedCategories([...selectedCategories, newCategory.trim()]);
      setNewCategory('');
      setShowCategoryInput(false);
    }
  };

  const removeCategory = (category: string) => {
    setSelectedCategories(selectedCategories.filter(c => c !== category));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Course Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter course title"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="duration">Duration *</Label>
          <Input
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 6 weeks"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter course description"
          rows={4}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="modules">Number of Modules *</Label>
          <Input
            id="modules"
            type="number"
            value={modules}
            onChange={(e) => setModules(parseInt(e.target.value) || 0)}
            min={1}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹) *</Label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
            min={0}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="discountPrice">Discount Price (₹)</Label>
          <Input
            id="discountPrice"
            type="number"
            value={discountPrice || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : undefined;
              setDiscountPrice(value);
            }}
            min={0}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL *</Label>
        <Input
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          required
        />
        {imageUrl && (
          <div className="mt-2 h-40 w-full sm:w-60 rounded-md overflow-hidden">
            <img src={imageUrl} alt="Course preview" className="h-full w-full object-cover" />
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        <Label>Course Categories *</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedCategories.map((category) => (
            <Badge key={category} className="px-3 py-1.5 flex items-center gap-1">
              {category}
              <button 
                type="button" 
                onClick={() => removeCategory(category)}
                className="ml-1 text-xs rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {examCategories.map((category: string) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`category-${category}`} 
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  />
                  <Label 
                    htmlFor={`category-${category}`}
                    className="cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
            
            {showCategoryInput ? (
              <div className="mt-4 flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="new-category">Add Custom Category</Label>
                  <Input
                    id="new-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
                <Button 
                  type="button" 
                  onClick={addNewCategory}
                  disabled={!newCategory.trim()}
                  variant="outline"
                >
                  Add
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setShowCategoryInput(false)}
                  variant="ghost"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button 
                type="button" 
                onClick={() => setShowCategoryInput(true)}
                variant="outline"
                className="mt-4"
                size="sm"
              >
                Add Custom Category
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="popular" 
            checked={popular}
            onCheckedChange={(checked) => setPopular(checked === true)}
          />
          <Label htmlFor="popular">Mark as Popular</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="isLive" 
            checked={isLive}
            onCheckedChange={(checked) => setIsLive(checked === true)}
          />
          <Label htmlFor="isLive">Publish Course</Label>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {course ? 'Update Course' : 'Add Course'}
        </Button>
      </div>
    </form>
  );
}