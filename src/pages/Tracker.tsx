import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PrayerTracker from "@/components/PrayerTracker";

const Tracker = () => {
  const [, setRefresh] = useState(0);

  return (
    <MobileLayout>
      <div className="space-y-4">
        <h2 className="text-xl font-display font-bold text-foreground text-center pt-2">
          📿 നമസ്കാരം രേഖപ്പെടുത്തുക
        </h2>
        <PrayerTracker onSubmit={() => setRefresh(k => k + 1)} />
      </div>
    </MobileLayout>
  );
};

export default Tracker;
