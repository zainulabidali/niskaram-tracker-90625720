import AdminPanel from "@/components/AdminPanel";
import { Link } from "react-router-dom";

const Admin = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Link to="/" className="text-accent hover:underline text-sm">← തിരികെ പോകുക</Link>
        <AdminPanel />
      </div>
    </div>
  );
};

export default Admin;
