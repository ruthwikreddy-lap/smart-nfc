
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const SuccessPage = () => {
  const { path } = useParams<{ path: string }>();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const fullUrl = `${window.location.origin}/${path}`;
  
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [copied]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast({
      title: "URL Copied!",
      description: "The link has been copied to your clipboard.",
    });
  };
  
  return (
    <Card className="w-full max-w-md animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
          Page Created Successfully!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground">
          Your page has been created and is available at the following URL:
        </p>
        
        <div className="flex items-center justify-between p-3 bg-secondary rounded-md">
          <code className="text-sm font-mono break-all">{fullUrl}</code>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCopy}
            aria-label="Copy URL"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-4">
        <Button asChild>
          <Link to={`/${path}`}>
            <Eye className="mr-2 h-4 w-4" />
            View My Page
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/">Create Another</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SuccessPage;
