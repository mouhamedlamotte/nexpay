import * as crypto from 'crypto';

const waveWebhookConfig = {
  providerId: 'clxxx_wave_provider_id',
  authType: 'hmac',
  header: 'Wave-Signature',
  prefix: null,
  secret: 'wave_sn_WHS_test123secret456key789abc',
  algo: 'sha256',
  encoding: 'hex',
  timestampTolerance: 300, // 5 minutes
  bodyFormat: 'timestampPlusBody',
  isActive: true,
};

/**
 * Body du webhook (doit être exactement comme ça, sans modification)
 */
const webhookBody = {
  id: 'AE_test123xyz',
  type: 'checkout.session.completed',
  data: {
    id: 'cos-1b01test123',
    amount: '5000',
    checkout_status: 'complete',
    client_reference: 'NEXPAY_TX_C206FDF1B4384E49',
    currency: 'XOF',
    error_url: 'https://example.com/error',
    last_payment_error: null,
    business_name: 'Test Business',
    payment_status: 'succeeded',
    success_url: 'https://example.com/success',
    wave_launch_url: 'https://pay.wave.com/c/cos-1b01test123',
    when_completed: '2024-11-02T14:30:45Z',
    when_created: '2024-11-02T14:30:30Z',
    when_expires: '2024-11-03T14:30:30Z',
    transaction_id: 'TCN_TEST123',
  },
};

// ============================================
// SCRIPT DE GÉNÉRATION DE SIGNATURE
// ============================================

function generateWaveSignature(
  secret: string,
  body: object,
  timestampOverride?: number,
): { header: string; timestamp: number; body: string } {
  // Timestamp actuel ou override pour les tests
  const timestamp = timestampOverride || Math.floor(Date.now() / 1000);

  // Convertir le body en string (exactement comme il sera envoyé)
  const bodyString = JSON.stringify(body);

  // Construire le payload: timestamp + body
  const payload = timestamp.toString() + bodyString;

  // Calculer le HMAC-SHA256
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const signature = hmac.digest('hex');

  // Construire le header Wave-Signature
  const header = `t=${timestamp},v1=${signature}`;

  return {
    header,
    timestamp,
    body: bodyString,
  };
}

console.log('='.repeat(60));
console.log('WAVE WEBHOOK - DONNÉES DE TEST');
console.log('='.repeat(60));

// Test 1: Signature valide

function testSignature() {
  const validSignature = generateWaveSignature(
    waveWebhookConfig.secret,
    webhookBody,
  );

  console.log('\n✅ TEST 1: Signature Valide (timestamp actuel)');
  console.log('-'.repeat(60));
  console.log('Header à envoyer:');
  console.log(`Wave-Signature: ${validSignature.header}`);
  console.log('\nBody à envoyer (exactement comme ça):');
  console.log(validSignature.body);
}

testSignature();
