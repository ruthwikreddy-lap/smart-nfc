
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyAccessCode } from "@/lib/accessCodeUtils";
import { toast } from "sonner";

interface AccessCodeVerificationProps {
  onVerified: () => void;
}

const AccessCodeVerification = ({ onVerified }: AccessCodeVerificationProps) => {
  const [accessCode, setAccessCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (verifyAccessCode(accessCode)) {
      toast.success("Access code verified!");
      onVerified();
    } else {
      toast.error("Invalid access code. Please try again.");
    }

    setIsSubmitting(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Verify Access Code</CardTitle>
        <CardDescription>
          Please enter your access code to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accessCode">Access Code</Label>
            <Input
              id="accessCode"
              type="text"
              placeholder="Enter your access code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Verify Access Code"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AccessCodeVerification;
