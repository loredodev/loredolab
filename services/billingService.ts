
import { PLAN_LIMITS } from '../constants';

export const createCheckoutSession = async (planTier: string): Promise<void> => {
  try {
    const plan = PLAN_LIMITS[planTier as keyof typeof PLAN_LIMITS];
    
    if (!plan.priceId) {
        alert("Erro de Configuração: ID de preço não encontrado em constants.ts");
        return;
    }

    console.log(`Iniciando Checkout para ${plan.name}...`);

    // Call Next.js API Route (Hosted on Vercel)
    const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            priceId: plan.priceId,
            returnUrl: window.location.origin
        })
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Stripe Checkout Error:", data);
        alert("Erro ao iniciar checkout. Tente novamente.");
        return;
    }
    
    if (data?.url) {
        window.location.href = data.url;
    } else {
        throw new Error("A API não retornou uma URL válida.");
    }

  } catch (err: any) {
    console.error("Billing Error:", err);
    alert(`Erro no sistema de pagamento. Verifique sua conexão.`);
  }
};

export const createPortalSession = async (): Promise<void> => {
    // Portal logic similar... simplified for MVP
    alert("Gerenciamento de assinatura em breve.");
};
