import { Link } from "react-router-dom";
import { Activity } from "lucide-react";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-8 bg-white/20 rounded-[20px] flex items-center justify-center backdrop-blur-sm">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="heading-2 text-white mb-4">Welcome to MedLink</h1>
          <p className="body-large text-white/80">
            Your trusted healthcare companion. Connect with doctors, book appointments, and manage your health journey.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 gradient-primary rounded-[12px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="heading-4 text-dark">Med<span className="text-primary">Link</span></span>
          </Link>

          <h2 className="heading-2 text-dark mb-2">{title}</h2>
          {subtitle && <p className="body-default text-gray mb-8">{subtitle}</p>}

          {children}
        </div>
      </div>
    </div>
  );
}
