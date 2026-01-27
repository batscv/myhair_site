import { useQuery } from "@tanstack/react-query";
import { fetchSettings, updateSettings } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Save, RefreshCw, Layout, Mail, Phone, MapPin, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function AdminSettings() {
    const { data: settings, isLoading, refetch } = useQuery({
        queryKey: ['admin-settings'],
        queryFn: fetchSettings
    });

    const [formValues, setFormValues] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (settings) {
            setFormValues(settings);
        }
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateSettings(formValues);
            toast.success("Configurações atualizadas com sucesso!");
            refetch();
        } catch (error) {
            toast.error("Erro ao salvar configurações");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Carregando configurações...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold font-serif text-foreground">Configurações Gerais</h3>
                <Button
                    onClick={handleSubmit}
                    className="btn-gold rounded-full px-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    disabled={isSaving}
                >
                    {isSaving ? <RefreshCw size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
                    Salvar Alterações
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Header Settings */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Layout size={20} />
                        </div>
                        <h4 className="font-bold text-foreground">Cabeçalho (Header)</h4>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Texto da Barra Superior</label>
                        <input
                            name="header_top_bar"
                            value={formValues.header_top_bar || ''}
                            onChange={handleChange}
                            className="w-full p-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="Ex: Frete Grátis para todo o Brasil"
                        />
                        <p className="text-[10px] text-muted-foreground italic">Este texto aparece no topo de todas as páginas.</p>
                    </div>
                </div>

                {/* Contact Settings */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Mail size={20} />
                        </div>
                        <h4 className="font-bold text-foreground">Informações de Contato</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                                <Mail size={12} /> E-mail
                            </label>
                            <input
                                name="contact_email"
                                type="email"
                                value={formValues.contact_email || ''}
                                onChange={handleChange}
                                className="w-full p-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                                <Phone size={12} /> Telefone
                            </label>
                            <input
                                name="contact_phone"
                                value={formValues.contact_phone || ''}
                                onChange={handleChange}
                                className="w-full p-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                                <Share2 size={12} className="text-green-500" /> WhatsApp (Pedidos)
                            </label>
                            <input
                                name="contact_whatsapp"
                                value={formValues.contact_whatsapp || ''}
                                onChange={handleChange}
                                className="w-full p-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="Apenas números (Ex: 5511999999999)"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                            <MapPin size={12} /> Endereço
                        </label>
                        <input
                            name="contact_address"
                            value={formValues.contact_address || ''}
                            onChange={handleChange}
                            className="w-full p-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    </div>
                </div>

                {/* Footer Settings */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-6 lg:col-span-2">
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Share2 size={20} />
                        </div>
                        <h4 className="font-bold text-foreground">Rodapé & Redes Sociais</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Instagram (URL)</label>
                            <input name="social_instagram" value={formValues.social_instagram || ''} onChange={handleChange} className="w-full p-3 bg-secondary/50 border border-border rounded-xl outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Facebook (URL)</label>
                            <input name="social_facebook" value={formValues.social_facebook || ''} onChange={handleChange} className="w-full p-3 bg-secondary/50 border border-border rounded-xl outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Youtube (URL)</label>
                            <input name="social_youtube" value={formValues.social_youtube || ''} onChange={handleChange} className="w-full p-3 bg-secondary/50 border border-border rounded-xl outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Texto "Sobre Nós"</label>
                            <textarea
                                name="footer_about_text"
                                value={formValues.footer_about_text || ''}
                                onChange={handleChange}
                                rows={4}
                                className="w-full p-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                            />
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">CNPJ</label>
                                <input name="company_cnpj" value={formValues.company_cnpj || ''} onChange={handleChange} className="w-full p-3 bg-secondary/50 border border-border rounded-xl outline-none" />
                            </div>
                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 text-xs text-primary/80">
                                <p className="font-bold mb-1 italic">Dica:</p>
                                <p>Essas informações são atualizadas instantaneamente em todas as partes do site onde o Cabeçalho e Rodapé são exibidos.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
