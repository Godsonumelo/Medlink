import { Calendar, Stethoscope, FileText, Pill, HeartPulse, ShieldCheck } from "lucide-react";

export const SERVICES = [
  {
    id: 1,
    title: "Appointment Booking",
    description:
      "Schedule appointments with healthcare professionals based on your preferred time and availability.",
    icon: Calendar,
    details:
      "Pick a healthcare professional, choose a slot that suits your day, and confirm in a few taps. MedLink keeps your upcoming visits, reminders, and visit reasons organised so nothing slips through.",
    highlights: [
      "Book with any listed professional in under a minute",
      "Pick a date and time that matches your schedule",
      "Get reminders before every appointment",
      "Reschedule or cancel from the same place",
    ],
    to: "/dashboard/appointments",
    cta: "Book Appointment",
  },
  {
    id: 2,
    title: "Find a Doctor",
    description: "Discover healthcare professionals by specialty, location, and availability.",
    icon: Stethoscope,
    details:
      "Search the MedLink directory by specialty, name, or location, then compare professionals before you decide. Every profile shows qualifications, focus areas, fees, and the next time they are available.",
    highlights: [
      "Filter by specialty, location, and language",
      "Compare qualifications, fees, and experience",
      "See live availability for each professional",
      "Save the doctors you want to book later",
    ],
    to: "/doctors",
    cta: "Find a doctor",
  },
  {
    id: 3,
    title: "Medical Records",
    description:
      "Keep your important medical information organized and accessible in one secure place.",
    icon: FileText,
    details:
      "Store reports, lab results, and visit notes in one encrypted timeline that is always available to you and only shared with the professionals you approve. Download or share a summary whenever you need it.",
    highlights: [
      "Securely upload reports, results, and documents",
      "One timeline for every visit and test result",
      "Control exactly who can view your records",
      "Download or share a summary at any time",
    ],
    to: "/dashboard/records",
    cta: "View my records",
  },
  {
    id: 4,
    title: "Prescription Management",
    description: "Keep track of prescriptions and important medication information.",
    icon: Pill,
    details:
      "Follow every medication in one place. MedLink keeps your dosage, schedule, and refills visible and flags anything that needs a renewal before you run out.",
    highlights: [
      "Track dosage, schedule, and refill dates",
      "Get a notification before a prescription runs out",
      "Renew prescriptions with your regular provider",
      "Share your medication list during a consultation",
    ],
    to: "/dashboard/prescriptions",
    cta: "Manage prescriptions",
  },
  {
    id: 5,
    title: "Emergency Care",
    description:
      "Quickly access emergency healthcare information and locate available emergency services.",
    icon: HeartPulse,
    details:
      "When time matters, MedLink surfaces the nearest open emergency facilities, your emergency contacts, and your medical summary so responders have what they need without delay.",
    highlights: [
      "Locate the nearest emergency facility, fast",
      "See wait times and current capacity",
      "Reach your emergency contacts in one tap",
      "Share a read-only medical summary with responders",
    ],
    to: "/hospitals",
    cta: "Find nearby care",
  },
  {
    id: 6,
    title: "Health Support",
    description: "Access helpful healthcare information and support whenever you need it.",
    icon: ShieldCheck,
    details:
      "Ask questions between visits and understand your results with plain-language guidance, wellness tips, and reminders tailored to the care you are already receiving.",
    highlights: [
      "Plain-language answers to common health questions",
      "Reminders and tips based on your care plan",
      "Follow-up guidance after every appointment",
      "Private, secure conversations",
    ],
    to: "/dashboard",
    cta: "Get support",
  },
];
