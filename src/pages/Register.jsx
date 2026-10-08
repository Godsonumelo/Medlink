import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import { validateEmail, validatePassword, getPasswordStrength } from "../utils/validators";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [socialLoading, setSocialLoading] = useState(null);
  const { register: registerUser, socialAuth } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  const password = watch("password", "");
  const roleValue = watch("role", "patient");
  const strength = getPasswordStrength(password);

  const strengthColorMap = {
    danger: "bg-danger",
    warning: "bg-warning",
    success: "bg-success",
  };

  const strengthTextColorMap = {
    danger: "text-danger",
    warning: "text-warning",
    success: "text-success",
  };

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || "patient",
      });
      navigate("/dashboard");
    } catch (err) {
      setServerError(err?.message || "Registration failed. Please try again.");
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
      title="Create Account"
      subtitle="Join MedLink and take control of your health"
    >
      {serverError && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-[12px]">
          <p className="body-small text-danger">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="body-small font-medium text-dark block mb-2">I am a...</label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { value: "patient", label: "Patient", desc: "Book appointments & manage my health" },
            ].map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer rounded-[12px] border p-4 transition-all ${
                  roleValue === option.value
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-gray-lighter hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  value={option.value}
                  className="sr-only"
                  {...register("role", { required: "Please select an account type" })}
                />
                <span className="flex flex-col gap-1">
                  <span className="body-default font-bold text-dark">{option.label}</span>
                  <span className="caption text-gray leading-snug">{option.desc}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.role && (
            <p className="caption text-danger mt-1.5">{errors.role.message}</p>
          )}
        </div>

        <div>
          <label className="body-small font-medium text-dark block mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-light" />
            <input
              type="text"
              placeholder="Enter your full name"
              className={`w-full pl-12 pr-4 py-3.5 bg-card border rounded-[12px] body-default text-dark placeholder:text-gray-light transition-colors ${
                errors.name ? "border-danger" : "border-gray-lighter focus:border-primary"
              }`}
              {...register("name", {
                required: "Full name is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" },
              })}
            />
          </div>
          {errors.name && (
            <p className="caption text-danger mt-1.5">{errors.name.message}</p>
          )}
        </div>

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
              placeholder="Create a password"
              className={`w-full pl-12 pr-12 py-3.5 bg-card border rounded-[12px] body-default text-dark placeholder:text-gray-light transition-colors ${
                errors.password ? "border-danger" : "border-gray-lighter focus:border-primary"
              }`}
              {...register("password", {
                required: "Password is required",
                validate: (v) => {
                  const errs = validatePassword(v);
                  return errs.length === 0 || errs[0];
                },
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

          {password && (
            <div className="mt-3">
              <div className="flex gap-1.5 mb-1.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      (i === 1 && strength.percent >= 33) ||
                      (i === 2 && strength.percent >= 66) ||
                      (i === 3 && strength.percent >= 100)
                        ? strengthColorMap[strength.color]
                        : "bg-gray-lighter"
                    }`}
                  />
                ))}
              </div>
              <p className={`caption ${strengthTextColorMap[strength.color]}`}>
                {strength.level.charAt(0).toUpperCase() + strength.level.slice(1)} password
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="body-small font-medium text-dark block mb-2">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-light" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              className={`w-full pl-12 pr-12 py-3.5 bg-card border rounded-[12px] body-default text-dark placeholder:text-gray-light transition-colors ${
                errors.confirmPassword ? "border-danger" : "border-gray-lighter focus:border-primary"
              }`}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (v) => v === password || "Passwords do not match",
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-light hover:text-gray-dark transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="caption text-danger mt-1.5">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            className="mt-1 w-4 h-4 rounded border-gray-lighter text-primary focus:ring-primary"
            {...register("terms", { required: "You must accept the terms" })}
          />
          <label htmlFor="terms" className="body-small text-gray-dark">
            I agree to the{" "}
            <Link to="/about" className="text-primary font-medium hover:text-primary-dark">Terms of Service</Link>
            {" "}and{" "}
            <Link to="/about" className="text-primary font-medium hover:text-primary-dark">Privacy Policy</Link>
          </label>
        </div>
        {errors.terms && (
          <p className="caption text-danger">{errors.terms.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 gradient-primary text-white font-medium rounded-[12px] body-default hover:shadow-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
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
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-medium hover:text-primary-dark transition-colors">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
