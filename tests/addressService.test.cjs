const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/services/addressService.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText;

function setup(seed = {}) {
  const data = new Map(Object.entries(seed));
  const storage = { getItem: async key => data.get(key) ?? null, setItem: async (key, value) => { data.set(key, value); } };
  const context = { exports: {}, require: name => {
    assert.equal(name, '@react-native-async-storage/async-storage');
    return storage;
  } };
  vm.runInNewContext(compiled, context);
  return { ...context.exports, storage };
}

const home = { id: 'home', label: 'Casa', isDefault: false, zipCode: '01001-000', street: 'Praça da Sé', number: '100', complement: 'Apto 2', neighborhood: 'Sé', city: 'São Paulo', state: 'SP' };

test('persists addresses separately for each account and defaults the first address', async () => {
  const service = setup();
  await service.saveAddress('alice', home);
  const [saved] = await service.getSavedAddresses('alice');
  assert.equal(saved.zipCode, '01001000');
  assert.equal(saved.isDefault, true);
  assert.equal((await service.getSavedAddresses('bob')).length, 0);
});

test('edits without duplicating and maintains exactly one default', async () => {
  const service = setup();
  await service.saveAddress('alice', home);
  await service.saveAddress('alice', { ...home, id: 'work', label: 'Trabalho', isDefault: true });
  await service.saveAddress('alice', { ...home, number: '200' });
  const list = await service.getSavedAddresses('alice');
  assert.equal(list.length, 2);
  assert.equal(list.find(item => item.id === 'home').number, '200');
  assert.equal(list.filter(item => item.isDefault).length, 1);
  assert.equal(list.find(item => item.isDefault).id, 'work');
});

test('deleting the default promotes a remaining address and supports deleting the last', async () => {
  const service = setup();
  await service.saveAddress('alice', home);
  await service.saveAddress('alice', { ...home, id: 'work' });
  const next = await service.removeAddress('alice', 'home');
  assert.equal(next[0].id, 'work');
  assert.equal(next[0].isDefault, true);
  await service.removeAddress('alice', 'work');
  assert.equal((await service.getSavedAddresses('alice')).length, 0);
});

test('migrates legacy address once and does not resurrect it after deletion', async () => {
  const service = setup({ '@ToyMania:address:alice': JSON.stringify(home) });
  const [migrated] = await service.getSavedAddresses('alice');
  assert.equal(migrated.label, 'Casa');
  assert.equal(migrated.zipCode, '01001000');
  await service.removeAddress('alice', migrated.id);
  assert.equal((await service.getSavedAddresses('alice')).length, 0);
});

test('rejects incomplete addresses and storage failures', async () => {
  const service = setup();
  await assert.rejects(service.saveAddress('alice', { ...home, state: 'ZZ' }), /campos obrigatórios/);
  await assert.rejects(service.saveAddress('alice', { ...home, label: ' ' }), /campos obrigatórios/);
  service.storage.setItem = async () => { throw new Error('Disk full'); };
  await assert.rejects(service.saveAddress('alice', home), /Disk full/);
});

test('delivery snapshot preserves apartment and number without book metadata', () => {
  const service = setup();
  const address = service.deliveryAddress(home);
  assert.equal(address.number, '100');
  assert.equal(address.complement, 'Apto 2');
  assert.equal(address.id, undefined);
  assert.equal(address.isDefault, undefined);
});
