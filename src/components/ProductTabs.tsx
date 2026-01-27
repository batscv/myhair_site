import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductReviews } from "@/components/ProductReviews";

interface ProductTabsProps {
  product: {
    id: number;
    name: string;
    fullDescription?: string;
    howToUse?: string;
    ingredients?: string;
  };
}

export function ProductTabs({ product }: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0 gap-8">
        <TabsTrigger
          value="description"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-base font-medium"
        >
          Descrição
        </TabsTrigger>
        <TabsTrigger
          value="howToUse"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-base font-medium"
        >
          Como Usar
        </TabsTrigger>
        <TabsTrigger
          value="ingredients"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-base font-medium"
        >
          Ingredientes
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-base font-medium"
        >
          Avaliações
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="pt-6">
        <div className="prose prose-gray max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            {product.fullDescription ||
              `O ${product.name} é um produto de alta performance desenvolvido com tecnologia avançada para oferecer resultados profissionais. 
              
              Formulado com ingredientes de qualidade premium, este produto proporciona cuidado intensivo, restaurando a saúde e vitalidade dos fios desde a primeira aplicação.
              
              Ideal para todos os tipos de cabelo, sua fórmula exclusiva penetra profundamente na fibra capilar, nutrindo e fortalecendo de dentro para fora. Os resultados são cabelos mais brilhantes, macios e com aspecto saudável.
              
              Produto original com garantia de autenticidade. Todos os nossos produtos são adquiridos diretamente das marcas ou distribuidores autorizados.`}
          </p>
        </div>
      </TabsContent>

      <TabsContent value="howToUse" className="pt-6">
        <div className="prose prose-gray max-w-none">
          <p className="text-muted-foreground leading-relaxed mb-4">
            {product.howToUse ||
              `Para melhores resultados, siga as instruções abaixo:`}
          </p>
          <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
            <li>Lave os cabelos com shampoo da mesma linha.</li>
            <li>Retire o excesso de água com uma toalha.</li>
            <li>Aplique o produto mecha por mecha, do meio às pontas.</li>
            <li>Deixe agir por 3 a 5 minutos.</li>
            <li>Enxágue abundantemente.</li>
            <li>Finalize como preferir.</li>
          </ol>
          <p className="text-sm text-muted-foreground mt-4 italic">
            * Para tratamentos intensivos, deixe agir por até 10 minutos.
          </p>
        </div>
      </TabsContent>

      <TabsContent value="ingredients" className="pt-6">
        <div className="prose prose-gray max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            {product.ingredients ||
              `Aqua, Cetearyl Alcohol, Behentrimonium Chloride, Cetyl Esters, Parfum, Isopropyl Alcohol, Phenoxyethanol, Amodimethicone, Methylparaben, Cetrimonium Chloride, Propylparaben, Trideceth-10, Citric Acid, Linalool, Limonene, Hexyl Cinnamal, Benzyl Salicylate, Coumarin, Alpha-Isomethyl Ionone, Geraniol, Benzyl Alcohol.`}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            * A composição pode variar. Consulte sempre a embalagem do produto.
          </p>
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="pt-6">
        <ProductReviews productId={product.id} />
      </TabsContent>
    </Tabs>
  );
}
