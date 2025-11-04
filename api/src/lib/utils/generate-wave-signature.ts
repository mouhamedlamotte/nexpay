import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

function getEncryptionKey(): Buffer {
  // Si la clé est en hex (recommandé)
  if (process.env.ENCRYPTION_KEY.length === 64) {
    return Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  }
  // Si la clé est une string, on la dérive avec SHA-256
  return crypto
    .createHash('sha256')
    .update(process.env.ENCRYPTION_KEY)
    .digest();
}

/**
 * Déchiffre des données sensibles
 * @param encryptedData Données chiffrées
 * @returns Données déchiffrées
 */
async function decryptSensitiveData(encryptedData: string): Promise<string> {
  try {
    if (!encryptedData || encryptedData.trim().length === 0) {
      throw new Error('Les données chiffrées ne peuvent pas être vides');
    }

    const data = JSON.parse(
      Buffer.from(encryptedData, 'base64').toString('utf8'),
    );
    const { iv, authTag, encrypted } = data;

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      getEncryptionKey(),
      Buffer.from(iv, 'hex'),
    );
    decipher.setAAD(Buffer.from('sensitive-data'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    this.logger.error('Erreur lors du déchiffrement des données:', error);
    throw new Error('Erreur lors du déchiffrement des données');
  }
}

async function getWaveWebhookConfigSecret() {
  const provider = await prisma.paymentProvider.findUnique({
    where: { code: 'wave' },
    include: { webhookConfig: true },
  });

  if (!provider || !provider.webhookConfig) {
    throw new Error('Configuration Wave non trouvée');
  }

  return await decryptSensitiveData(provider.webhookConfig.secret);
}

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
    client_reference: 'NEXPAY_TX_8F1C3B9AA74246F6',
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

async function testSignature() {
  const secret = await getWaveWebhookConfigSecret();
  const validSignature = generateWaveSignature(secret, webhookBody);

  console.log('\n✅ TEST 1: Signature Valide (timestamp actuel)');
  console.log('-'.repeat(60));
  console.log('Header à envoyer:');
  console.log(`Wave-Signature: ${validSignature.header}`);
  console.log('\nBody à envoyer (exactement comme ça):');
  console.log(JSON.stringify(webhookBody, null, 2));
}

testSignature();
