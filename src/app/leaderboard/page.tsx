import Header from "../header";
import LeaderboardClient from "./LeaderboardClient";

export default function LeaderboardPage() {
  return (
    <div className="relative">
      <div className="sticky top-0 z-[8]">
        <Header />
      </div>
      <div className="relative w-full">
        <LeaderboardClient />
      </div>
    </div>
  );
}


