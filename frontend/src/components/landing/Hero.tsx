import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const exampleLinks = ["snip.dev/abc12", "snip.dev/x9z", "snip.dev/ref01"];

const Hero = () => {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  const handleShorten = () => {
    if (!url.trim()) return;
    // Pass the URL as a query param to pre-fill the create link page
    navigate(`/dashboard/links/new?url=${encodeURIComponent(url.trim())}`);
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid opacity-30 animate-pulse-glow" />
      
      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight"
        >
          Short URLs. Sharp Analytics.{" "}
          <span className="text-primary">Zero Noise.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-4 text-muted-foreground text-lg font-body"
        >
          Built for developers who care about performance, not fluff.
        </motion.p>

        {/* URL Input Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex items-center gap-0 max-w-xl mx-auto border border-border rounded-lg overflow-hidden bg-card focus-within:glow-border transition-shadow"
        >
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleShorten()}
            placeholder="Paste your long URL here..."
            className="flex-1 bg-transparent px-4 py-3 text-foreground font-mono text-sm placeholder:text-muted-foreground outline-none"
          />
          <Button variant="cta" className="rounded-none rounded-r-lg px-6 py-3 h-auto text-sm font-mono" onClick={handleShorten}>
            Shorten →
          </Button>
        </motion.div>

        {/* Example chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 flex items-center justify-center gap-3 flex-wrap"
        >
          {exampleLinks.map((link) => (
            <span
              key={link}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-secondary font-mono text-xs text-foreground hover:glow-border transition-shadow cursor-pointer"
            >
              {link}
              <Copy className="w-3 h-3 text-muted-foreground" />
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
