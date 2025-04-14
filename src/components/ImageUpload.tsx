
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Upload, X, Check, AlertCircle, Image as ImageIcon } from "lucide-react";
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
  
  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    multiple: false
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
        <div className="relative w-full rounded-xl overflow-hidden border border-white/10 hover:border-[#007BFF]/50 transition-colors group">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <Button variant="outline" onClick={removeImage} size="sm" className="border-white/20 text-white hover:bg-white/10">
              <X className="mr-2 h-4 w-4" />
              Remove
            </Button>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <Button variant="outline" size="sm" disabled={uploading} className="border-white/20 text-white hover:bg-white/10">
                <Upload className="mr-2 h-4 w-4" />
                Change
              </Button>
            </div>
          </div>
          <div className="absolute top-3 right-3">
            <div className="bg-black/60 text-white text-xs p-1 rounded-full">
              <Check className="h-4 w-4 text-green-500" />
            </div>
          </div>
        </div>
      ) : (
        <div 
          {...getRootProps()} 
          className={`w-full h-64 border rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-300 ${
            isDragActive ? 'scale-[1.02] shadow-lg' : ''
          } ${
            isDragAccept ? 'border-[#007BFF] bg-[#007BFF]/10' : 
            isDragReject ? 'border-red-500 bg-red-500/10' : 
            'border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10'
          }`}
        >
          <input {...getInputProps()} />
          
          <div className={`mb-4 rounded-full p-4 ${
            isDragActive ? 'bg-[#007BFF]/20' : 'bg-white/5'
          }`}>
            {isDragReject ? (
              <X className="h-10 w-10 text-red-500" />
            ) : isDragActive ? (
              <Upload className="h-10 w-10 text-[#007BFF] animate-pulse" />
            ) : (
              <ImageIcon className="h-10 w-10 text-white/60" />
            )}
          </div>
          
          <div className="text-center space-y-2">
            <p className="font-medium text-white">
              {isDragReject ? (
                "Unsupported file format"
              ) : isDragActive ? (
                "Drop your image here"
              ) : (
                <span>
                  <span className="text-[#007BFF]">Click to upload</span> or drag and drop
                </span>
              )}
            </p>
            <p className="text-xs text-white/50">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
          
          {uploading && (
            <div className="mt-6 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-t-[#007BFF] border-r-[#007BFF] border-b-transparent border-l-transparent animate-spin mr-3"></div>
              <span className="text-sm text-white/70">Uploading...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
