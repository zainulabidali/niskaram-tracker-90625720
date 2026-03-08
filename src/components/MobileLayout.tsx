import { ReactNode } from "react";
import BottomNav from "./BottomNav";

const MobileLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <main className="pb-20 px-4 pt-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default MobileLayout;
