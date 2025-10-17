import Profile from '@/components/profile/profile-content';
import ProfileHeader from '@/components/profile/profile-header';

export default function ProfilePage() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-10">
      <ProfileHeader />
      <Profile />
    </div>
  );
}
