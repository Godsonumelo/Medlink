import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import { authService } from "../services/auth";
import { validateEmail } from "../utils/validators";

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await authService.forgotPassword(data.email);
      setSubmitted(true);
    } catch (err) {
      setServerError(err?.message || "Something went wrong. Please try again.");
    }
  };

  if (submitted) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="We've sent a password reset link to your email address"
      >
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <p className="body-default text-gray mb-8">
            If an account exists with that email, you&apos;ll receive a password reset link shortly. Check your spam folder if you don&apos;t see it.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-primary font-medium body-default hover:text-primary-dark transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your email and we'll send you a reset link"
    >
      {serverError && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-[12px]">
          <p className="body-small text-danger">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="body-small font-medium text-dark block mb-2">Email Address</label>
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 gradient-primary text-white font-medium rounded-[12px] body-default hover:shadow-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending link...
            </>
          ) : (
            "Send Reset Link"
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
