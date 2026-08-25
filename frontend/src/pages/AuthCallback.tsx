import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { completeOAuth } = useAuth();

  useEffect(() => {
    const token = params.get("token");
    const error = params.get("error");

    if (error) {
      toast.error(error);
      navigate("/auth", { replace: true });
      return;
    }

    if (!token) {
      toast.error("OAuth sign-in failed. Please try again.");
      navigate("/auth", { replace: true });
      return;
    }

    completeOAuth(token)
      .then(() => {
        toast.success("Signed in successfully!");
        navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        toast.error("OAuth sign-in failed. Please try again.");
        navigate("/auth", { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={28} className="animate-spin text-primary" />
        <p className="font-mono text-xs text-muted-foreground">Completing sign-in…</p>
      </div>
    </div>
  );
};

export default AuthCallback;