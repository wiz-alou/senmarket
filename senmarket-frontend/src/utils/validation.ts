// ==================================================
// src/utils/validation.ts - FICHIER COMPLET
// ==================================================

export const SENEGAL_VALIDATIONS = {
  phone: /^\+221[0-9]{9}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
  name: /^[a-zA-ZÀ-ÿ\s]{2,50}$/,
} as const;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// ==================================================
// FORMATAGE TÉLÉPHONE
// ==================================================

export const formatSenegalPhone = (phone: string): string => {
  if (!phone) return phone;
  
  // Nettoyer complètement
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  
  console.log('📞 [FORMAT] Téléphone nettoyé:', cleaned);
  
  // Cas 1: 777080757 → +221777080757
  if (/^(77|76|75|78|70)\d{7}$/.test(cleaned)) {
    const formatted = '+221' + cleaned;
    console.log('📞 [FORMAT] Format local → international:', formatted);
    return formatted;
  }
  
  // Cas 2: 221777080757 → +221777080757  
  if (/^221(77|76|75|78|70)\d{7}$/.test(cleaned)) {
    const formatted = '+' + cleaned;
    console.log('📞 [FORMAT] Ajout du +:', formatted);
    return formatted;
  }
  
  // Cas 3: +221777080757 → OK
  if (/^\+221(77|76|75|78|70)\d{7}$/.test(phone)) {
    console.log('📞 [FORMAT] Déjà correct:', phone);
    return phone;
  }
  
  console.log('📞 [FORMAT] Format non reconnu, retour tel quel:', phone);
  return phone;
};

// ==================================================
// VALIDATIONS
// ==================================================

export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'Numéro requis' };
  }
  
  const formatted = formatSenegalPhone(phone);
  if (!SENEGAL_VALIDATIONS.phone.test(formatted)) {
    return { isValid: false, error: 'Format: +221XXXXXXXXX' };
  }
  return { isValid: true };
};

export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: true }; // Email optionnel
  }
  if (!SENEGAL_VALIDATIONS.email.test(email)) {
    return { isValid: false, error: 'Email invalide' };
  }
  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Mot de passe requis' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Minimum 6 caractères' };
  }
  if (!SENEGAL_VALIDATIONS.password.test(password)) {
    return { 
      isValid: false, 
      error: 'Doit contenir majuscule, minuscule et chiffre' 
    };
  }
  return { isValid: true };
};

export const validateName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, error: 'Nom requis' };
  }
  if (name.length < 2) {
    return { isValid: false, error: 'Minimum 2 caractères' };
  }
  if (name.length > 50) {
    return { isValid: false, error: 'Maximum 50 caractères' };
  }
  if (!SENEGAL_VALIDATIONS.name.test(name)) {
    return { isValid: false, error: 'Nom invalide (lettres et espaces uniquement)' };
  }
  return { isValid: true };
};

// ==================================================
// VALIDATIONS SIMPLIFIÉES POUR LOGIN
// ==================================================

export const validateLoginForm = (phone: string, password: string) => {
  const errors: { [key: string]: string } = {};

  // Validation téléphone
  const phoneValidation = validatePhone(phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error!;
  }

  // Validation mot de passe (plus simple pour login)
  if (!password) {
    errors.password = 'Mot de passe requis';
  } else if (password.length < 6) {
    errors.password = 'Minimum 6 caractères';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ==================================================
// VALIDATIONS POUR REGISTER
// ==================================================

export const validateRegisterForm = (data: {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
  confirmPassword: string;
  region: string;
  acceptTerms: boolean;
}) => {
  const errors: { [key: string]: string } = {};

  // Validation prénom
  const firstNameValidation = validateName(data.firstName);
  if (!firstNameValidation.isValid) {
    errors.firstName = firstNameValidation.error!;
  }

  // Validation nom
  const lastNameValidation = validateName(data.lastName);
  if (!lastNameValidation.isValid) {
    errors.lastName = lastNameValidation.error!;
  }

  // Validation téléphone
  const phoneValidation = validatePhone(data.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error!;
  }

  // Validation email (optionnel)
  if (data.email) {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error!;
    }
  }

  // Validation mot de passe
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error!;
  }

  // Validation confirmation mot de passe
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Confirmez votre mot de passe';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas';
  }

  // Validation région
  if (!data.region) {
    errors.region = 'Région requise';
  }

  // Validation CGU
  if (!data.acceptTerms) {
    errors.acceptTerms = 'Vous devez accepter les conditions';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};