import HistoryTable from "@/components/HistoryTable";
import { Link } from "react-router-dom";

const History = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Link to="/" className="text-accent hover:underline text-sm">← തിരികെ പോകുക</Link>
        <HistoryTable />
      </div>
    </div>
  );
};

export default History;
