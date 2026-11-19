import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppState, View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../context/CartContext';
import { OrderContext } from '../context/OrderContext';
import { AuthContext } from '../context/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { AddressBook } from '../components/AddressBook';
import { PaymentMethodBook } from '../components/PaymentMethodBook';
import QRCode from 'react-native-qrcode-svg';
import * as Crypto from 'expo-crypto';
import { deliveryAddress, getSavedAddresses, isValidAddress } from '../services/addressService';
import { getSavedPaymentMethods } from '../services/paymentMethodService';
import { findAddressByZipCode } from '../services/zipCodeService';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatCurrency } from '../utils/currency';
import { Address, Order, SavedPaymentMethod } from '../types';
import { createOrderConfirmation, readOrderConfirmation } from '../config/orderConfirmation';

export function CheckoutScreen({ navigation }: any) {
  const { items, subtotal, clearCart, coupon, applyCoupon, removeCoupon } = useContext(CartContext);
  const { addOrder } = useContext(OrderContext);
  const { user } = useContext(AuthContext);

  const [address, setAddress] = useState<Address>({
    street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: ''
  });
  const addressEdited = useRef(false);
  const savedZipCode = useRef<string | null>(null);
  const [addressBook, setAddressBook] = useState<'choose' | 'save' | null>(null);
  const [isLookingUpZipCode, setIsLookingUpZipCode] = useState(false);
  const [zipCodeMessage, setZipCodeMessage] = useState('');
  const [zipCodeError, setZipCodeError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit' | 'debit'>('pix');
  const [selectedCard, setSelectedCard] = useState<SavedPaymentMethod | null>(null);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [confirmationUrl, setConfirmationUrl] = useState('');
  const [confirmationToken, setConfirmationToken] = useState('');
  const [confirmationError, setConfirmationError] = useState('');
  const [isCreatingConfirmation, setIsCreatingConfirmation] = useState(false);
  const [confirmationReady, setConfirmationReady] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<'confirmed' | 'declined' | null>(null);
  const confirmationStarted = useRef(false);
  const confirmationAmount = useRef<number | null>(null);
  const confirmationDeadline = useRef<number | null>(null);
  const handledConfirmationToken = useRef('');
  const discount = paymentMethod === 'pix' ? subtotal * 0.10 : 0;
  const freeShipping = coupon?.freeShipping && subtotal >= 100;
  const shipping = freeShipping ? 0 : (address.state.toUpperCase() === 'PR' ? 15.00 : 25.00);
  const total = subtotal + shipping - discount;
  const initialPixTotal = useRef(total);

  const requestConfirmationQR = React.useCallback(async (amount: number) => {
    if (confirmationStarted.current) return;
    confirmationStarted.current = true;
    confirmationAmount.current = amount;
    const token = Crypto.randomUUID();
    setConfirmationToken(token);
    setConfirmationUrl(`https://toymania-confirmacao-pedido.contentflag5.chatgpt.site/confirm/${token}?amount=${encodeURIComponent(amount.toFixed(2))}`);
    confirmationDeadline.current = Date.now() + 10 * 60 * 1000;
    setConfirmationReady(true);
    setIsCreatingConfirmation(true);
    setConfirmationError('');
    try {
      await createOrderConfirmation(amount, token);
      setConfirmationReady(true);
    } catch (error) {
      setConfirmationError(error instanceof Error ? error.message : 'Não foi possível gerar o QR Code.');
    } finally {
      setIsCreatingConfirmation(false);
    }
  }, []);

  useEffect(() => {
    if (paymentMethod === 'pix') void requestConfirmationQR(initialPixTotal.current);
  }, [paymentMethod, requestConfirmationQR]);

  const closePaymentMethods = async () => {
    if (user) {
      try {
        const methods = await getSavedPaymentMethods(user.id);
        const updated = methods.find(method => method.id === selectedCard?.id) || methods.find(method => method.isDefault) || null;
        setSelectedCard(updated);
      } catch {
        setSelectedCard(null);
      }
    }
    setShowPaymentMethods(false);
  };

  // Carrega o endereço salvo no perfil do usuário
  useEffect(() => {
    let active = true;
    async function loadSavedAddress() {
      if (!user) return;
      const saved = (await getSavedAddresses(user.id)).find(item => item.isDefault);
      if (saved && active && !addressEdited.current) {
        savedZipCode.current = saved.zipCode;
        setAddress(deliveryAddress(saved));
      }
    }
    loadSavedAddress().catch(() => {});
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    let active = true;
    if (user) getSavedPaymentMethods(user.id).then(methods => {
      if (active) setSelectedCard(methods.find(method => method.isDefault) || null);
    }).catch(() => {});
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    setZipCodeError('');
    setZipCodeMessage('');
    if (savedZipCode.current === address.zipCode) {
      setIsLookingUpZipCode(false);
      setZipCodeMessage('Endereço salvo selecionado. Confira os dados antes de continuar.');
      return;
    }
    if (address.zipCode.length !== 8) {
      setIsLookingUpZipCode(false);
      return;
    }

    let active = true;
    const controller = new AbortController();
    setIsLookingUpZipCode(true);
    const timeout = setTimeout(() => controller.abort(), 8000);
    const debounce = setTimeout(async () => {
      try {
        const result = await findAddressByZipCode(address.zipCode, controller.signal);
        if (!active || savedZipCode.current === address.zipCode) return;
        setAddress(current => current.zipCode === address.zipCode ? { ...current, ...result } : current);
        setZipCodeMessage(result.street && result.neighborhood
          ? 'Endereço preenchido. Informe o número e, se necessário, o complemento.'
          : 'Cidade e estado preenchidos. Complete os campos restantes.');
      } catch (error) {
        if (!active) return;
        setZipCodeError(controller.signal.aborted
          ? 'A consulta demorou demais. Preencha o endereço manualmente.'
          : error instanceof Error && error.message !== 'Network request failed' && error.message !== 'Failed to fetch'
            ? error.message
            : 'Não foi possível consultar o CEP. Preencha o endereço manualmente.');
      } finally {
        clearTimeout(timeout);
        if (active) setIsLookingUpZipCode(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(debounce);
      clearTimeout(timeout);
      controller.abort();
    };
  }, [address.zipCode]);

  const updateAddress = (field: keyof typeof address, value: string) => {
    addressEdited.current = true;
    if (field === 'zipCode') savedZipCode.current = null;
    setAddress(current => field === 'zipCode' && current.zipCode !== value
      ? { ...current, zipCode: value, street: '', neighborhood: '', city: '', state: '' }
      : { ...current, [field]: value });
  };

  const handleApplyCoupon = () => {
    const success = applyCoupon(couponCode);
    if (!success) {
      setCouponError('Cupom inválido.');
    } else {
      setCouponError('');
      setCouponCode('');
    }
  };

  const handleConfirmOrder = async () => {
    if (paymentMethod === 'credit' && !selectedCard) {
      Alert.alert('Escolha um cartão', 'Selecione um cartão de demonstração antes de continuar.');
      setShowPaymentMethods(true);
      return;
    }
    if (isLookingUpZipCode) return;
    if (!isValidAddress(address)) {
      Alert.alert('Atenção', 'Por favor, preencha o endereço completo.');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const newOrder: Order = {
        id: String(Date.now()),
        date: new Date().toISOString(),
        items: [...items],
        total,
        paymentMethod,
        paymentMethodLabel: paymentMethod === 'credit' && selectedCard
          ? `${selectedCard.brand} final ${selectedCard.lastFour} (demonstração)`
          : paymentMethod === 'pix' ? 'Pix' : 'Cartão de crédito (demonstração)',
        status: 'paid',
        address: { ...address },
      };

      addOrder(newOrder);
      clearCart();
      setIsLoading(false);
      navigation.replace('OrderSuccess', { orderId: newOrder.id });
    }, 1000);
  };

  const finishConfirmedOrder = React.useCallback(() => {
    if (!isValidAddress(address) || !confirmationToken) return;
    setIsLoading(true);
    const newOrder: Order = {
      id: String(Date.now()), date: new Date().toISOString(), items: [...items], total: confirmationAmount.current ?? total, paymentMethod,
      paymentMethodLabel: 'Pix (demonstração, sem cobrança)', status: 'confirmed', address: { ...address },
    };
    addOrder(newOrder);
    clearCart();
    navigation.replace('OrderSuccess', { orderId: newOrder.id });
  }, [address, confirmationToken, paymentMethod, items, total, addOrder, clearCart, navigation]);

  const showPaymentResult = React.useCallback((result: 'confirmed' | 'declined') => {
    if (!confirmationToken || handledConfirmationToken.current === confirmationToken) return;
    handledConfirmationToken.current = confirmationToken;
    setConfirmationResult(result);
    if (result === 'declined') setConfirmationError('Pagamento não efetuado. O pedido continua no checkout.');
  }, [confirmationToken]);

  useEffect(() => {
    if (!confirmationToken || !confirmationReady || paymentMethod !== 'pix') return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    let checking = false;
    const poll = async () => {
      if (checking) return;
      checking = true;
      try {
        const status = await readOrderConfirmation(confirmationToken);
        if (!active) return;
        if (status === 'confirmed') showPaymentResult('confirmed');
        else if (status === 'declined') showPaymentResult('declined');
        else if (status === 'expired' || (confirmationDeadline.current && Date.now() >= confirmationDeadline.current)) setConfirmationError('Este QR Code expirou. Gere um novo para continuar.');
        else timer = setTimeout(poll, 1800);
      } catch {
        if (active) timer = setTimeout(poll, 3000);
      } finally {
        checking = false;
      }
    };
    timer = setTimeout(poll, 1800);
    const appStateSubscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active' && active) {
        clearTimeout(timer);
        void poll();
      }
    });
    return () => { active = false; clearTimeout(timer); appStateSubscription.remove(); };
  }, [confirmationToken, confirmationReady, paymentMethod, showPaymentResult]);

  const handleRequestPayment = () => {
    if (paymentMethod !== 'pix') {
      handleConfirmOrder();
      return;
    }
    if (isLookingUpZipCode || !isValidAddress(address)) {
      handleConfirmOrder();
      return;
    }
    Alert.alert('Aguardando confirmação', 'Escaneie o QR Code com outro celular e confirme o pedido nele. Esta demonstração não realiza pagamentos.');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Finalizar Compra" onBack={() => navigation.goBack()} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
        {user && <Pressable style={styles.addressAction} accessibilityRole="button" onPress={() => setAddressBook('choose')}>
          <Text style={styles.addressLink}>Escolher endereço salvo</Text>
        </Pressable>}
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="CEP"
            accessibilityLabel="CEP"
            value={address.zipCode.replace(/(\d{5})(\d)/, '$1-$2')}
            onChangeText={(text) => updateAddress('zipCode', text.replace(/\D/g, '').slice(0, 8))}
            keyboardType="numeric"
            maxLength={9}
          />
          <Text style={[styles.zipCodeHint, zipCodeError ? styles.zipCodeError : null]} accessibilityLiveRegion="polite">
            {isLookingUpZipCode ? 'Buscando endereço...' : zipCodeError || zipCodeMessage || 'Digite os 8 dígitos do CEP para preencher o endereço.'}
          </Text>
          <TextInput style={styles.input} placeholder="Rua / Avenida" value={address.street} onChangeText={(t) => updateAddress('street', t)} editable={!isLookingUpZipCode} />
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1, marginRight: spacing.sm }]} placeholder="Número" value={address.number} onChangeText={(t) => updateAddress('number', t)} keyboardType="numeric" />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Bairro" value={address.neighborhood} onChangeText={(t) => updateAddress('neighborhood', t)} editable={!isLookingUpZipCode} />
          </View>
          <TextInput style={styles.input} placeholder="Complemento (opcional)" value={address.complement} onChangeText={(t) => updateAddress('complement', t)} />
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1, marginRight: spacing.sm }]} placeholder="Cidade" value={address.city} onChangeText={(t) => updateAddress('city', t)} editable={!isLookingUpZipCode} />
            <TextInput style={[styles.input, { width: 80 }]} placeholder="UF" value={address.state} onChangeText={(t) => updateAddress('state', t.toUpperCase())} maxLength={2} autoCapitalize="characters" editable={!isLookingUpZipCode} />
          </View>
          {user && <Pressable style={styles.addressAction} accessibilityRole="button" disabled={isLookingUpZipCode} onPress={() => {
            if (!isValidAddress(address)) { Alert.alert('Complete o endereço', 'Preencha os campos do endereço antes de salvar.'); return; }
            setAddressBook('save');
          }}><Text style={styles.addressLink}>Salvar este endereço para próximas compras</Text></Pressable>}
        </View>

        <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
        <View style={styles.card}>
          <Pressable style={[styles.paymentOption, paymentMethod === 'pix' && styles.paymentOptionActive]} onPress={() => setPaymentMethod('pix')}>
            <Ionicons name="qr-code-outline" size={24} color={paymentMethod === 'pix' ? colors.primary : colors.textLight} />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Pix</Text>
              <Text style={styles.paymentDiscount}>10% de desconto</Text>
            </View>
            <Ionicons name={paymentMethod === 'pix' ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.primary} />
          </Pressable>
          {paymentMethod === 'pix' && <View style={styles.pixPanel}>
            <Text style={styles.pixTitle}>Pagar compra na Toy Mania</Text>
            <Text style={styles.pixAmount}>{formatCurrency(confirmationAmount.current ?? total)}</Text>
            {confirmationUrl ? <QRCode value={confirmationUrl} size={230} ecl="H" quietZone={12} /> : <Text style={styles.pixExplanation}>Preparando QR Code…</Text>}
            {isCreatingConfirmation && <Text style={styles.pixExplanation}>Conectando a confirmação ao aplicativo…</Text>}
            <Text style={styles.pixQuestion}>Escaneie com outro celular</Text>
            <Text style={styles.pixExplanation}>No outro celular, escolha Sim ou Não para confirmar o pedido. Nenhum pagamento será realizado.</Text>
            {confirmationError ? <Text style={styles.pixDemoLabel}>{confirmationError}</Text> : null}
            {confirmationResult && <View style={[styles.paymentResultCard, confirmationResult === 'declined' && styles.paymentResultCardDeclined]} accessibilityLiveRegion="assertive">
              <Ionicons name={confirmationResult === 'confirmed' ? 'checkmark-circle' : 'close-circle'} size={34} color={confirmationResult === 'confirmed' ? colors.success : colors.error} />
              <Text style={[styles.paymentResultTitle, confirmationResult === 'declined' && styles.paymentResultTitleDeclined]}>
                {confirmationResult === 'confirmed' ? 'Pagamento efetuado' : 'Pagamento não efetuado'}
              </Text>
              <Text style={styles.paymentResultText}>
                {confirmationResult === 'confirmed' ? 'Confirmação simulada. Nenhum valor foi cobrado.' : 'O pedido continua no checkout e não foi finalizado.'}
              </Text>
              {confirmationResult === 'confirmed'
                ? <Pressable style={styles.paymentResultButton} onPress={finishConfirmedOrder}><Text style={styles.paymentResultButtonText}>Finalizar compra</Text></Pressable>
                : <Pressable style={styles.paymentResultButton} onPress={() => setConfirmationResult(null)}><Text style={styles.paymentResultButtonText}>Entendi</Text></Pressable>}
            </View>}
            {confirmationToken && (confirmationError || confirmationReady) && <Pressable style={styles.addressAction} onPress={() => { confirmationStarted.current = false; confirmationAmount.current = null; setConfirmationReady(false); setConfirmationError(''); void requestConfirmationQR(total); }}><Text style={styles.addressLink}>{confirmationError ? 'Tentar gerar novamente' : 'Gerar novo QR Code'}</Text></Pressable>}
          </View>}

          <Pressable style={[styles.paymentOption, paymentMethod === 'credit' && styles.paymentOptionActive]} onPress={() => setPaymentMethod('credit')}>
            <Ionicons name="card-outline" size={24} color={paymentMethod === 'credit' ? colors.primary : colors.textLight} />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Cartão de crédito · demonstração</Text>
              <Text style={styles.paymentSubtitle}>{selectedCard ? `${selectedCard.brand} final ${selectedCard.lastFour}` : 'Nenhum cartão de teste selecionado'}</Text>
            </View>
            <Ionicons name={paymentMethod === 'credit' ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.primary} />
          </Pressable>
          {paymentMethod === 'credit' && user && <Pressable style={styles.addressAction} accessibilityRole="button" onPress={() => setShowPaymentMethods(true)}>
            <Text style={styles.addressLink}>{selectedCard ? 'Escolher outro cartão de teste' : 'Selecionar um cartão de teste'}</Text>
          </Pressable>}
          <Text style={styles.paymentDemoHint}>O pagamento por cartão está em modo de demonstração e não realiza cobranças.</Text>
        </View>

        <Text style={styles.sectionTitle}>Cupom de Desconto</Text>
        <View style={styles.card}>
          {!coupon ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput 
                  style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                  placeholder="Digite o cupom" 
                  value={couponCode} 
                  onChangeText={setCouponCode} 
                  autoCapitalize="characters" 
                />
                <Pressable 
                  style={{ backgroundColor: colors.primary, padding: 10, borderRadius: 8, marginLeft: 8 }} 
                  onPress={handleApplyCoupon}
                >
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Aplicar</Text>
                </Pressable>
              </View>
              {couponError ? <Text style={{ color: colors.error, marginTop: 5 }}>{couponError}</Text> : null}
            </>
          ) : (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Cupom {coupon.code} aplicado!</Text>
              <Pressable onPress={removeCoupon}>
                <Ionicons name="close-circle" size={22} color={colors.error} />
              </Pressable>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
        <View style={styles.card}>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Produtos</Text><Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Frete ({address.state})</Text><Text style={styles.summaryValue}>{freeShipping ? 'Grátis' : formatCurrency(shipping)}</Text></View>
          {discount > 0 && <View style={styles.summaryRow}><Text style={styles.summaryLabelDiscount}>Desconto Pix</Text><Text style={styles.summaryValueDiscount}>- {formatCurrency(discount)}</Text></View>}
          <View style={[styles.summaryRow, { marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm }]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        <PrimaryButton title={isLoading ? "Processando..." : paymentMethod === 'pix' ? "Aguardando confirmação no outro celular" : "Confirmar Pedido"} onPress={handleRequestPayment} isLoading={isLoading} disabled={isLoading || isLookingUpZipCode || paymentMethod === 'pix'} />
      </ScrollView>
      {user && addressBook && <AddressBook key={user.id} userId={user.id}
        initialAddress={addressBook === 'save' ? address : undefined}
        onClose={() => setAddressBook(null)}
        onSelect={selected => {
          addressEdited.current = true;
          savedZipCode.current = selected.zipCode;
          setAddress(deliveryAddress(selected));
          setZipCodeError('');
          setZipCodeMessage('Endereço salvo selecionado. Confira os dados antes de continuar.');
          setIsLookingUpZipCode(false);
          setAddressBook(null);
        }} />}
      {user && showPaymentMethods && <PaymentMethodBook key={`payment-${user.id}`} userId={user.id}
        onClose={closePaymentMethods}
        onSelect={method => {
          setSelectedCard(method);
          setPaymentMethod('credit');
          setShowPaymentMethods(false);
        }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  sectionTitle: { fontSize: typography.sizes.md, fontWeight: 'bold', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.sm },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: spacing.borderRadius.md, marginBottom: spacing.md },
  input: { height: 44, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.sm, fontSize: typography.sizes.md, color: colors.text },
  zipCodeHint: { color: colors.textLight, fontSize: typography.sizes.xs, marginBottom: spacing.md },
  zipCodeError: { color: colors.error },
  addressAction: { minHeight: 44, justifyContent: 'center', marginBottom: spacing.sm },
  addressLink: { color: colors.primary, fontSize: typography.sizes.sm, fontWeight: 'bold' },
  row: { flexDirection: 'row' },
  paymentOption: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: spacing.borderRadius.sm, marginBottom: spacing.sm },
  paymentOptionActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  paymentInfo: { flex: 1, marginLeft: spacing.sm },
  paymentTitle: { fontSize: typography.sizes.md, fontWeight: 'bold', color: colors.text },
  paymentDiscount: { fontSize: typography.sizes.xs, color: colors.success, fontWeight: 'bold' },
  paymentSubtitle: { fontSize: typography.sizes.xs, color: colors.textLight },
  paymentDemoHint: { fontSize: typography.sizes.xs, color: colors.textLight, lineHeight: 18 },
  pixPanel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.sm },
  pixTitle: { color: colors.text, fontSize: typography.sizes.md, fontWeight: 'bold', textAlign: 'center', marginBottom: spacing.xs },
  pixAmount: { color: colors.primary, fontSize: typography.sizes.xl, fontWeight: 'bold', marginBottom: spacing.md },
  pixDemoLabel: { color: colors.error, fontSize: typography.sizes.xs, fontWeight: 'bold', textAlign: 'center', marginTop: spacing.sm },
  pixQuestion: { color: colors.text, fontSize: typography.sizes.md, fontWeight: 'bold', textAlign: 'center', marginTop: spacing.md },
  pixExplanation: { color: colors.textLight, fontSize: typography.sizes.xs, textAlign: 'center', lineHeight: 18, marginTop: spacing.xs },
  paymentResultCard: { width: '100%', alignItems: 'center', backgroundColor: '#EAF8F0', borderRadius: spacing.borderRadius.md, padding: spacing.md, marginTop: spacing.md },
  paymentResultCardDeclined: { backgroundColor: '#FFF0F0' },
  paymentResultTitle: { color: colors.success, fontSize: typography.sizes.md, fontWeight: 'bold', marginTop: spacing.xs },
  paymentResultTitleDeclined: { color: colors.error },
  paymentResultText: { color: colors.text, fontSize: typography.sizes.sm, textAlign: 'center', lineHeight: 20, marginTop: spacing.xs },
  paymentResultButton: { minHeight: 46, minWidth: 190, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary, borderRadius: spacing.borderRadius.sm, paddingHorizontal: spacing.md, marginTop: spacing.md },
  paymentResultButtonText: { color: '#FFF', fontSize: typography.sizes.sm, fontWeight: 'bold' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  summaryLabel: { fontSize: typography.sizes.sm, color: colors.textLight },
  summaryValue: { fontSize: typography.sizes.sm, color: colors.text },
  summaryLabelDiscount: { fontSize: typography.sizes.sm, color: colors.success },
  summaryValueDiscount: { fontSize: typography.sizes.sm, color: colors.success, fontWeight: 'bold' },
  summaryTotalLabel: { fontSize: typography.sizes.md, fontWeight: 'bold', color: colors.text },
  summaryTotalValue: { fontSize: typography.sizes.lg, fontWeight: 'bold', color: colors.primary },
});
