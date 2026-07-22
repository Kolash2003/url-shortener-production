import { Github, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link to="/" className="font-heading font-bold text-foreground text-sm">
          snip<span className="text-primary">.dev</span>
        </Link>

        <nav className="flex items-center gap-6 text-xs text-muted-foreground font-body">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <a href="#" className="hover:text-foreground transition-colors">Docs</a>
          <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link to="/dashboard" className="hover:text-foreground transition-colors">Status</Link>
        </nav>

        <div className="flex items-center gap-3">
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            <Github className="w-4 h-4" />
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            <Twitter className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
