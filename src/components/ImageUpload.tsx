
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Upload, X, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
}

const ImageUpload = ({ onImageUploaded, currentImage }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setError(null);
    setUploading(true);
    
    try {
      // Create a preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('user-images')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-images')
        .getPublicUrl(filePath);
      
      // Call the callback with the new URL
      onImageUploaded(publicUrl);
      
      toast({
        title: "Image uploaded successfully",
        description: "Your profile image has been updated",
      });
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Error uploading image');
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: err.message || 'Error uploading image',
      });
    } finally {
      setUploading(false);
    }
  }, [onImageUploaded, toast]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });
  
  const removeImage = () => {
    setPreview(null);
    onImageUploaded('');
  };

  return (
    <div className="w-full space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {preview ? (
        <div className="relative w-full rounded-lg overflow-hidden border-2 border-dashed border-border hover:border-primary/50 transition-colors">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={removeImage} size="sm">
                <X className="mr-2 h-4 w-4" />
                Remove
              </Button>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Button variant="outline" size="sm" disabled={uploading}>
                  <Upload className="mr-2 h-4 w-4" />
                  Change
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <div className="bg-black/60 text-white text-xs p-1 rounded">
              <Check className="h-4 w-4 text-green-500" />
            </div>
          </div>
        </div>
      ) : (
        <div 
          {...getRootProps()} 
          className={`w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className={`h-12 w-12 mb-4 ${isDragActive ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
          <p className="text-center text-muted-foreground">
            {isDragActive ? (
              <span className="text-primary font-medium">Drop your image here</span>
            ) : (
              <>
                <span className="font-medium">Click to upload</span> or drag and drop
              </>
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            PNG, JPG, GIF up to 5MB
          </p>
          {uploading && (
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <div className="w-4 h-4 rounded-full border-2 border-t-primary border-r-primary border-b-transparent border-l-transparent animate-spin mr-2"></div>
              Uploading...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
