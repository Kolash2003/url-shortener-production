import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Check, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Hacker",
    price: { monthly: 0, annual: 0 },
    desc: "For side projects and experiments.",
    cta: "Get Started Free",
    variant: "outline" as const,
    popular: false,
    features: [
      "100 links / month",
      "Basic click analytics",
      "1 user",
      "snip.dev domain only",
      "Community support",
    ],
  },
  {
    name: "Builder",
    price: { monthly: 9, annual: 7 },
    desc: "For developers shipping real products.",
    cta: "Start Building",
    variant: "cta" as const,
    popular: true,
    features: [
      "Unlimited links",
      "Full analytics & geo data",
      "Custom aliases",
      "API access",
      "QR code export",
      "Password-protected links",
      "UTM parameters",
    ],
  },
  {
    name: "Scale",
    price: { monthly: 29, annual: 23 },
    desc: "For teams and high-volume use cases.",
    cta: "Contact Sales",
    variant: "outline" as const,
    popular: false,
    features: [
      "Everything in Builder",
      "10 team members",
      "Bulk import / export",
      "Priority support",
      "White-label custom domain",
      "Custom Open Graph previews",
      "Advanced redirect rules",
    ],
  },
];

type CellValue = true | false | string;
const comparisonFeatures: { feature: string; hacker: CellValue; builder: CellValue; scale: CellValue }[] = [
  { feature: "Short links", hacker: "100/mo", builder: "Unlimited", scale: "Unlimited" },
  { feature: "Click analytics", hacker: "Basic", builder: "Full", scale: "Full" },
  { feature: "Geo & device data", hacker: false, builder: true, scale: true },
  { feature: "Custom aliases", hacker: false, builder: true, scale: true },
  { feature: "API access", hacker: false, builder: true, scale: true },
  { feature: "QR codes", hacker: false, builder: true, scale: true },
  { feature: "Password protection", hacker: false, builder: true, scale: true },
  { feature: "UTM parameters", hacker: false, builder: true, scale: true },
  { feature: "Team members", hacker: "1", builder: "1", scale: "10" },
  { feature: "Bulk import", hacker: false, builder: false, scale: true },
  { feature: "Custom domain", hacker: false, builder: false, scale: true },
  { feature: "Custom OG previews", hacker: false, builder: false, scale: true },
  { feature: "Support", hacker: "Community", builder: "Email", scale: "Priority" },
];

const faqs = [
  { q: "Can I use a custom domain?", a: "Yes — custom domains are available on the Scale plan. You can map any domain you own (e.g., go.yourcompany.com) and all short links will use that domain instead of snip.dev." },
  { q: "Is there a free trial?", a: "The Hacker plan is free forever with generous limits. For Builder and Scale, we offer a 14-day free trial — no credit card required." },
  { q: "How do I cancel?", a: "You can cancel anytime from your account settings. Your links will continue working, but you'll lose access to premium features at the end of your billing cycle." },
  { q: "What counts as a click?", a: "Every unique redirect through your short link counts as one click. Bot traffic is filtered automatically. Analytics show both total clicks and unique visitors." },
  { q: "Do links expire?", a: "By default, links never expire. You can optionally set an expiry date on any link. Expired links return a 404 page or a custom redirect." },
];

const CellIcon = ({ value }: { value: CellValue }) => {
  if (value === true) return <Check size={14} className="text-primary mx-auto" />;
  if (value === false) return <X size={14} className="text-muted-foreground/40 mx-auto" />;
  return <span className="text-xs font-mono text-foreground">{value}</span>;
};

const Pricing = () => {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-3 flex items-center justify-between">
        <Link to="/" className="font-mono text-sm font-bold text-primary tracking-tight">snip.dev</Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground font-mono transition-colors">Home</Link>
          <Link to="/auth" className="text-xs text-muted-foreground hover:text-foreground font-mono transition-colors">Log In</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground">
            Simple pricing. No surprises.
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Start free. Scale when you're ready. No hidden fees.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className={cn("text-xs font-mono", !annual ? "text-foreground" : "text-muted-foreground")}>Monthly</span>
            <Switch checked={annual} onCheckedChange={setAnnual} />
            <span className={cn("text-xs font-mono flex items-center gap-1.5", annual ? "text-foreground" : "text-muted-foreground")}>
              Annual
              {annual && (
                <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] font-mono">
                  Save 20%
                </Badge>
              )}
            </span>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "relative border rounded-sm p-5 space-y-5 transition-shadow",
                tier.popular
                  ? "border-primary/50 glow-border bg-card"
                  : "border-border bg-card hover:glow-border"
              )}
            >
              {tier.popular && (
                <Badge className="absolute -top-2.5 left-4 bg-primary text-primary-foreground text-[10px] font-mono">
                  Most Popular
                </Badge>
              )}
              <div>
                <p className="text-sm font-heading font-semibold text-foreground">{tier.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{tier.desc}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-heading font-bold text-foreground">
                  ${annual ? tier.price.annual : tier.price.monthly}
                </span>
                <span className="text-xs text-muted-foreground font-mono">/mo</span>
              </div>
              <Button
                variant={tier.variant}
                className="w-full font-mono text-xs"
              >
                {tier.cta}
              </Button>
              <ul className="space-y-2">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <Check size={13} className="text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-bold text-foreground text-center">
            Feature comparison
          </h2>
          <div className="border border-border rounded-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-mono text-[11px] text-muted-foreground w-[40%]">Feature</TableHead>
                  <TableHead className="font-mono text-[11px] text-muted-foreground text-center">Hacker</TableHead>
                  <TableHead className="font-mono text-[11px] text-primary text-center">Builder</TableHead>
                  <TableHead className="font-mono text-[11px] text-muted-foreground text-center">Scale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonFeatures.map((row) => (
                  <TableRow key={row.feature} className="border-border hover:bg-secondary/30">
                    <TableCell className="font-mono text-xs text-muted-foreground">{row.feature}</TableCell>
                    <TableCell className="text-center"><CellIcon value={row.hacker} /></TableCell>
                    <TableCell className="text-center"><CellIcon value={row.builder} /></TableCell>
                    <TableCell className="text-center"><CellIcon value={row.scale} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-lg font-heading font-bold text-foreground text-center">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="space-y-1.5">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-sm px-4 bg-card">
                <AccordionTrigger className="text-sm font-heading font-medium text-foreground py-3 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground pb-3 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 text-center">
        <p className="text-[11px] font-mono text-muted-foreground">
          © 2025 snip.dev — Built for developers.
        </p>
      </footer>
    </div>
  );
};

export default Pricing;
