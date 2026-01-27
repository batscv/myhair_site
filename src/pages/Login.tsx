import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userLogin } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock, Mail } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const user = await userLogin({ email, senha });
            localStorage.setItem("user", JSON.stringify(user));
            toast.success("Bem-vindo de volta!");
            navigate("/");
        } catch (error) {
            toast.error("Email ou senha incorretos.");
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
                        <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Entrar</h2>
                        <p className="text-muted-foreground text-sm">Acesse sua conta para gerenciar seus agendamentos e pedidos.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Seu E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="exemplo@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sua Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="text-right">
                                <a href="#" className="text-xs text-primary hover:underline">Esqueci minha senha</a>
                            </div>
                        </div>

                        <Button type="submit" className="w-full py-6 btn-gold rounded-full font-bold" disabled={isLoading}>
                            {isLoading ? "Entrando..." : "Entrar na Conta"}
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">Ainda não tem uma conta? </span>
                            <Link to="/registro" className="text-primary font-bold hover:underline">Cadastre-se</Link>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}
