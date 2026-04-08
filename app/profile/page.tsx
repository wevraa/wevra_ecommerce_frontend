import ProfilePageHeader from "@/components/ProfilePageHeader";
import ProfileSection from "@/components/ProfileSection";
import BottomNav from "@/components/BottomNav";

export default function ProfilePage() {
  return (
    <>
      <ProfilePageHeader />
      <main className="main-with-bottom-nav">
        <ProfileSection />
      </main>
      <BottomNav />
    </>
  );
}
