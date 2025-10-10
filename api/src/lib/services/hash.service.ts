import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

@Injectable()
export class HashService {
  private readonly logger = new Logger(HashService.name);
  // Configuration Argon2 optimisée pour la production
  private readonly argonOptions: argon2.Options = {
    type: argon2.argon2id, // Recommandé pour la résistance aux attaques
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3, // 3 itérations
    parallelism: 1, // 1 thread
  };

  // Clé de chiffrement pour les données sensibles (à déplacer dans les variables d'environnement)
  private readonly encryptionKey = this.getEncryptionKey();

  // Et ajoute cette méthode privée :
  private getEncryptionKey(): Buffer {
    if (process.env.ENCRYPTION_KEY) {
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

    // Fallback : génère une clé temporaire (développement uniquement)
    this.logger.warn("⚠️ Génération d'une clé de chiffrement temporaire");
    return crypto.randomBytes(32);
  }

  // Aussi, améliore la méthode isEncryptionConfigured() :
  isEncryptionConfigured(): boolean {
    if (!process.env.ENCRYPTION_KEY) return false;

    // Vérification pour clé hex (64 caractères = 32 bytes)
    if (process.env.ENCRYPTION_KEY.length === 64) {
      return /^[0-9a-fA-F]{64}$/.test(process.env.ENCRYPTION_KEY);
    }

    // Ou au minimum 32 caractères pour une string
    return process.env.ENCRYPTION_KEY.length >= 32;
  }
  private readonly algorithm = 'aes-256-gcm';

  /**
   * Hache un mot de passe avec Argon2
   * @param password Mot de passe en clair
   * @returns Hash du mot de passe
   */
  async hashPassword(password: string): Promise<string> {
    try {
      if (!password || password.trim().length === 0) {
        throw new Error('Le mot de passe ne peut pas être vide');
      }

      return await argon2.hash(password, this.argonOptions);
    } catch (error) {
      this.logger.error('Erreur lors du hachage du mot de passe:', error);
      throw new InternalServerErrorException(
        'Erreur lors du hachage du mot de passe',
      );
    }
  }

  /**
   * Vérifie un mot de passe contre son hash
   * @param password Mot de passe en clair
   * @param hash Hash stocké
   * @returns true si le mot de passe correspond
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      if (!password || !hash) {
        return false;
      }

      return await argon2.verify(hash, password);
    } catch (error) {
      this.logger.error(
        'Erreur lors de la vérification du mot de passe:',
        error,
      );
      return false;
    }
  }

  /**
   * Chiffre des données sensibles (clés API, tokens, etc.)
   * @param data Données à chiffrer
   * @returns Données chiffrées avec IV et tag d'authentification
   */
  async encryptSensitiveData(data: string): Promise<string> {
    try {
      if (!data || data.trim().length === 0) {
        throw new Error('Les données à chiffrer ne peuvent pas être vides');
      }

      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(
        this.algorithm,
        this.encryptionKey,
        iv,
      );
      cipher.setAAD(Buffer.from('sensitive-data'));

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      const result = {
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        encrypted: encrypted,
      };

      return Buffer.from(JSON.stringify(result)).toString('base64');
    } catch (error) {
      this.logger.error('Erreur lors du chiffrement des données:', error);
      throw new InternalServerErrorException(
        'Erreur lors du chiffrement des données',
      );
    }
  }

  /**
   * Déchiffre des données sensibles
   * @param encryptedData Données chiffrées
   * @returns Données déchiffrées
   */
  async decryptSensitiveData(encryptedData: string): Promise<string> {
    try {
      if (!encryptedData || encryptedData.trim().length === 0) {
        throw new Error('Les données chiffrées ne peuvent pas être vides');
      }

      const data = JSON.parse(
        Buffer.from(encryptedData, 'base64').toString('utf8'),
      );
      const { iv, authTag, encrypted } = data;

      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.encryptionKey,
        Buffer.from(iv, 'hex'),
      );
      decipher.setAAD(Buffer.from('sensitive-data'));
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error('Erreur lors du déchiffrement des données:', error);
      throw new InternalServerErrorException(
        'Erreur lors du déchiffrement des données',
      );
    }
  }

  /**
   * Génère un token sécurisé
   * @param length Longueur du token (défaut: 32 bytes)
   * @returns Token sécurisé en hexadécimal
   */
  generateSecureToken(length: number = 32): string {
    try {
      return crypto.randomBytes(length).toString('hex');
    } catch (error) {
      this.logger.error('Erreur lors de la génération du token:', error);
      throw new InternalServerErrorException(
        'Erreur lors de la génération du token',
      );
    }
  }

  /**
   * Génère un hash SHA-256 pour les données non sensibles
   * @param data Données à hasher
   * @returns Hash SHA-256
   */
  generateSHA256Hash(data: string): string {
    try {
      if (!data) {
        throw new Error('Les données ne peuvent pas être vides');
      }

      return crypto.createHash('sha256').update(data).digest('hex');
    } catch (error) {
      this.logger.error('Erreur lors du hachage SHA-256:', error);
      throw new InternalServerErrorException('Erreur lors du hachage SHA-256');
    }
  }

  /**
   * Initialise le service avec des vérifications de sécurité
   */
  onModuleInit() {
    if (!this.isEncryptionConfigured()) {
      this.logger.warn(
        "⚠️  ENCRYPTION_KEY non définie dans les variables d'environnement. Utilisation d'une clé temporaire.",
      );
      this.logger.warn(
        '⚠️  Définissez ENCRYPTION_KEY dans votre .env pour la production.',
      );
    }

    try {
      argon2.hash('test', { ...this.argonOptions, timeCost: 1 });
      this.logger.log('✅ HashService initialisé avec succès');
    } catch (error) {
      this.logger.error("❌ Erreur lors de l'initialisation d'Argon2:", error);
      throw new InternalServerErrorException('HashService non disponible');
    }
  }
}
