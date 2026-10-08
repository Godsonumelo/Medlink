import { useRef, useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import { authService } from "../services/auth";
import { validatePassword, getPasswordStrength } from "../utils/validators";

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirectTimerRef = useRef(null);
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  const password = watch("password", "");

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

  const strength = getPasswordStrength(password);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const onSubmit = async (data) => {
    setServerError("");
    if (!token) {
      setServerError("Invalid or missing reset token. Please request a new link.");
      return;
    }
    try {
      await authService.resetPassword(token, data.password);
      setSuccess(true);
      redirectTimerRef.current = setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setServerError(err?.message || "Failed to reset password. The link may have expired.");
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Password Reset!"
        subtitle="Your password has been successfully updated"
      >
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <p className="body-default text-gray mb-8">
            Redirecting you to the sign in page in a few seconds...
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-primary font-medium body-default hover:text-primary-dark transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Go to Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your new password below"
    >
      {serverError && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-[12px]">
          <p className="body-small text-danger">{serverError}</p>
        </div>
      )}

      {!token && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-[12px]">
          <p className="body-small text-warning">No reset token found. Please use the link from your email or request a new one.</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="body-small font-medium text-dark block mb-2">New Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-light" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
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
              placeholder="Confirm your new password"
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

        <button
          type="submit"
          disabled={isSubmitting || !token}
          className="w-full py-4 gradient-primary text-white font-medium rounded-[12px] body-default hover:shadow-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Resetting password...
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-primary font-medium body-small hover:text-primary-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
