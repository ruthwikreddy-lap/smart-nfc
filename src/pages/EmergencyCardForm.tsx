import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Loader2, Heart, Phone, User, IdCard, Hospital, AlertTriangle, ArrowLeft, Shield, Upload } from "lucide-react";

const emergencyCardSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  idCode: z.string().min(3, "ID code must be at least 3 characters"),
  validityStatus: z.enum(["Valid", "Expired"]),
  preferredHospitals: z.string().min(3, "Preferred hospitals is required"),
  allergies: z.string().min(1, "Allergies field is required (use 'None' if no allergies)"),
  insuranceStatus: z.enum(["Valid", "Not Available"]),
  familyDoctor: z.string().min(2, "Family doctor name is required"),
  bloodType: z.string().min(1, "Blood type is required"),
  currentMedication: z.string().min(1, "Current medication field is required (use 'None' if no medication)"),
  emergencyNumber: z.string().min(10, "Emergency number must be at least 10 digits"),
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

// Store emergency card data locally for cross-device access
const storeEmergencyCardLocally = (path: string, data: any) => {
  try {
    const emergencyData = {
      ...data,
      path,
      created_at: new Date().toISOString(),
      deviceId: localStorage.getItem('device-id') || 'unknown',
      syncVersion: Date.now()
    };
    
    // Store in both localStorage and sessionStorage
    localStorage.setItem(`emergency-card-${path}`, JSON.stringify(emergencyData));
    sessionStorage.setItem(`emergency-card-${path}`, JSON.stringify(emergencyData));
    
    // Also store in emergency cards index
    const allCards = JSON.parse(localStorage.getItem('all-emergency-cards') || '[]');
    if (!allCards.includes(path)) {
      allCards.push(path);
      localStorage.setItem('all-emergency-cards', JSON.stringify(allCards));
      sessionStorage.setItem('all-emergency-cards', JSON.stringify(allCards));
    }
    
    return true;
  } catch (error) {
    console.error('Error storing emergency card locally:', error);
    return false;
  }
};

export default function EmergencyCardForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  // Auto-save progress
  useEffect(() => {
    const subscription = form.watch((values) => {
      const filledFields = Object.values(values).filter(Boolean).length;
      const totalFields = Object.keys(values).length;
      setProgress((filledFields / totalFields) * 100);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: EmergencyCardData) => {
    setIsSubmitting(true);
    try {
      const randomPath = generateRandomPath();
      
      // Store locally first for immediate access
      storeEmergencyCardLocally(randomPath, data);
      
      // Then try to store in Supabase for cross-device sync
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

      if (error) {
        console.warn('Could not sync to cloud, but stored locally:', error);
        toast({
          title: "Emergency card created locally!",
          description: "Your card is available but may not sync across devices until you're online.",
        });
      } else {
        toast({
          title: "Emergency card created successfully!",
          description: "Your card is now available across all devices.",
        });
      }

      // Navigate to the generated card
      navigate(`/card/${randomPath}`);
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-950/20 dark:via-black dark:to-red-950/20">
      {/* Navigation */}
      <div className="container mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>

      <div className="container mx-auto px-4 pb-8 max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-red-600 dark:text-red-400">Form Progress</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl shadow-lg">
                <Heart className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Emergency Health Card
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 text-lg mt-2">
              Create your personalized emergency health card for instant access during critical situations
            </p>
            
            {/* Security Notice */}
            <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                Secure • Cross-device synced • Always accessible
              </span>
            </div>
          </CardHeader>
          
          <CardContent className="px-6 pb-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Personal Information Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-red-600 dark:text-red-400" />
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <User className="h-4 w-4" />
                            Full Name *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Ruthwik Reddy" 
                              className="h-12 border-gray-300 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400" 
                              {...field} 
                            />
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
                          <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <IdCard className="h-4 w-4" />
                            ID Code *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 101f32j" 
                              className="h-12 border-gray-300 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="validityStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">Validity Status *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 border-gray-300 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400">
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
                          <FormLabel className="text-gray-700 dark:text-gray-300">Insurance Status *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 border-gray-300 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400">
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
                </div>

                {/* Medical Information Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                    Medical Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="bloodType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">Blood Type *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., B+, O-, AB+" 
                              className="h-12 border-gray-300 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400" 
                              {...field} 
                            />
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
                          <FormLabel className="text-gray-700 dark:text-gray-300">Family Doctor *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Dr. Ruthwik Reddy" 
                              className="h-12 border-gray-300 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400" 
                              {...field} 
                            />
                          </FormControl>
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
                        <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Hospital className="h-4 w-4" />
                          Preferred Hospitals *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Apollo Hospitals, City Medical Center" 
                            className="h-12 border-gray-300 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400" 
                            {...field} 
                          />
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
                        <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <AlertTriangle className="h-4 w-4" />
                          Allergies *
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List all allergies (food, medication, environmental). Write 'None' if no known allergies." 
                            className="min-h-[100px] border-gray-300 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400" 
                            {...field} 
                          />
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
                        <FormLabel className="text-gray-700 dark:text-gray-300">Current Medication *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List all current medications with dosages. Write 'None' if no current medications." 
                            className="min-h-[100px] border-gray-300 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Emergency Contact Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Phone className="h-5 w-5 text-red-600 dark:text-red-400" />
                    Emergency Contact
                  </h3>

                  <FormField
                    control={form.control}
                    name="emergencyNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Phone className="h-4 w-4" />
                          Emergency Contact Number *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., +91 9989306597" 
                            className="h-12 border-gray-300 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Creating Your Emergency Card...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-3 h-5 w-5" />
                      Generate Emergency Card
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}