import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Briefcase, Sparkles, Mic, ArrowDown, Check, Search, X, ArrowRight, TrendingUp } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const ENGINES = [
  { icon: FileText, title: "Student Intelligence", desc: "Combines your resume, academics, skills, and assessments into one structured employability profile." },
  { icon: Briefcase, title: "Job Intelligence", desc: "Analyzes job descriptions and matches you against real requirements — deterministically, not guesswork." },
  { icon: Sparkles, title: "Career Simulation", desc: "The What-If Simulator shows exactly how much each skill improvement moves your readiness score." },
  { icon: Mic, title: "AI Interview Coach", desc: "Practice resume, technical, HR, and behavioral questions with structured, actionable feedback." },
];

const FEATURES = [
  {
    id: 1,
    title: "AI-Powered Career Coaching",
    description: "Get personalized guidance from our advanced AI system that understands your unique career aspirations and helps you navigate the job market with confidence.",
    image: "/images/career-coaching.jpg",
    imageBg: "from-blue-500/20 via-cyan-500/20 to-teal-500/20",
    accent: "from-blue-400 to-cyan-400",
    position: "left"
  },
  {
    id: 2,
    title: "Professional Resume Optimization",
    description: "Transform your resume with AI-driven insights. Match your profile against job requirements and get actionable recommendations to increase your chances.",
    image: "/images/resume-optimization.jpg",
    imageBg: "from-amber-500/20 via-yellow-500/20 to-orange-500/20",
    accent: "from-amber-300 to-yellow-300",
    position: "right"
  },
  {
    id: 3,
    title: "Real-Time Skill Assessment",
    description: "Comprehensive evaluation of your technical and soft skills with detailed feedback and personalized development paths tailored to your career goals.",
    image: "/images/skill-assessment.jpg",
    imageBg: "from-purple-500/20 via-pink-500/20 to-rose-500/20",
    accent: "from-purple-400 to-pink-400",
    position: "left"
  },
  {
    id: 4,
    title: "Deterministic Career Trajectory Simulation",
    description: "Model what-if growth scenarios with pinpoint accuracy. Visualize role progression, salary growth curves, and skill milestone unlocks before taking your next step.",
    image: "/images/career-simulation.jpg",
    imageBg: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
    accent: "from-emerald-400 to-teal-400",
    position: "right"
  },
];

// Hook to detect when an element comes into view
const useInView = (ref, options = {}) => {
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.1,
      ...options
    });
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [ref, options]);
  
  return isInView;
};

// Parallax background component
const ParallaxBg = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Animated gradient orbs */}
      <div
        className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-brand-400/20 to-transparent rounded-full blur-3xl"
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      />
      <div
        className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-br from-teal-300/20 to-transparent rounded-full blur-3xl"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-amber-200/15 to-transparent rounded-full blur-3xl"
        style={{ transform: `translateY(${scrollY * 0.4}px)` }}
      />
    </div>
  );
};

// Scroll indicator component
const ScrollIndicator = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY < 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return isVisible ? (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce pointer-events-none">
      <ArrowDown size={24} className="text-brand-500" />
    </div>
  ) : null;
};

// Image showcase section component
const ImageShowcase = ({ feature, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { threshold: 0.2 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    });
  };

  const isLeft = feature.position === "left";

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-1000 ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: isInView ? "0ms" : "0ms" }}
    >
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center py-12 md:py-20">
        {/* Content Side */}
        <div className={`space-y-6 ${isLeft ? "md:order-1" : "md:order-2"}`}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-brand-50 to-teal-50 dark:from-brand-950/70 dark:to-teal-950/70 rounded-full border border-brand-200/60 dark:border-brand-800/60 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-brand-500 to-teal-500 animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wide uppercase text-brand-700 dark:text-brand-300">Feature {index + 1}</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
            {feature.title}
          </h2>
          
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {feature.description}
          </p>
          
          <div className="space-y-3 pt-4">
            {["AI-Driven Insights", "Real-Time Updates", "Actionable Feedback"].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Check size={14} className="text-white" />
                </div>
                <span className="text-slate-700 dark:text-slate-200 font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Image Side */}
        <div className={`${isLeft ? "md:order-2" : "md:order-1"}`}>
          <div
            ref={ref}
            onMouseMove={handleMouseMove}
            className="relative group"
          >
            {/* Outer glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.imageBg} rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            
            {/* Image container */}
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl overflow-hidden border border-slate-200/80 shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-[1.02]">
              <div className="aspect-video relative overflow-hidden bg-slate-950">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Subtle sheen and vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"></div>

                {/* Animated gradient overlay on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, currentColor, transparent)`,
                  }}
                ></div>
              </div>
              
              {/* Bottom accent bar */}
              <div className={`h-1.5 bg-gradient-to-r ${feature.accent}`}></div>
            </div>

            {/* Corner accent elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-brand-400/30 to-teal-400/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [practiceMode, setPracticeMode] = useState("placement");
  const [query, setQuery] = useState("");
  const [company, setCompany] = useState("");
  const heroTitleRef = useRef(null);
  const heroDescRef = useRef(null);
  const heroBtnRef = useRef(null);
  const enginesRef = useRef(null);
  const cardRefs = useRef([]);

  const heroTitleInView = useInView(heroTitleRef);
  const heroDescInView = useInView(heroDescRef);
  const heroBtnInView = useInView(heroBtnRef);
  const enginesInView = useInView(enginesRef);

  const searchPractice = (event) => {
    event.preventDefault();
    const practice = {
      practiceMode,
      focusTopic: query.trim(),
      company: company.trim(),
    };
    navigate(user ? "/interview-coach" : "/signup", { state: { practice } });
  };

  return (
    <div className="relative">
      <ParallaxBg />
      <ScrollIndicator />

      {announcementVisible && (
        <div className="relative z-20 flex min-h-11 items-center justify-center gap-2 bg-slate-900 px-12 py-2 text-center text-sm font-medium text-emerald-300">
          <span>Practice real company assessment patterns with AI-powered mock tests</span>
          <ArrowRight size={17} aria-hidden="true" />
          <button
            type="button"
            onClick={() => setAnnouncementVisible(false)}
            aria-label="Dismiss announcement"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded p-1 text-slate-300 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-center px-6 pb-16 pt-14 text-center">
        {/* Title with fade-in and slide-up animation */}
        <div
          ref={heroTitleRef}
          className={`transform transition-all duration-1000 ${
            heroTitleInView 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-md mb-6 hover:border-brand-500/40 transition-all duration-300">
            <img src="/images/prepwise-icon.png" alt="PrepWise" className="h-5 w-5 object-contain dark:hidden" />
            <img src="/images/prepwise-icon-dark.png" alt="PrepWise" className="h-5 w-5 object-contain hidden dark:block" />
            <span className="text-xs font-semibold tracking-wide uppercase text-slate-700 dark:text-slate-300">
              Prep<span className="text-brand-600 dark:text-brand-400">Wise</span> <span className="text-slate-400 dark:text-slate-500">•</span> AI-Powered Placement Readiness
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
            Know Your Readiness. Find Your Fit.{" "}
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-500 bg-clip-text text-transparent animate-gradient">
              Build Your Career.
            </span>
          </h1>
        </div>

        {/* Description with fade-in animation (staggered) */}
        <div
          ref={heroDescRef}
          className={`transform transition-all duration-1000 delay-200 ${
            heroDescInView 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-10"
          }`}
        >
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            An AI-powered employability intelligence platform that evaluates your skills, matches you with jobs,
            identifies your gaps, simulates your career growth, and prepares you for interviews.
          </p>
        </div>

        <div className="mx-auto mt-9 w-full max-w-3xl animate-search-enter text-left">
          <div className="mb-4 flex justify-center" role="group" aria-label="Practice mode">
            <button
              type="button"
              aria-pressed={practiceMode === "placement"}
              onClick={() => setPracticeMode("placement")}
              className={`rounded-l-xl border px-5 py-2.5 text-sm font-semibold transition ${practiceMode === "placement" ? "border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-500/20" : "border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"}`}
            >
              Placement prep
            </button>
            <button
              type="button"
              aria-pressed={practiceMode === "interview"}
              onClick={() => setPracticeMode("interview")}
              className={`rounded-r-xl border-y border-r px-5 py-2.5 text-sm font-semibold transition ${practiceMode === "interview" ? "border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-500/20" : "border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"}`}
            >
              Mock interview
            </button>
          </div>
          <form onSubmit={searchPractice} className="grid gap-3 rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/75 p-3 shadow-xl shadow-slate-900/10 dark:shadow-black/40 backdrop-blur-2xl sm:grid-cols-[minmax(0,1fr)_minmax(0,0.65fr)_auto]">
            <label className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-950/60 px-4 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 dark:focus-within:ring-brand-900">
              <Search size={20} className="shrink-0 text-slate-400" aria-hidden="true" />
              <input
                aria-label="Topic or role"
                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-0"
                placeholder="Search a topic or role..."
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label className="flex min-w-0 items-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-950/60 px-4 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 dark:focus-within:ring-brand-900">
              <input
                aria-label="Company"
                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-0"
                placeholder="Company (optional)"
                autoComplete="organization"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
              />
            </label>
            <button type="submit" className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3">
              Search <ArrowRight size={17} />
            </button>
          </form>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="mr-1 inline-flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400"><TrendingUp size={16} /> Trending</span>
            {["Logical reasoning", "TCS", "Python", "Wipro", "Data structures"].map((suggestion) => (
              <button
                type="button"
                key={suggestion}
                onClick={() => /^(tcs|wipro)$/i.test(suggestion) ? setCompany(suggestion) : setQuery(suggestion)}
                className="rounded-full border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-white dark:hover:bg-slate-800 hover:text-brand-600 dark:hover:text-brand-300"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* CTA Button with fade-in and scale animation */}
        <div
          ref={heroBtnRef}
          className={`transform transition-all duration-1000 delay-300 ${
            heroBtnInView 
              ? "opacity-100 scale-100" 
              : "opacity-0 scale-95"
          }`}
        >
          <Link
            to="/signup"
            className="btn-primary inline-block mt-8 text-base px-8 py-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Engines Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div
          ref={enginesRef}
          className={`transform transition-all duration-1000 ${
            enginesInView 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-center text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Four AI-Powered Engines
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-12">
            Comprehensive tools designed to accelerate your career journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {ENGINES.map(({ icon: Icon, title, desc }, index) => {
            const cardRef = useRef(null);
            cardRefs.current[index] = cardRef;
            const isInView = useInView(cardRef, { threshold: 0.15 });

            return (
              <div
                key={title}
                ref={cardRef}
                className={`card flex gap-4 group hover:shadow-2xl transition-all duration-500 transform ${
                  isInView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: isInView ? `${index * 100}ms` : "0ms"
                }}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-50 to-teal-50 dark:from-brand-950/70 dark:to-teal-950/70 text-brand-600 dark:text-brand-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <Icon size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300">
                    {title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 transition-colors duration-300">
                    {desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Showcase Section with Images */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-32">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Experience the Power of AI-Driven Career Growth
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            See how our intelligent platform transforms your career journey with real-time insights and personalized guidance.
          </p>
        </div>

        {/* Features with alternating images */}
        <div className="space-y-20 md:space-y-32">
          {FEATURES.map((feature, index) => (
            <ImageShowcase key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 md:py-32">
        <div className="relative group">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 via-teal-500/20 to-brand-500/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Content card */}
          <div className="relative bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-900/80 dark:to-slate-950/80 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-white/60 dark:border-white/10 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto mb-6 flex justify-center">
                <img
                  src="/images/prepwise-logo.png"
                  alt="PrepWise - Placement Readiness Platform"
                  className="h-24 w-auto object-contain dark:hidden drop-shadow-sm"
                />
                <img
                  src="/images/prepwise-logo-dark.png"
                  alt="PrepWise - Placement Readiness Platform"
                  className="h-24 w-auto object-contain hidden dark:block drop-shadow-sm"
                />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
                Ready to Transform Your Career?
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                Join thousands of professionals using PrepWise to accelerate their career growth and land their dream jobs.
              </p>
              <Link
                to="/signup"
                className="btn-primary inline-block text-base px-8 py-4 shadow-lg shadow-brand-500/25 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Start Your Journey Today
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
