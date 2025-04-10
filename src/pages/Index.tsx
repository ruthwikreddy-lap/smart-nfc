
import UserDetailForm from "@/components/UserDetailForm";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Create Your Personalized Web Page
        </h1>
        <p className="text-xl text-white/80">
          Fill out the form below to generate a custom web page with a unique URL
        </p>
      </div>
      
      <UserDetailForm />
      
      <div className="text-white/60 text-sm mt-8">
        &copy; 2025 PageGenerator • Built with Lovable
      </div>
    </div>
  );
};

export default Index;
