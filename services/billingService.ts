
// Versão simplificada e robusta para evitar crashes no front-end
export const createCheckoutSession = async (planTier: string): Promise<void> => {
  // Simplesmente mostra o alerta, sem lógica complexa de importação que possa falhar
  console.log(`[Billing] User requested upgrade to: ${planTier}`);
  
  // Usamos setTimeout para garantir que a UI tenha renderizado e não bloqueie a thread principal imediatamente
  setTimeout(() => {
      alert(`
      🚧 MODO DE DEMONSTRAÇÃO 🚧
      
      Você clicou para assinar o plano: ${planTier}.
      
      Como este é um MVP (Produto Mínimo Viável), a cobrança real está desativada para sua segurança.
      
      Em uma versão de produção, isso redirecionaria para o Checkout do Stripe.
      `);
  }, 100);
};

export const createPortalSession = async (): Promise<void> => {
    setTimeout(() => {
        alert("Gerenciamento de assinatura disponível apenas após upgrade real.");
    }, 100);
};
