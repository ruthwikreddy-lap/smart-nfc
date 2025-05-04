
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
import { UploadCloud, Users, Key, FileSpreadsheet, Download, Plus, Edit, Trash2, Eye } from "lucide-react";
import { generateAccessCode } from "@/lib/accessCodeUtils";
import { generateRandomPath } from "@/lib/utils";
import { UserData, AccessCodeData, PageData, ExcelPortfolioData } from "@/lib/types";
import { downloadExcelTemplate, validateExcelData } from "@/utils/excelUtils";
import * as XLSX from 'xlsx';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  bio: z.string().min(1, "Bio is required"),
  email: z.string().email("Invalid email").nullable().optional(),
  twitter: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  github: z.string().nullable().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

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
  const [accessCodesError, setAccessCodesError] = useState(false);
  const [accessCodesErrorMessage, setAccessCodesErrorMessage] = useState<string>('');
  const [usersLoading, setUsersLoading] = useState(true);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [accessCodesLoading, setAccessCodesLoading] = useState(true);
  
  // State for dialogs
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewProfileData, setViewProfileData] = useState<any>(null);

  // Form for editing profile
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      title: "",
      bio: "",
      email: "",
      twitter: "",
      linkedin: "",
      github: "",
    }
  });

  useEffect(() => {
    if (!isAdmin && !loading) {
      navigate("/dashboard");
      toast.error("You don't have permission to access this page");
    } else if (isAdmin) {
      fetchUsers();
      fetchPages();
      fetchAccessCodes();
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    // Check all data loading states to determine overall loading state
    setLoading(usersLoading || pagesLoading);
  }, [usersLoading, pagesLoading]);

  useEffect(() => {
    // Reset form with current profile data when editing
    if (currentProfile && editDialogOpen) {
      form.reset({
        name: currentProfile.name || "",
        title: currentProfile.title || "",
        bio: currentProfile.bio || "",
        email: currentProfile.email || "",
        twitter: currentProfile.twitter || "",
        linkedin: currentProfile.linkedin || "",
        github: currentProfile.github || "",
      });
    }
  }, [currentProfile, editDialogOpen, form]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profileError) {
        console.error("Error fetching profiles:", profileError);
        toast.error("Failed to load user profiles");
        return;
      }
      
      console.log("Profile data fetched:", profileData);
      setUsers(profileData as UserData[] || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load user data");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchPages = async () => {
    setPagesLoading(true);
    try {
      // Fetch pages data
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('*');
      
      if (pageError) {
        console.error("Error fetching pages:", pageError);
        toast.error("Failed to load pages data");
        return;
      }
      
      console.log("Page data fetched:", pageData);
      
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
    } catch (error) {
      console.error("Error fetching pages:", error);
      toast.error("Failed to load pages data");
    } finally {
      setPagesLoading(false);
    }
  };
  
  const fetchAccessCodes = async () => {
    setAccessCodesLoading(true);
    try {
      setAccessCodesError(false);
      setAccessCodesErrorMessage('');
      
      const { data: codeData, error: codeError } = await supabase
        .from('access_codes')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (codeError) {
        console.error("Error fetching access codes:", codeError);
        setAccessCodesError(true);
        setAccessCodesErrorMessage(codeError.message || 'Permission denied for access codes');
      } else {
        console.log("Access code data fetched:", codeData);
        setAccessCodes(codeData as AccessCodeData[] || []);
      }
    } catch (codeError: any) {
      console.error("Exception fetching access codes:", codeError);
      setAccessCodesError(true);
      setAccessCodesErrorMessage(codeError.message || 'Unknown error fetching access codes');
    } finally {
      setAccessCodesLoading(false);
    }
  };

  const handleEditProfile = async (values: ProfileFormValues) => {
    if (!currentProfileId) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: values.name,
          title: values.title,
          bio: values.bio,
          email: values.email,
          twitter: values.twitter || null,
          linkedin: values.linkedin || null,
          github: values.github || null
        })
        .eq('id', currentProfileId);
        
      if (error) throw error;
      
      toast.success("Profile updated successfully");
      setEditDialogOpen(false);
      fetchUsers(); // Refresh data
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleDeleteProfile = async () => {
    if (!currentProfileId) return;
    
    try {
      // First delete associated page
      const { error: pageError } = await supabase
        .from('pages')
        .delete()
        .eq('path', currentProfileId);
        
      if (pageError) throw pageError;
      
      // Then delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', currentProfileId);
        
      if (profileError) throw profileError;
      
      toast.success("Profile deleted successfully");
      setDeleteDialogOpen(false);
      fetchUsers(); // Refresh users data
      fetchPages(); // Refresh pages data
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast.error("Failed to delete profile");
    }
  };

  const viewProfile = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();
        
      if (error) throw error;
      
      setViewProfileData(data);
      setViewDialogOpen(true);
    } catch (error) {
      console.error("Error fetching profile details:", error);
      toast.error("Failed to load profile details");
    }
  };

  const openEditDialog = async (profileId: string) => {
    setCurrentProfileId(profileId);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();
        
      if (error) throw error;
      
      setCurrentProfile(data);
      setEditDialogOpen(true);
    } catch (error) {
      console.error("Error fetching profile for editing:", error);
      toast.error("Failed to load profile data");
    }
  };

  const openDeleteDialog = (profileId: string) => {
    setCurrentProfileId(profileId);
    setDeleteDialogOpen(true);
  };

  const generateNewAccessCode = async () => {
    if (accessCodesError) {
      toast.error("You don't have permission to manage access codes");
      return;
    }
    
    setGeneratingCode(true);
    try {
      const newCode = generateAccessCode();
      
      const { error } = await supabase
        .from('access_codes')
        .insert({
          code: newCode,
          used: false
        });
      
      if (error) {
        console.error("Error inserting access code:", error);
        throw error;
      }
      
      toast.success("New access code generated");
      fetchAccessCodes();
    } catch (error) {
      console.error("Error generating access code:", error);
      toast.error("Failed to generate access code");
      setAccessCodesError(true);
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

        // Type assertion to ensure TypeScript knows the structure of the data
        for (const row of jsonData as ExcelPortfolioData[]) {
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
        
        fetchUsers();
        fetchPages();
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
            <Button 
              variant="outline" 
              onClick={() => {
                fetchUsers();
                fetchPages();
                fetchAccessCodes();
              }} 
              className="blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30"
            >
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
                {usersLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="w-8 h-8 rounded-full border-2 border-[#007BFF] border-t-transparent animate-spin"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">No users found</TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-mono text-xs truncate max-w-[100px]" title={user.id}>{user.id}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.name || 'Not set'}</TableCell>
                            <TableCell>{user.title || 'Not set'}</TableCell>
                            <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => viewProfile(user.id)} 
                                  className="blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => openEditDialog(user.id)} 
                                  className="blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => openDeleteDialog(user.id)} 
                                  className="text-red-500 hover:bg-red-500/10 border-red-500/30"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
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
                {pagesLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="w-8 h-8 rounded-full border-2 border-[#007BFF] border-t-transparent animate-spin"></div>
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="codes" className="animate-fade-in">
            <Card className="border-[#007BFF]/20 bg-black/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold gradient-heading">Access Codes</CardTitle>
                <CardDescription>
                  {accessCodesError 
                    ? "You don't have permission to manage access codes" 
                    : "Manage access codes for the platform"}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="mb-6">
                  <Button 
                    onClick={generateNewAccessCode} 
                    disabled={generatingCode || accessCodesError}
                    className={accessCodesError ? "bg-gray-500 cursor-not-allowed" : "bg-[#007BFF] hover:bg-[#0066cc]"}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Generate New Access Code
                  </Button>
                </div>
                
                {accessCodesLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="w-8 h-8 rounded-full border-2 border-[#007BFF] border-t-transparent animate-spin"></div>
                  </div>
                ) : accessCodesError ? (
                  <div className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p>You don't have permission to view or manage access codes.</p>
                    <p className="mt-2 text-sm text-gray-400">Error: {accessCodesErrorMessage}</p>
                    <p className="mt-2 text-sm text-gray-400">Please contact your database administrator for assistance.</p>
                  </div>
                ) : (
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
                )}
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

      {/* View Profile Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="gradient-heading">Profile Details</DialogTitle>
            <DialogDescription>
              Viewing complete profile information
            </DialogDescription>
          </DialogHeader>
          
          {viewProfileData && (
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-400">Name</h4>
                <p>{viewProfileData.name || 'Not set'}</p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-400">Title</h4>
                <p>{viewProfileData.title || 'Not set'}</p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-400">Bio</h4>
                <p className="whitespace-pre-line">{viewProfileData.bio || 'Not set'}</p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-400">Email</h4>
                <p>{viewProfileData.email || 'Not set'}</p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-400">Social Links</h4>
                <div className="space-y-1">
                  <p>Twitter: {viewProfileData.twitter || 'Not set'}</p>
                  <p>LinkedIn: {viewProfileData.linkedin || 'Not set'}</p>
                  <p>GitHub: {viewProfileData.github || 'Not set'}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            {currentProfileId && (
              <Button onClick={() => {
                setViewDialogOpen(false);
                openEditDialog(currentProfileId);
              }} className="bg-[#007BFF] hover:bg-[#0066cc]">
                Edit Profile
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="gradient-heading">Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to the profile information
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditProfile)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Professional title" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Input placeholder="Biography" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email address" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter</FormLabel>
                    <FormControl>
                      <Input placeholder="Twitter handle" {...field} value={field.value || ''} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input placeholder="LinkedIn URL" {...field} value={field.value || ''} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub</FormLabel>
                    <FormControl>
                      <Input placeholder="GitHub URL" {...field} value={field.value || ''} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#007BFF] hover:bg-[#0066cc]">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the profile
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProfile}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
