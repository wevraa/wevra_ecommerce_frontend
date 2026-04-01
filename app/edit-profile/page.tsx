import EditProfilePageClient from "@/components/EditProfilePageClient";
import BottomNav from "@/components/BottomNav";
import { userProfile } from "@/data/dummy";

export default function EditProfilePage() {
  return (
    <>
      <EditProfilePageClient initialProfile={userProfile} />
      <BottomNav />
    </>
  );
}
