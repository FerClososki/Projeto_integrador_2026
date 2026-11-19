const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/services/zipCodeService.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function service(fetch) {
  const context = { exports: {}, fetch };
  vm.runInNewContext(compiled, context);
  return context.exports.findAddressByZipCode;
}

test('normalizes a formatted CEP and maps the delivery address', async () => {
  const controller = new AbortController();
  const lookup = service(async (url, options) => {
    assert.equal(url, 'https://brasilapi.com.br/api/cep/v2/01001000');
    assert.equal(options.signal, controller.signal);
    return { ok: true, json: async () => ({ street: 'Praça da Sé', neighborhood: 'Sé', city: 'São Paulo', state: 'SP' }) };
  });
  const result = await lookup('01001-000', controller.signal);
  assert.deepEqual({ ...result }, { street: 'Praça da Sé', neighborhood: 'Sé', city: 'São Paulo', state: 'SP' });
});

test('does not request an incomplete or malformed CEP', async () => {
  const lookup = service(() => { throw new Error('Unexpected request'); });
  for (const cep of ['', '12345', '123456789', 'abcdefgh']) {
    await assert.rejects(lookup(cep), /8 dígitos/);
  }
});

test('reports a nonexistent CEP', async () => {
  const lookup = service(async () => ({ ok: true, json: async () => ({ erro: true }) }));
  await assert.rejects(lookup('00000000'), /CEP não encontrado/);
});

test('supports city-wide CEPs without street or neighborhood', async () => {
  const lookup = service(async () => ({ ok: true, json: async () => ({ localidade: 'Cidade', uf: 'PR' }) }));
  const result = await lookup('12345678');
  assert.deepEqual({ ...result }, { street: '', neighborhood: '', city: 'Cidade', state: 'PR' });
});

test('reports server errors and malformed responses instead of filling invalid fields', async () => {
  await assert.rejects(service(async () => ({ ok: false }))('12345678'), /Verifique sua conexão/);
  await assert.rejects(service(async () => ({ ok: true, json: async () => ({}) }))('12345678'), /Verifique sua conexão/);
});

test('reports connection failures in Portuguese when both providers fail', async () => {
  let calls = 0;
  const lookup = service(async () => { calls++; throw new Error('Network request failed'); });
  await assert.rejects(lookup('12345678'), /Verifique sua conexão/);
  assert.equal(calls, 2);
});

test('falls back to ViaCEP if the first provider fails with a network or certificate error', async () => {
  const urls = [];
  const lookup = service(async url => {
    urls.push(url);
    if (urls.length === 1) throw new Error('Network request failed');
    return { ok: true, json: async () => ({ logradouro: 'Rua Veríssimo Marques', bairro: 'Centro', localidade: 'São José dos Pinhais', uf: 'PR' }) };
  });
  const address = await lookup('83005-410');
  assert.equal(address.street, 'Rua Veríssimo Marques');
  assert.deepEqual(urls, ['https://brasilapi.com.br/api/cep/v2/83005410', 'https://viacep.com.br/ws/83005410/json/']);
});

test('does not start a fallback request after cancellation', async () => {
  const controller = new AbortController();
  let calls = 0;
  const lookup = service(async () => {
    calls++;
    controller.abort();
    throw new Error('Aborted');
  });
  await assert.rejects(lookup('83005410', controller.signal), /cancelada/);
  assert.equal(calls, 1);
});
