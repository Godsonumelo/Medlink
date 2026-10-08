import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import { validateEmail } from "../utils/validators";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [socialLoading, setSocialLoading] = useState(null);
  const { login, socialAuth } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await login({ email: data.email, password: data.password }, data.rememberMe);
      navigate("/dashboard");
    } catch (err) {
      setServerError(err?.message || "Invalid email or password. Please try again.");
    }
  };

  const handleSocial = async (provider) => {
    setServerError("");
    setSocialLoading(provider);
    try {
      const mockToken = `${provider}_${Date.now()}`;
      await socialAuth(provider, mockToken);
      navigate("/dashboard");
    } catch (err) {
      setServerError(err?.message || `${provider === "google" ? "Google" : "Apple"} sign-in failed`);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      {serverError && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-[12px]">
          <p className="body-small text-danger">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="body-small font-medium text-dark block mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-light" />
            <input
              type="email"
              placeholder="Enter your email"
              className={`w-full pl-12 pr-4 py-3.5 bg-card border rounded-[12px] body-default text-dark placeholder:text-gray-light transition-colors ${
                errors.email ? "border-danger" : "border-gray-lighter focus:border-primary"
              }`}
              {...register("email", {
                required: "Email is required",
                validate: (v) => validateEmail(v) || "Please enter a valid email",
              })}
            />
          </div>
          {errors.email && (
            <p className="caption text-danger mt-1.5">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="body-small font-medium text-dark block mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-light" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={`w-full pl-12 pr-12 py-3.5 bg-card border rounded-[12px] body-default text-dark placeholder:text-gray-light transition-colors ${
                errors.password ? "border-danger" : "border-gray-lighter focus:border-primary"
              }`}
              {...register("password", {
                required: "Password is required",
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-light hover:text-gray-dark transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="caption text-danger mt-1.5">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-lighter text-primary focus:ring-primary"
              {...register("rememberMe")}
            />
            <span className="body-small text-gray-dark">Remember me</span>
          </label>
          <Link to="/forgot-password" className="body-small text-primary font-medium hover:text-primary-dark transition-colors">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 gradient-primary text-white font-medium rounded-[12px] body-default hover:shadow-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-lighter" />
          </div>
          <div className="relative flex justify-center text-caption">
            <span className="bg-background px-4 text-gray body-small">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            onClick={() => handleSocial("google")}
            disabled={socialLoading !== null}
            aria-label="Continue with Google"
            className="flex items-center justify-center gap-3 py-3 bg-card border border-gray-lighter rounded-[12px] body-small font-medium text-dark hover:bg-background transition-colors disabled:opacity-60"
          >
            {socialLoading === "google" ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            )}
            Google
          </button>
          <button
            onClick={() => handleSocial("apple")}
            disabled={socialLoading !== null}
            aria-label="Continue with Apple"
            className="flex items-center justify-center gap-3 py-3 bg-card border border-gray-lighter rounded-[12px] body-small font-medium text-dark hover:bg-background transition-colors disabled:opacity-60"
          >
            {socialLoading === "apple" ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            )}
            Apple
          </button>
        </div>
      </div>

      <p className="mt-8 text-center body-small text-gray">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-primary font-medium hover:text-primary-dark transition-colors">
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
}
