import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart, Phone, User, IdCard, Hospital, AlertTriangle } from "lucide-react";

const emergencyCardSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  idCode: z.string().min(1, "ID code is required"),
  validityStatus: z.enum(["Valid", "Expired"]),
  preferredHospitals: z.string().min(1, "Preferred hospitals is required"),
  allergies: z.string().min(1, "Allergies field is required"),
  insuranceStatus: z.enum(["Valid", "Not Available"]),
  familyDoctor: z.string().min(1, "Family doctor is required"),
  bloodType: z.string().min(1, "Blood type is required"),
  currentMedication: z.string().min(1, "Current medication field is required"),
  emergencyNumber: z.string().min(1, "Emergency number is required"),
});

type EmergencyCardData = z.infer<typeof emergencyCardSchema>;

function generateRandomPath(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function EmergencyCardForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<EmergencyCardData>({
    resolver: zodResolver(emergencyCardSchema),
    defaultValues: {
      fullName: "",
      idCode: "",
      validityStatus: "Valid",
      preferredHospitals: "",
      allergies: "",
      insuranceStatus: "Valid",
      familyDoctor: "",
      bloodType: "",
      currentMedication: "",
      emergencyNumber: "",
    },
  });

  const onSubmit = async (data: EmergencyCardData) => {
    setIsSubmitting(true);
    try {
      const randomPath = generateRandomPath();
      
      const { error } = await supabase
        .from('emergency_cards')
        .insert({
          path: randomPath,
          full_name: data.fullName,
          id_code: data.idCode,
          validity_status: data.validityStatus,
          preferred_hospitals: data.preferredHospitals,
          allergies: data.allergies,
          insurance_status: data.insuranceStatus,
          family_doctor: data.familyDoctor,
          blood_type: data.bloodType,
          current_medication: data.currentMedication,
          emergency_number: data.emergencyNumber,
        });

      if (error) throw error;

      toast({
        title: "Emergency card created successfully!",
        description: `Your emergency card is available at: /card/${randomPath}`,
      });

      // Redirect to the generated card
      window.location.href = `/card/${randomPath}`;
    } catch (error) {
      console.error('Error creating emergency card:', error);
      toast({
        title: "Error",
        description: "Failed to create emergency card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-red-600">Emergency Card Generator</CardTitle>
          <p className="text-muted-foreground">Create your personalized emergency health card</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Ruthwik Reddy" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="idCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <IdCard className="h-4 w-4" />
                        ID Code
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 101f32j" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="validityStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Validity Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select validity status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Valid">Valid</SelectItem>
                          <SelectItem value="Expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="insuranceStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select insurance status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Valid">Valid</SelectItem>
                          <SelectItem value="Not Available">Not Available</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="preferredHospitals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Hospital className="h-4 w-4" />
                      Preferred Hospitals
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Apollo Hospitals" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bloodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., B+ve" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="familyDoctor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Family Doctor</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Dr. Ruthwik Reddy" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="emergencyNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Emergency Contact Number
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., +91 9989306597" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Allergies
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., NIL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentMedication"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Medication</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Nil" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Emergency Card...
                  </>
                ) : (
                  "Generate Emergency Card"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}