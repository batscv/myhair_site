import { Instagram, Facebook, Youtube, CreditCard, ShieldCheck, Truck, Phone, Mail, MapPin } from "lucide-react";
import { fetchSettings } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const footerLinks = {
  institucional: [
    { name: "Sobre Nós", href: "#" },
    { name: "Nossas Lojas", href: "#" },
    { name: "Trabalhe Conosco", href: "#" },
    { name: "Blog", href: "#" },
  ],
  ajuda: [
    { name: "Central de Ajuda", href: "#" },
    { name: "Como Comprar", href: "#" },
    { name: "Formas de Pagamento", href: "#" },
    { name: "Prazos de Entrega", href: "#" },
    { name: "Trocas e Devoluções", href: "#" },
  ],
  politicas: [
    { name: "Política de Privacidade", href: "#" },
    { name: "Termos de Uso", href: "#" },
    { name: "Política de Cookies", href: "#" },
  ],
};

export function Footer() {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings
  });

  const email = settings?.contact_email || "contato@myhair.com.br";
  const phone = settings?.contact_phone || "(11) 99999-9999";
  const address = settings?.contact_address || "São Paulo, SP - Brasil";
  const instagram = settings?.social_instagram || "#";
  const facebook = settings?.social_facebook || "#";
  const youtube = settings?.social_youtube || "#";
  const aboutText = settings?.footer_about_text || "Sua perfumaria online com as melhores marcas profissionais de beleza. Cabelos, skincare, maquiagem e perfumes com qualidade garantida.";
  const cnpj = settings?.company_cnpj || "00.000.000/0001-00";

  return (
    <footer className="bg-secondary border-t border-border">
      {/* Benefits bar */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Frete Grátis</p>
                <p className="text-xs text-muted-foreground">Acima de 299 ECV</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Parcele em 6x</p>
                <p className="text-xs text-muted-foreground">Sem juros</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Compra Segura</p>
                <p className="text-xs text-muted-foreground">Ambiente protegido</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Atendimento</p>
                <p className="text-xs text-muted-foreground">Seg a Sex, 9h às 18h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-serif font-bold mb-4">
              <span className="text-foreground">MY</span>
              <span className="text-primary"> HAIR</span>
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {aboutText}
            </p>

            {/* Contact */}
            <div className="space-y-2 mb-6">
              <a href={`mailto:${email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail size={16} />
                {email}
              </a>
              <a href={`tel:${phone.replace(/\D/g, '')}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Phone size={16} />
                {phone}
              </a>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={16} />
                {address}
              </p>
            </div>

            {/* Social */}
            <div className="flex gap-3">
              <a href={instagram} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-foreground/5 hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram size={20} />
              </a>
              <a href={facebook} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-foreground/5 hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook size={20} />
              </a>
              <a href={youtube} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-foreground/5 hover:bg-primary hover:text-primary-foreground transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Institucional</h3>
            <ul className="space-y-2">
              {footerLinks.institucional.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Ajuda</h3>
            <ul className="space-y-2">
              {footerLinks.ajuda.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Políticas</h3>
            <ul className="space-y-2">
              {footerLinks.politicas.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground text-center md:text-left">
              © 2024 MY HAIR. Todos os direitos reservados. CNPJ: {cnpj}
            </p>

            {/* Payment methods */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground mr-2">Formas de pagamento:</span>
              <div className="flex gap-1">
                {["Visa", "Master", "Elo", "Pix"].map((method) => (
                  <span
                    key={method}
                    className="px-2 py-1 bg-background rounded text-xs font-medium text-muted-foreground border border-border"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
