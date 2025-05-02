
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UploadCloud, Users, Key, FileSpreadsheet, Download, Plus } from "lucide-react";
import { generateAccessCode } from "@/lib/accessCodeUtils";
import { generateRandomPath } from "@/lib/utils";
import { UserData, AccessCodeData, PageData } from "@/lib/types";
import { downloadExcelTemplate, validateExcelData } from "@/utils/excelUtils";
import * as XLSX from 'xlsx';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [pages, setPages] = useState<PageData[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isAdmin && !loading) {
      navigate("/dashboard");
      toast.error("You don't have permission to access this page");
    } else if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, navigate, loading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users data from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, created_at');
      
      if (profileError) throw profileError;
      setUsers(profileData as UserData[] || []);
      
      // Fetch pages data
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('*');
      
      if (pageError) throw pageError;
      
      // Enhance page data with user email
      const enhancedPageData = await Promise.all((pageData || []).map(async (page) => {
        if (page.user_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', page.user_id)
            .single();
          
          return {
            ...page,
            user_email: profile?.email || 'Unknown'
          };
        }
        return page;
      }));
      
      setPages(enhancedPageData as PageData[]);
      
      // Fetch access codes
      const { data: codeData, error: codeError } = await supabase
        .from('access_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (codeError) throw codeError;
      setAccessCodes(codeData as AccessCodeData[] || []);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const generateNewAccessCode = async () => {
    setGeneratingCode(true);
    try {
      const newCode = generateAccessCode();
      
      const { error } = await supabase
        .from('access_codes')
        .insert({
          code: newCode,
          used: false
        });
      
      if (error) throw error;
      
      toast.success("New access code generated");
      fetchData();
    } catch (error) {
      console.error("Error generating access code:", error);
      toast.error("Failed to generate access code");
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setExcelFile(e.target.files[0]);
    }
  };

  const processExcelFile = async () => {
    if (!excelFile) {
      toast.error("Please select an Excel file");
      return;
    }
    
    setProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        // Validate the data
        const validation = validateExcelData(jsonData);
        if (!validation.valid) {
          toast.error(`Excel validation failed: ${validation.errors.join(', ')}`);
          setProcessing(false);
          return;
        }
        
        let successCount = 0;
        let errorCount = 0;

        for (const row of jsonData) {
          const randomPath = generateRandomPath(10);
          
          try {
            // Create page entry
            const { error: pageError } = await supabase
              .from('pages')
              .insert({
                path: randomPath,
                user_id: user?.id
              });
              
            if (pageError) throw pageError;
              
            // Create profile entry  
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: randomPath,
                name: row.name,
                title: row.title,
                bio: row.bio,
                email: row.email || null,
                twitter: row.twitter || null,
                linkedin: row.linkedin || null,
                github: row.github || null
              });
              
            if (profileError) throw profileError;
              
            successCount++;
          } catch (error) {
            console.error(`Error creating portfolio for ${row.name}:`, error);
            errorCount++;
          }
        }
        
        if (successCount > 0) {
          toast.success(`Successfully created ${successCount} portfolios`);
        }
        
        if (errorCount > 0) {
          toast.error(`Failed to create ${errorCount} portfolios`);
        }
        
        fetchData();
        setExcelFile(null);
      };
      
      reader.readAsArrayBuffer(excelFile);
    } catch (error) {
      console.error("Error processing Excel file:", error);
      toast.error("Failed to process Excel file");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#007BFF] border-t-transparent animate-spin mb-4"></div>
          <div className="text-xl text-white">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-start p-4 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold gradient-heading">Admin Dashboard</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate("/dashboard")} className="blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30">
              Regular Dashboard
            </Button>
            <Button variant="outline" onClick={() => fetchData()} className="blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30">
              Refresh Data
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="users" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white">
              <Users className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="pages" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white">
              <Key className="mr-2 h-4 w-4" />
              Portfolio Pages
            </TabsTrigger>
            <TabsTrigger value="codes" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white">
              <Key className="mr-2 h-4 w-4" />
              Access Codes
            </TabsTrigger>
            <TabsTrigger value="bulk" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Bulk Create
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="animate-fade-in">
            <Card className="border-[#007BFF]/20 bg-black/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold gradient-heading">Registered Users</CardTitle>
                <CardDescription>
                  View all users who have registered on the platform
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">No users found</TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-mono text-xs">{user.id}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pages" className="animate-fade-in">
            <Card className="border-[#007BFF]/20 bg-black/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold gradient-heading">Portfolio Pages</CardTitle>
                <CardDescription>
                  View all portfolio pages created on the platform
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Path</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No pages found</TableCell>
                      </TableRow>
                    ) : (
                      pages.map((page) => (
                        <TableRow key={page.id}>
                          <TableCell className="font-mono text-xs">{page.id}</TableCell>
                          <TableCell>{page.path}</TableCell>
                          <TableCell>{page.user_email || 'Unknown'}</TableCell>
                          <TableCell>{new Date(page.created_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" asChild className="blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30">
                              <a href={`/${page.path}`} target="_blank" rel="noopener noreferrer">
                                View
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="codes" className="animate-fade-in">
            <Card className="border-[#007BFF]/20 bg-black/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold gradient-heading">Access Codes</CardTitle>
                <CardDescription>
                  Manage access codes for the platform
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="mb-6">
                  <Button 
                    onClick={generateNewAccessCode} 
                    disabled={generatingCode}
                    className="bg-[#007BFF] hover:bg-[#0066cc]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Generate New Access Code
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessCodes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">No access codes found</TableCell>
                      </TableRow>
                    ) : (
                      accessCodes.map((code) => (
                        <TableRow key={code.id}>
                          <TableCell className="font-mono">{code.code}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${code.used ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                              {code.used ? 'Used' : 'Available'}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(code.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bulk" className="animate-fade-in">
            <Card className="border-[#007BFF]/20 bg-black/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold gradient-heading">Bulk Portfolio Creation</CardTitle>
                <CardDescription>
                  Upload an Excel file to generate multiple portfolio pages at once
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-[#007BFF]/30 rounded-lg p-8 text-center space-y-4">
                    <UploadCloud className="h-12 w-12 mx-auto text-[#007BFF]/70" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Upload Excel File</h3>
                      <p className="text-sm text-white/70">
                        Upload an Excel file with user profile data to generate multiple portfolios
                      </p>
                    </div>
                    <Input 
                      id="excel-upload" 
                      type="file" 
                      accept=".xlsx,.xls" 
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('excel-upload')?.click()}
                      className="blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30"
                    >
                      Select Excel File
                    </Button>
                  </div>
                  
                  {excelFile && (
                    <div className="bg-[#007BFF]/10 border border-[#007BFF]/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileSpreadsheet className="h-6 w-6 text-[#007BFF]" />
                          <div>
                            <p className="font-medium">{excelFile.name}</p>
                            <p className="text-sm text-white/70">{Math.round(excelFile.size / 1024)} KB</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setExcelFile(null)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={processExcelFile}
                    disabled={!excelFile || processing}
                    className="w-full bg-[#007BFF] hover:bg-[#0066cc]"
                  >
                    {processing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Process Excel & Create Portfolios
                      </>
                    )}
                  </Button>
                  
                  <div className="border border-[#007BFF]/30 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Excel Format Requirements</h4>
                    <p className="text-sm text-white/70 mb-4">
                      Your Excel file should contain the following columns:
                    </p>
                    <ul className="text-sm text-white/70 space-y-2 list-disc pl-5">
                      <li>name - Full name of the person (required)</li>
                      <li>title - Professional title (required)</li>
                      <li>bio - Biography/description (required)</li>
                      <li>email - Contact email (optional)</li>
                      <li>twitter - Twitter handle (optional)</li>
                      <li>linkedin - LinkedIn URL (optional)</li>
                      <li>github - GitHub URL (optional)</li>
                    </ul>
                    <Button 
                      variant="outline" 
                      className="mt-4 w-full blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30"
                      onClick={downloadExcelTemplate}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
