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
const currentSecret = waveWebhookConfig.secret;
const oldSecret = 'wave_sn_WHS_old_secret_123';

function generateMultipleSignatures(
  secrets: string[],
  body: object,
  timestamp: number,
): string {
  const bodyString = JSON.stringify(body);
  const payload = timestamp.toString() + bodyString;

  const signatures = secrets.map((secret) => {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    return `v1=${hmac.digest('hex')}`;
  });

  return `t=${timestamp},${signatures.join(',')}`;
}

// Test 1: Signature valide

function testSignature() {
  const multiSignatureTimestamp = Math.floor(Date.now() / 1000);
  const multiSignatureHeader = generateMultipleSignatures(
    [currentSecret, oldSecret],
    webhookBody,
    multiSignatureTimestamp,
  );

  console.log('\n\n✅ TEST 4: Multiple Signatures (rotation de clés)');
  console.log('-'.repeat(60));
  console.log('Header à envoyer:');
  console.log(`Wave-Signature: ${multiSignatureHeader}`);
  console.log('\nBody à envoyer:');
  console.log(JSON.stringify(webhookBody, null, 2));
}

testSignature();
