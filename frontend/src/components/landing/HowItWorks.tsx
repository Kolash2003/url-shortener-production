import { ClipboardPaste, Link2, MousePointerClick } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { icon: ClipboardPaste, num: "1", title: "Paste your URL", desc: "Drop any long URL into the input bar." },
  { icon: Link2, num: "2", title: "Get a short link", desc: "Instantly receive a snip.dev short URL." },
  { icon: MousePointerClick, num: "3", title: "Track every click", desc: "Monitor analytics from your dashboard." },
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-4 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-center font-heading text-3xl sm:text-4xl font-bold text-foreground mb-14">
          How it works
        </h2>
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-10 sm:gap-0">
          {/* Dotted connector line */}
          <div className="hidden sm:block absolute top-8 left-[15%] right-[15%] border-t border-dashed border-border" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
              className="flex-1 flex flex-col items-center text-center relative z-10"
            >
              <div className="w-14 h-14 rounded-lg border border-border bg-card flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold mb-2">
                {step.num}
              </span>
              <h3 className="font-heading font-semibold text-foreground text-sm">{step.title}</h3>
              <p className="text-muted-foreground text-xs font-body mt-1 max-w-[180px]">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
