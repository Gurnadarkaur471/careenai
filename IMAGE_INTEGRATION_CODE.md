# ImageShowcase Component - Real Implementation Examples

This file shows you exactly what code to replace to switch from placeholder images to real images.

## Step 1: Add Image Paths to FEATURES Array

### Before (Current)
```javascript
const FEATURES = [
  {
    id: 1,
    title: "AI-Powered Career Coaching",
    description: "Get personalized guidance from our advanced AI system that understands your unique career aspirations and helps you navigate the job market with confidence.",
    imageBg: "from-blue-500/20 via-cyan-500/20 to-teal-500/20",
    accent: "from-blue-400 to-cyan-400",
    position: "left"
  },
  {
    id: 2,
    title: "Professional Resume Optimization",
    description: "Transform your resume with AI-driven insights. Match your profile against job requirements and get actionable recommendations to increase your chances.",
    imageBg: "from-amber-500/20 via-yellow-500/20 to-orange-500/20",
    accent: "from-amber-300 to-yellow-300",
    position: "right"
  },
  {
    id: 3,
    title: "Real-Time Skill Assessment",
    description: "Comprehensive evaluation of your technical and soft skills with detailed feedback and personalized development paths tailored to your career goals.",
    imageBg: "from-purple-500/20 via-pink-500/20 to-rose-500/20",
    accent: "from-purple-400 to-pink-400",
    position: "left"
  },
];
```

### After (With Image Paths)
```javascript
const FEATURES = [
  {
    id: 1,
    title: "AI-Powered Career Coaching",
    description: "Get personalized guidance from our advanced AI system that understands your unique career aspirations and helps you navigate the job market with confidence.",
    image: "/images/career-coaching.jpg",  // ← ADD THIS LINE
    imageBg: "from-blue-500/20 via-cyan-500/20 to-teal-500/20",
    accent: "from-blue-400 to-cyan-400",
    position: "left"
  },
  {
    id: 2,
    title: "Professional Resume Optimization",
    description: "Transform your resume with AI-driven insights. Match your profile against job requirements and get actionable recommendations to increase your chances.",
    image: "/images/resume-optimization.jpg",  // ← ADD THIS LINE
    imageBg: "from-amber-500/20 via-yellow-500/20 to-orange-500/20",
    accent: "from-amber-300 to-yellow-300",
    position: "right"
  },
  {
    id: 3,
    title: "Real-Time Skill Assessment",
    description: "Comprehensive evaluation of your technical and soft skills with detailed feedback and personalized development paths tailored to your career goals.",
    image: "/images/skill-assessment.jpg",  // ← ADD THIS LINE
    imageBg: "from-purple-500/20 via-pink-500/20 to-rose-500/20",
    accent: "from-purple-400 to-pink-400",
    position: "left"
  },
];
```

## Step 2: Update ImageShowcase Component

### Find This Section (Around Line 170-180 in Landing.jsx)

The placeholder image section looks like this:

```jsx
{/* Image container */}
<div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-105">
  {/* Placeholder with gradient accent */}
  <div className="aspect-video relative overflow-hidden bg-slate-100">
    <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-20`}></div>
    
    {/* Animated elements inside placeholder */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className={`w-24 h-24 mx-auto mb-4 bg-gradient-to-br ${feature.accent} rounded-full opacity-30 animate-pulse`}></div>
        <p className="text-slate-500 font-medium">Professional AI Collaboration</p>
        <p className="text-sm text-slate-400 mt-2">Image will showcase real career guidance in action</p>
      </div>
    </div>
    
    {/* Animated gradient overlay on hover */}
    <div
      className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-30 transition-opacity duration-500"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, currentColor, transparent)`,
      }}
    ></div>
  </div>
  
  {/* Bottom accent bar */}
  <div className={`h-1 bg-gradient-to-r ${feature.accent}`}></div>
</div>
```

### Replace With This (Real Image Version)

```jsx
{/* Image container */}
<div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-105">
  {/* Real image */}
  <div className="aspect-video relative overflow-hidden bg-slate-100">
    <img 
      src={feature.image} 
      alt={feature.title}
      className="w-full h-full object-cover"
      loading="lazy"
    />
    
    {/* Optional: Overlay gradient for better text readability if needed */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    {/* Animated gradient overlay on hover */}
    <div
      className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-30 transition-opacity duration-500"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, currentColor, transparent)`,
      }}
    ></div>
  </div>
  
  {/* Bottom accent bar */}
  <div className={`h-1 bg-gradient-to-r ${feature.accent}`}></div>
</div>
```

## Step 3: Complete Updated ImageShowcase Component (Optional)

If you want to see the complete component with all changes:

```jsx
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
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-brand-50 to-teal-50 rounded-full border border-brand-100">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-brand-500 to-teal-500 animate-pulse"></span>
            <span className="text-sm font-medium text-brand-700">Feature {index + 1}</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
            {feature.title}
          </h2>
          
          <p className="text-lg text-slate-600 leading-relaxed">
            {feature.description}
          </p>
          
          <div className="space-y-3 pt-4">
            {["AI-Driven Insights", "Real-Time Updates", "Actionable Feedback"].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                  <Check size={16} className="text-white" />
                </div>
                <span className="text-slate-700 font-medium">{benefit}</span>
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
            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-105">
              {/* Real image - UPDATED */}
              <div className="aspect-video relative overflow-hidden bg-slate-100">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Optional: Overlay gradient for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Animated gradient overlay on hover */}
                <div
                  className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, currentColor, transparent)`,
                  }}
                ></div>
              </div>
              
              {/* Bottom accent bar */}
              <div className={`h-1 bg-gradient-to-r ${feature.accent}`}></div>
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
```

## Image File Structure

After making these changes, your project structure should look like:

```
client/
├── public/
│   └── images/
│       ├── career-coaching.jpg
│       ├── resume-optimization.jpg
│       └── skill-assessment.jpg
└── src/
    └── pages/
        └── Landing.jsx  (with updated FEATURES array and ImageShowcase)
```

## Testing Checklist

After making these changes:

- [ ] Create `client/public/images/` folder
- [ ] Add your 3 images (or download free ones first)
- [ ] Update FEATURES array with image paths
- [ ] Update ImageShowcase component
- [ ] Run `npm run dev` in client folder
- [ ] Test on desktop - hover effects working?
- [ ] Test on mobile - responsive layout correct?
- [ ] Check browser console - any errors?
- [ ] Verify images load properly - check Network tab
- [ ] Test scroll animations - smooth fade-in?

## Common Issues & Solutions

### Issue: Images not loading
**Solution**: Verify the image paths are correct and files exist in `client/public/images/`

### Issue: Images not filling container
**Solution**: Ensure images are at least 1200x800px and use `object-cover` class

### Issue: Hover effects not working
**Solution**: Make sure you're on the correct breakpoint (test on desktop for full effects)

### Issue: Images are too large
**Solution**: Compress images using TinyPNG or similar tool (aim for <500KB each)

## Advanced Options

### Add Image Preloading for Better Performance
```jsx
<link rel="preload" as="image" href="/images/career-coaching.jpg" />
<link rel="preload" as="image" href="/images/resume-optimization.jpg" />
<link rel="preload" as="image" href="/images/skill-assessment.jpg" />
```

Add these to your `index.html` `<head>` tag.

### Use Next.js Image Component (for faster apps)
```jsx
import Image from 'next/image';

<Image
  src={feature.image}
  alt={feature.title}
  width={1200}
  height={800}
  className="w-full h-full object-cover"
  quality={80}
  loading="lazy"
/>
```

### Add Image CDN Support
Replace image paths with CDN URLs:
```javascript
image: "https://cdn.example.com/images/career-coaching.jpg"
```

---

**That's it! Your home page is ready for professional images.** 🎉
