export interface ZipCodeAddress {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export async function findAddressByZipCode(zipCode: string, signal?: AbortSignal): Promise<ZipCodeAddress> {
  const digits = zipCode.replace(/\D/g, '');
  if (!/^\d{8}$/.test(digits)) {
    throw new Error('Informe um CEP com 8 dígitos.');
  }

  let notFound = false;
  const providers = [
    `https://brasilapi.com.br/api/cep/v2/${digits}`,
    `https://viacep.com.br/ws/${digits}/json/`,
  ];
  for (const url of providers) {
    if (signal?.aborted) throw new Error('Consulta cancelada.');
    try {
      const response = await fetch(url, { signal });
      if (response.status === 404) {
        notFound = true;
        continue;
      }
      if (!response.ok) continue;
      const data = await response.json();
      if (data?.erro) {
        notFound = true;
        continue;
      }
      const city = data?.city ?? data?.localidade;
      const state = data?.state ?? data?.uf;
      if (typeof city !== 'string' || typeof state !== 'string') continue;
      return {
        street: typeof (data.street ?? data.logradouro) === 'string' ? (data.street ?? data.logradouro) : '',
        neighborhood: typeof (data.neighborhood ?? data.bairro) === 'string' ? (data.neighborhood ?? data.bairro) : '',
        city,
        state,
      };
    } catch {
      if (signal?.aborted) throw new Error('Consulta cancelada.');
      // A falha de uma fonte não deve impedir a consulta na outra.
    }
  }
  throw new Error(notFound
    ? 'CEP não encontrado. Confira o número informado.'
    : 'Não foi possível consultar o CEP. Verifique sua conexão e tente novamente.');
}
