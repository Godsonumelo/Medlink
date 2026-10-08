import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const FEATURES = [
  "Book appointments instantly",
  "Access medical records",
  "Chat with doctors online",
  "Track your health metrics",
];

function StoreButton({ label, sublabel, icon }) {
  return (
    <button
      className="inline-flex items-center gap-3 px-6 py-3.5 bg-white rounded-full hover:bg-gray-50 transition-colors shadow-soft"
      aria-label={sublabel}
    >
      {icon}
      <span className="text-left">
        <span className="block text-[10px] text-gray leading-tight uppercase tracking-wide">
          {label}
        </span>
        <span className="text-sm font-bold text-dark leading-tight">
          {sublabel}
        </span>
      </span>
    </button>
  );
}

export default function DownloadApp() {
  return (
    <section className="py-20" aria-label="Download the app">
      <div className="container-medlink">
        <div className="relative overflow-hidden rounded-[24px] bg-primary px-8 py-16 lg:px-16 lg:py-20">
          {/* Decorative blurs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-secondary/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white mb-6 leading-tight">
                Take Control of Your Health Anytime
              </h2>
              <p className="text-lg text-white/80 mb-10 max-w-md leading-relaxed">
                Download the MedLink app and get access to quality healthcare
                at your fingertips. Available on iOS and Android.
              </p>

              <div className="space-y-4 mb-10">
                {FEATURES.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent shrink-0" />
                    <span className="text-base text-white/90">{f}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <StoreButton
                  label="Get it on"
                  sublabel="Google Play"
                  icon={
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302-2.302 2.302L15.396 12l2.302-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z" />
                    </svg>
                  }
                />
                <StoreButton
                  label="Download on the"
                  sublabel="App Store"
                  icon={
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                  }
                />
              </div>
            </motion.div>

            {/* Right — Phone Mockups */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative">
                <div className="w-56 h-[420px] bg-white rounded-[36px] shadow-2xl p-8 flex flex-col items-center justify-center relative z-10">
                  <div className="w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-primary">M</span>
                  </div>
                  <p className="text-lg font-bold text-dark text-center">
                    MedLink
                  </p>
                  <p className="text-xs text-gray text-center mt-1">
                    Healthcare App
                  </p>
                </div>

                <div className="absolute top-8 -left-16 w-48 h-[360px] bg-white/40 rounded-[30px] shadow-xl z-0" />
                <div className="absolute top-8 -right-16 w-48 h-[360px] bg-white/40 rounded-[30px] shadow-xl z-0" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
