import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Phone, Hospital, AlertTriangle, Heart, Shield, User, IdCard, Calendar, Pill } from "lucide-react";

interface EmergencyCardData {
  full_name: string;
  id_code: string;
  validity_status: string;
  preferred_hospitals: string;
  allergies: string;
  insurance_status: string;
  family_doctor: string;
  blood_type: string;
  current_medication: string;
  emergency_number: string;
  created_at: string;
}

interface EmergencyCardDisplayProps {
  data: EmergencyCardData;
  isOnline?: boolean;
}

export default function EmergencyCardDisplay({ data }: EmergencyCardDisplayProps) {
  const emergencyHotlines = [
    { service: "Police", number: "100" },
    { service: "Ambulance", number: "102" },
    { service: "Fire", number: "101" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Main Emergency Card */}
        <Card className="mb-6 border-2 border-red-200 dark:border-red-800 shadow-lg print:shadow-none">
          <CardHeader className="bg-red-600 text-white text-center">
            <div className="flex justify-center mb-2">
              <Heart className="h-12 w-12" />
            </div>
            <h1 className="text-3xl font-bold">EMERGENCY HEALTH CARD</h1>
            <p className="text-red-100">For Medical Emergencies Only</p>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Header Info */}
            <div className="text-center mb-6 pb-6 border-b-2 border-red-100">
              <h2 className="text-4xl font-bold text-red-700 mb-2">{data.full_name}</h2>
              <div className="flex justify-center items-center gap-4 mb-4">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <IdCard className="h-4 w-4 mr-2" />
                  ID: {data.id_code}
                </Badge>
                <Badge 
                  variant={data.validity_status === 'Valid' ? 'default' : 'destructive'}
                  className="text-lg px-4 py-2"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {data.validity_status}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-2">
                <Phone className="h-6 w-6" />
                {data.emergency_number}
              </div>
            </div>

            {/* Medical Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                  <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Blood Type
                  </h3>
                  <p className="text-2xl font-bold text-red-600">{data.blood_type}</p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
                  <h3 className="font-bold text-orange-700 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Allergies
                  </h3>
                  <p className="text-lg">{data.allergies}</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Insurance Status
                  </h3>
                  <Badge variant={data.insurance_status === 'Valid' ? 'default' : 'secondary'}>
                    {data.insurance_status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                  <h3 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                    <Hospital className="h-5 w-5" />
                    Preferred Hospital
                  </h3>
                  <p className="text-lg">{data.preferred_hospitals}</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                  <h3 className="font-bold text-purple-700 mb-2 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Family Doctor
                  </h3>
                  <p className="text-lg">{data.family_doctor}</p>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-lg">
                  <h3 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Current Medication
                  </h3>
                  <p className="text-lg">{data.current_medication}</p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Emergency Hotlines */}
            <div className="bg-red-600 text-white p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-center">Emergency Hotlines (India)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {emergencyHotlines.map((hotline) => (
                  <div key={hotline.service} className="text-center bg-red-700 p-4 rounded">
                    <div className="text-lg font-semibold">{hotline.service}</div>
                    <div className="text-3xl font-bold">{hotline.number}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 text-sm text-muted-foreground">
              <p>Generated on: {new Date(data.created_at).toLocaleDateString()}</p>
              <p className="font-semibold text-red-600 mt-2">
                ⚠️ This card contains critical medical information. Keep it accessible at all times.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Print Instructions */}
        <Card className="print:hidden">
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground mb-2">
              💡 <strong>Tip:</strong> Print this card and keep it in your wallet for emergencies.
            </p>
            <button 
              onClick={() => window.print()} 
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Print Emergency Card
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}