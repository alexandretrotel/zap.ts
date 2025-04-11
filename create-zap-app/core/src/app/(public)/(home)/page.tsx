import { Navbar } from "@/components/zap/public/navbar";
import { AnimatedSection } from "@/components/zap/public/animated";
import { TestimonialSection } from "@/components/zap/public/landing/testimonial";
import { PricingSection } from "@/components/zap/public/landing/pricing";
import { FaqSection } from "@/components/zap/public/landing/faq";
import Footer from "@/components/zap/public/footer";
import { HeroSection } from "@/components/zap/public/landing/hero";
import { SolutionSection } from "@/components/zap/public/landing/solution";
import { FeaturesSection } from "@/components/zap/public/landing/features";
import { orpcServer } from "@/lib/orpc-server";
import { cn } from "@/lib/utils";

const DELAY_INCREMENT = 0.1;
const sectionClassName = "w-full py-12 md:py-24 lg:py-32";

const sections = (
  ratings: {
    averageRating: number;
    totalFeedbacks: number;
  },
  numberOfUsers: number,
) => [
  {
    id: "hero",
    component: <HeroSection ratings={ratings} numberOfUsers={numberOfUsers} />,
    className:
      "h-[calc(100vh-4rem)] border-b bg-muted/50 flex items-center justify-center md:py-0 overflow-hidden min-h-[500px]",
  },
  {
    id: "solution",
    component: <SolutionSection />,
    className: `bg-muted/50 border-y ${sectionClassName}`,
  },
  {
    id: "testimonials",
    component: <TestimonialSection />,
    className: sectionClassName,
  },
  {
    id: "features",
    component: <FeaturesSection />,
    className: `bg-muted/50 border-y ${sectionClassName}`,
  },
  {
    id: "pricing",
    component: <PricingSection />,
    className: sectionClassName,
  },
  {
    id: "faq",
    component: <FaqSection />,
    className: `bg-muted/50 border-t ${sectionClassName}`,
  },
];

export default async function LandingPage() {
  const ratings = await orpcServer.feedback.getAverageRating();
  const numberOfUsers = await orpcServer.users.getNumberOfUsers();

  const sectionData = sections(ratings, numberOfUsers);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {sectionData.map(({ id, component, className }, index) => (
          <AnimatedSection
            key={id}
            id={id}
            className={cn(className)}
            delay={index * DELAY_INCREMENT}
          >
            {component}
          </AnimatedSection>
        ))}
      </main>

      <Footer />
    </div>
  );
}
