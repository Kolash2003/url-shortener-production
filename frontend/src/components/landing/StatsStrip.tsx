import { Link, Globe, Server } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { icon: Link, value: "2.4M+", label: "Links Created" },
  { icon: Globe, value: "180+", label: "Countries Reached" },
  { icon: Server, value: "99.9%", label: "Uptime" },
];

const StatsStrip = () => {
  return (
    <section className="border-y border-border bg-card/50 py-10">
      <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="flex items-center gap-4 justify-center"
          >
            <stat.icon className="w-8 h-8 text-primary shrink-0" />
            <div>
              <div className="text-2xl font-heading font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground font-body">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StatsStrip;
