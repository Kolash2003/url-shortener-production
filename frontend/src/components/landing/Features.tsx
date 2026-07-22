import { Tag, BarChart3, QrCode, Code2, Clock, Layers } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Tag, title: "Custom Aliases", desc: "Create branded, memorable short links with your own custom slugs." },
  { icon: BarChart3, title: "Click Analytics", desc: "Track clicks, referrers, locations, and devices in real time." },
  { icon: QrCode, title: "QR Code Export", desc: "Generate downloadable QR codes for any shortened link instantly." },
  { icon: Code2, title: "API Access", desc: "Full REST API with token auth. Automate link creation at scale." },
  { icon: Clock, title: "Expiry Controls", desc: "Set TTL on links. Auto-expire after a date or click threshold." },
  { icon: Layers, title: "Bulk Shortening", desc: "Upload CSVs or batch via API. Shorten hundreds of URLs at once." },
];

const Features = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-center font-heading text-3xl sm:text-4xl font-bold text-foreground mb-12">
          Everything a developer needs.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="border border-border rounded-lg p-5 bg-card hover:glow-border transition-shadow"
            >
              <f.icon className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-heading font-semibold text-foreground text-sm mb-1">{f.title}</h3>
              <p className="text-muted-foreground text-xs font-body leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
