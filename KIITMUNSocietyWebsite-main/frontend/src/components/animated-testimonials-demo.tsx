import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export default function AnimatedTestimonialsDemo() {
  const testimonials = [
    {
      quote:
        "On wednesdays, we wear pink.",
      name: "Aastha Vij",
      designation: "Social Media Lead",
      src: "/images/team/aastha.jpg",
    },
    {
      quote:
        "I believe every experience teaches us something, that’s why it’s never clear if I’m planning something big or just dancing through life",
      name: "Diya Agarwal",
      designation: "Social Media Lead",
      src: "/images/team/diya.jpg",
    },
    {
      quote:
        "“Kindness is the new Punk Rock.” ",
      name: "Projit Dutt",
      designation: "Events and Sessions Lead",
      src: "/images/team/projit.jpg",
    },
    {
      quote:
        "No legacy is so rich as honesty.",
      name: "Dev Pathak",
      designation: "Events and Sessions Lead",
      src: "/images/team/dev.jpg",
    },
    {
      quote:
        "I believe everything is political, that’s why my friends never know if I am making a harmless joke or drafting a manifesto.",
      name: "Anushka Roy",
      designation: "Events and Sessions Lead",
      src: "/images/team/anushka.jpg",
    },
        {
      quote:
        "Sometimes, I feel I’m super smart. Other times, I have to sing the ABCs in my head to remember which letter comes next.",
      name: "Neeti Jha",
      designation: "Curation lead",
      src: "/images/team/neeti.jpg",
    },
        {
      quote:
        "At 3 am , I think and argue with myself. At MUNs,  I make the committee regret that I thought.",
      name: "Rishika Choudhury",
      designation: "Curation Lead",
      src: "/images/team/rishika.jpg",
    },
  ];
  return <AnimatedTestimonials testimonials={testimonials} />;
}
