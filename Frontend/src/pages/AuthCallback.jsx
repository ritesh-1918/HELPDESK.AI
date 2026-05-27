import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { supabase } from "../lib/supabaseClient";

function AuthCallback() {
  const navigate = useNavigate();
  const { getProfile } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Retrieve the current session to ensure the user is logged in
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        const user = session?.user;
        if (!user) {
          throw new Error("No user session found");
        }

        // Fetch/sync user profile
        const profile = await getProfile(user);
        if (!profile) {
          throw new Error("Failed to retrieve user profile");
        }

        // Redirect based on role and status
        if (profile.status === "active") {
          if (profile.role === "master_admin") {
            navigate("/master-admin/dashboard", { replace: true });
          } else if (profile.role === "admin" || profile.role === "super_admin") {
            navigate("/admin/dashboard", { replace: true });
          } else if (profile.role === "user") {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        } else if (profile.status === "pending_approval") {
          if (profile.role === "admin") {
            navigate("/admin-lobby", { replace: true });
          } else if (profile.role === "user") {
            navigate("/user-lobby", { replace: true });
          } else {
            navigate("/user-lobby", { replace: true });
          }
        } else if (profile.status === "rejected") {
          navigate("/not-approved", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("Error in OAuth callback processing:", err);
        navigate("/login", { replace: true });
      }
    };

    handleCallback();
  }, [navigate, getProfile]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-300">Signing you in...</p>
    </div>
  );
}

export default AuthCallback;
