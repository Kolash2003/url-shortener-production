import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Zap, Shield, BarChart3, ArrowRight, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirm: z.string().min(1, "Please confirm your password"),
    agreed: z.literal(true, { errorMap: () => ({ message: "You must agree to the terms" }) }),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type LoginData = z.infer<typeof loginSchema>;
type SignupData = z.infer<typeof signupSchema>;
type ForgotData = z.infer<typeof forgotSchema>;

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const getStrength = (pw: string): { score: number; label: string; color: string } => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map: Record<number, { label: string; color: string }> = {
    0: { label: "Too short", color: "bg-destructive" },
    1: { label: "Weak", color: "bg-destructive" },
    2: { label: "Fair", color: "bg-yellow-500" },
    3: { label: "Good", color: "bg-primary" },
    4: { label: "Strong", color: "bg-primary" },
  };
  return { score: s, ...map[s] };
};

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  const navigate = useNavigate();
  const { login, signup, resetPassword, isAuthenticated } = useAuth();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirm: "", agreed: false as unknown as true },
  });

  const forgotForm = useForm<ForgotData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const onLogin = async (data: LoginData) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch {
      setAuthError("Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignup = async (data: SignupData) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await signup(data.name, data.email, data.password);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch {
      setAuthError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onForgot = async (data: ForgotData) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await resetPassword(data.email);
      setForgotSent(true);
    } catch {
      setAuthError("Unable to send reset email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordValue = signupForm.watch("password");
  const strength = getStrength(passwordValue || "");

  const switchMode = (m: "login" | "signup" | "forgot") => {
    setMode(m);
    setAuthError(null);
    setForgotSent(false);
    loginForm.reset();
    signupForm.reset();
    forgotForm.reset();
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[60%] flex-col justify-center px-16 xl:px-24 relative overflow-hidden">
        <div className="dot-grid absolute inset-0 opacity-30" />
        <div className="relative z-10 max-w-lg space-y-8">
          <Link to="/" className="font-mono text-sm text-primary hover:underline">← snip.dev</Link>
          <h1 className="text-4xl xl:text-5xl font-heading font-bold text-foreground leading-tight">
            Shorten<br />smarter.
          </h1>
          <div className="space-y-4">
            {[
              { icon: Zap, title: "Fast", desc: "Sub-millisecond redirects. Globally distributed." },
              { icon: Shield, title: "Secure", desc: "Password protection, expiry controls, HTTPS everywhere." },
              { icon: BarChart3, title: "Analytics-powered", desc: "Real-time click data, geo tracking, referrer insights." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="mt-0.5 w-8 h-8 rounded-sm border border-primary/30 bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-heading font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-sm border border-border bg-card/80 backdrop-blur-sm max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs text-primary">snip.dev/gh-repo</span>
              <span className="text-[10px] font-mono text-muted-foreground">2h ago</span>
            </div>
            <div className="flex items-end gap-1 h-10">
              {[3, 5, 8, 12, 9, 14, 11, 16, 13, 18, 15, 20].map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-primary/60"
                  style={{ height: `${(v / 20) * 100}%` }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] font-mono text-muted-foreground">1,284 clicks</span>
              <span className="text-[10px] font-mono text-primary">+12% ↑</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 lg:w-[40%] flex items-center justify-center p-6 lg:p-12 bg-card">
        <div className="w-full max-w-sm space-y-6">
          <Link to="/" className="block font-mono text-lg font-bold text-primary tracking-tight">
            snip.dev
          </Link>

          {mode === "forgot" ? (
            <>
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground">Reset your password</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {forgotSent ? "If an account exists, you'll receive a reset link shortly." : "Enter your email and we'll send you a reset link."}
                </p>
              </div>

              {forgotSent ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-sm border border-primary/30 bg-primary/5">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-heading font-semibold text-foreground">Email sent</p>
                      <p className="text-[11px] text-muted-foreground">Check your inbox and spam folder.</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full font-mono text-xs" onClick={() => switchMode("login")}>
                    ← Back to login
                  </Button>
                </div>
              ) : (
                <form onSubmit={forgotForm.handleSubmit(onForgot)} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-muted-foreground">Email</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...forgotForm.register("email")}
                      className="h-10 font-mono text-sm bg-secondary border-border"
                    />
                    {forgotForm.formState.errors.email && (
                      <p className="text-[10px] font-mono text-destructive">{forgotForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  {authError && (
                    <p className="text-[10px] font-mono text-destructive bg-destructive/10 px-3 py-2 rounded-sm">{authError}</p>
                  )}

                  <Button type="submit" variant="cta" className="w-full font-mono text-sm" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
                    Send Reset Link
                  </Button>
                </form>
              )}

              <p className="text-center text-xs text-muted-foreground">
                Remember your password?{" "}
                <button onClick={() => switchMode("login")} className="text-primary hover:underline font-mono inline-flex items-center gap-0.5">
                  Log in <ArrowRight size={11} />
                </button>
              </p>
            </>
          ) : mode === "login" ? (
            <>
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground">Welcome back</h2>
                <p className="text-xs text-muted-foreground mt-1">Log in to manage your links</p>
              </div>

              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-muted-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    {...loginForm.register("email")}
                    className="h-10 font-mono text-sm bg-secondary border-border"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-[10px] font-mono text-destructive">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono text-muted-foreground">Password</label>
                    <button type="button" onClick={() => switchMode("forgot")} className="text-[11px] font-mono text-primary hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      {...loginForm.register("password")}
                      className="h-10 pr-9 font-mono text-sm bg-secondary border-border"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-[10px] font-mono text-destructive">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                {authError && (
                  <p className="text-[10px] font-mono text-destructive bg-destructive/10 px-3 py-2 rounded-sm">{authError}</p>
                )}

                <Button type="submit" variant="cta" className="w-full font-mono text-sm" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
                  Log In
                </Button>
              </form>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-mono text-muted-foreground">or continue with</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 font-mono text-xs h-9"
                  onClick={() => toast.info("OAuth sign-in coming soon")}
                >
                  <GitHubIcon /> GitHub
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 font-mono text-xs h-9"
                  onClick={() => toast.info("OAuth sign-in coming soon")}
                >
                  <GoogleIcon /> Google
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Don't have an account?{" "}
                <button onClick={() => switchMode("signup")} className="text-primary hover:underline font-mono inline-flex items-center gap-0.5">
                  Sign up <ArrowRight size={11} />
                </button>
              </p>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground">Create your account</h2>
                <p className="text-xs text-muted-foreground mt-1">Start shortening in under 30 seconds</p>
              </div>

              <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-muted-foreground">Full Name</label>
                  <Input
                    placeholder="Jane Doe"
                    {...signupForm.register("name")}
                    className="h-10 font-mono text-sm bg-secondary border-border"
                  />
                  {signupForm.formState.errors.name && (
                    <p className="text-[10px] font-mono text-destructive">{signupForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-muted-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    {...signupForm.register("email")}
                    className="h-10 font-mono text-sm bg-secondary border-border"
                  />
                  {signupForm.formState.errors.email && (
                    <p className="text-[10px] font-mono text-destructive">{signupForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-muted-foreground">Password</label>
                  <div className="relative">
                    <Input
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      {...signupForm.register("password")}
                      className="h-10 pr-9 font-mono text-sm bg-secondary border-border"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {passwordValue && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-1 flex-1 rounded-full transition-colors",
                              i < strength.score ? strength.color : "bg-muted"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground">{strength.label}</p>
                    </div>
                  )}
                  {signupForm.formState.errors.password && (
                    <p className="text-[10px] font-mono text-destructive">{signupForm.formState.errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-muted-foreground">Confirm Password</label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      {...signupForm.register("confirm")}
                      className="h-10 pr-9 font-mono text-sm bg-secondary border-border"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {signupForm.formState.errors.confirm && (
                    <p className="text-[10px] font-mono text-destructive">{signupForm.formState.errors.confirm.message}</p>
                  )}
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <Checkbox
                    id="terms"
                    checked={signupForm.watch("agreed") as unknown as boolean}
                    onCheckedChange={(v) => signupForm.setValue("agreed", v === true as unknown as true, { shouldValidate: true })}
                    className="mt-0.5"
                  />
                  <label htmlFor="terms" className="text-[11px] text-muted-foreground leading-tight cursor-pointer">
                    I agree to the{" "}
                    <span className="text-primary hover:underline cursor-pointer">Terms of Service</span>{" "}
                    and{" "}
                    <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
                  </label>
                </div>
                {signupForm.formState.errors.agreed && (
                  <p className="text-[10px] font-mono text-destructive">{signupForm.formState.errors.agreed.message}</p>
                )}

                {authError && (
                  <p className="text-[10px] font-mono text-destructive bg-destructive/10 px-3 py-2 rounded-sm">{authError}</p>
                )}

                <Button type="submit" variant="cta" className="w-full font-mono text-sm" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
                  Create Account
                </Button>
              </form>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-mono text-muted-foreground">or continue with</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 font-mono text-xs h-9"
                  onClick={() => toast.info("OAuth sign-in coming soon")}
                >
                  <GitHubIcon /> GitHub
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 font-mono text-xs h-9"
                  onClick={() => toast.info("OAuth sign-in coming soon")}
                >
                  <GoogleIcon /> Google
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <button onClick={() => switchMode("login")} className="text-primary hover:underline font-mono inline-flex items-center gap-0.5">
                  Log in <ArrowRight size={11} />
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
