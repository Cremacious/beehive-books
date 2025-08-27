import ImageUpload from '@/components/settings/image-upload';
import { getAuthenticatedUser } from '@/lib/server-utils';

export default async function SettingsPage() {
  const { user } = await getAuthenticatedUser();

  if (!user) {
    return <div className="text-red-500">User not authenticated</div>;
  }
  return (
    <div className="max-w-3xl mx-auto px-2">
      <div className="darkContainer">
        <div className="text-center text-yellow-400 caveatBrush text-2xl">
          Settings
        </div>
        <div className="space-y-4 py-6">
          {/* Profile Image Upload */}
          <div className="lightContainer py-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">
              Profile Image
            </h3>
            <p className="text-sm text-white mb-4">
              Upload a new profile image.
            </p>
            <ImageUpload image={user?.image} />
          </div>

          {/* Change Username */}
          <div className="lightContainer">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">
              Change Username
            </h3>
            <p className="text-sm text-white mb-4">
              Update the display name shown on your profile and next to your
              posts.
            </p>
            <form className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <input
                placeholder="New username"
                className="col-span-2 px-3 py-2 rounded bg-white text-slate-800"
              />
              <button
                type="button"
                className="px-4 py-2 bg-yellow-400 text-white rounded"
              >
                Update Username
              </button>
            </form>
          </div>

          {/* Update Email */}
          <div className="lightContainer">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">
              Update Email
            </h3>
            <p className="text-sm text-white mb-4">
              Change the email address associated with your account.
            </p>
            <form className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <input
                placeholder="New email"
                type="email"
                className="col-span-2 px-3 py-2 rounded bg-white text-slate-800"
              />
              <button
                type="button"
                className="px-4 py-2 bg-yellow-400 text-white rounded"
              >
                Update Email
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="lightContainer">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">
              Change Password
            </h3>
            <p className="text-sm text-white mb-4">
              Set a new password for your account.
            </p>
            <form className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <input
                placeholder="Current password"
                type="password"
                className="col-span-2 px-3 py-2 rounded bg-white text-slate-800"
              />
              <button
                type="button"
                className="px-4 py-2 bg-yellow-400 text-white rounded"
              >
                Change Password
              </button>
            </form>
          </div>

          {/* Delete Account */}
          <div className="lightContainer">
            <h3 className="text-lg font-semibold text-red-400 mb-3">
              Delete Account
            </h3>
            <p className="text-sm text-white mb-4">
              This action is permanent. Deleting your account will remove all
              your data including books, chapters, and comments.
            </p>
            <div className="flex items-center gap-3">
              <input
                placeholder="Type DELETE to confirm"
                className="flex-1 px-3 py-2 rounded bg-white text-slate-800 max-w-[250px]"
              />
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
