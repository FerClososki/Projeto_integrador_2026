export const ORDER_CONFIRMATION_ORIGIN = 'https://toymania-confirmacao-pedido.contentflag5.chatgpt.site';

export async function createOrderConfirmation(amount: number, token: string): Promise<void> {
  const response = await fetch(`${ORDER_CONFIRMATION_ORIGIN}/api/confirmations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, token }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Não foi possível gerar o QR Code.');
  if (data.token !== token) throw new Error('A confirmação do pedido não foi iniciada corretamente.');
}

export async function readOrderConfirmation(token: string): Promise<'pending' | 'confirmed' | 'declined' | 'expired'> {
  const response = await fetch(`${ORDER_CONFIRMATION_ORIGIN}/api/confirmations/${encodeURIComponent(token)}`);
  const data = await response.json();
  if (response.status === 404) return 'pending';
  if (response.status === 410) return 'expired';
  if (!response.ok) throw new Error(data.error || 'Não foi possível consultar a confirmação.');
  return data.status;
}
