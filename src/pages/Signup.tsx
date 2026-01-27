import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userRegister } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, Mail, Lock, Phone } from "lucide-react";

export default function Signup() {
    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        senha: "",
        telefone: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await userRegister(formData);
            toast.success("Conta criada com sucesso! Agora você pode fazer login.");
            navigate("/login");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-20 pt-32 md:pt-48 flex justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-border w-full max-w-md">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Criar Conta</h2>
                        <p className="text-muted-foreground text-sm">Junte-se à MY HAIR e aproveite ofertas exclusivas.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    name="nome"
                                    required
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Nome e Sobrenome"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Seu E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="exemplo@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Telefone (WhatsApp)</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    name="telefone"
                                    type="tel"
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Defina uma Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    name="senha"
                                    type="password"
                                    required
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full py-6 btn-gold rounded-full font-bold mt-4" disabled={isLoading}>
                            {isLoading ? "Criando conta..." : "Criar Minha Conta"}
                        </Button>

                        <div className="text-center text-sm pt-4">
                            <span className="text-muted-foreground">Já tem uma conta? </span>
                            <Link to="/login" className="text-primary font-bold hover:underline">Faça Login</Link>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}
