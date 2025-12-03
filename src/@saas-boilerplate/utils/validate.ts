/**
 * A utility class providing validation methods for common data types and formats.
 * Implements various validation rules for strings, objects, and common formats like
 * UUIDs, emails, phone numbers, and more.
 *
 * @remarks
 * All methods are static and return boolean values indicating validation results.
 * The class provides comprehensive validation for business-critical data formats
 * and follows common validation patterns.
 *
 * @example
 * ```typescript
 * // Validate an email address
 * const isValid = Validate.isValidEmail('user@example.com');
 *
 * // Check if an object has all required fields
 * const user = { name: 'John', email: 'john@example.com' };
 * const isComplete = Validate.isObjectFullFilled(user);
 *
 * // Validate a phone number
 * const isValidPhone = Validate.isValidPhone('+1234567890');
 * ```
 */
export class Validate {
  /**
   * Validates if a string is a properly formatted UUID.
   *
   * @param uuid - The string to validate as UUID
   * @returns True if the string is a valid UUID, false otherwise
   *
   * @example
   * ```typescript
   * Validate.isValidUUID('123e4567-e89b-12d3-a456-426614174000'); // true
   * Validate.isValidUUID('invalid-uuid'); // false
   * ```
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  /**
   * Checks if an object has all its properties filled with non-empty values.
   *
   * @param obj - The object to validate
   * @param ignoreProps - Array of property names to ignore during validation
   * @returns True if all required properties are filled, false otherwise
   *
   * @example
   * ```typescript
   * const user = { name: 'John', email: '', age: null };
   *
   * Validate.isObjectFullFilled(user); // false
   * Validate.isObjectFullFilled(user, ['email']); // true
   * ```
   */
  static isObjectFullFilled(
    obj: Record<string, any>,
    ignoreProps: string[] = [],
  ): boolean {
    return Object.entries(obj).every(([key, value]) => {
      if (ignoreProps.includes(key)) return true
      if (value === null || value === undefined) return false
      if (typeof value === 'string' && value.trim() === '') return false
      return true
    })
  }

  /**
   * Validates if a string is a properly formatted email address.
   *
   * @param email - The string to validate as email
   * @returns True if the string is a valid email address, false otherwise
   *
   * @example
   * ```typescript
   * Validate.isValidEmail('user@example.com'); // true
   * Validate.isValidEmail('invalid.email'); // false
   * ```
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validates if a string is a properly formatted phone number.
   * Supports various international formats including Brazilian, US, UK, and Chinese numbers.
   *
   * @param phone - The string to validate as phone number
   * @returns True if the string is a valid phone number, false otherwise
   *
   * @example
   * ```typescript
   * Validate.isValidPhone('+5511999999999'); // true - Brazilian format
   * Validate.isValidPhone('1234567890'); // true - Basic format
   * Validate.isValidPhone('invalid'); // false
   * ```
   */
  static isValidPhone(phone: string): boolean {
    if (!phone || phone.length < 8) return false
    if (/[a-zA-Z*]/.test(phone)) return false
    if (/\+{2,}/.test(phone)) return false

    const cleaned = phone.replace(/\D/g, '')

    const patterns = [
      /^[1-9]\d{9}$/, // Formato brasileiro fixo/celular sem DDD
      /^[1-9]\d{10}$/, // Formato brasileiro celular sem DDD
      /^55[1-9]\d{9}$/, // Formato brasileiro fixo/celular com código do país
      /^55[1-9]\d{10}$/, // Formato brasileiro celular com código do país
      /^1\d{10}$/, // Formato EUA/Canadá
      /^44\d{10}$/, // Formato Reino Unido
      /^86\d{11}$/, // Formato China
      /^\d{10,14}$/, // Outros formatos internacionais
    ]

    return patterns.some((pattern) => pattern.test(cleaned))
  }

  /**
   * Validates if a password meets strong password requirements.
   * Password must contain at least one uppercase letter, one lowercase letter,
   * one number, and one special character.
   *
   * @param password - The string to validate as password
   * @returns True if the password meets strength requirements, false otherwise
   *
   * @example
   * ```typescript
   * Validate.isStrongPassword('Abc123!@#'); // true
   * Validate.isStrongPassword('weakpass'); // false
   * ```
   */
  static isStrongPassword(password: string): boolean {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/
    return passwordRegex.test(password)
  }

  /**
   * Validates if a string is a properly formatted URL.
   *
   * @param url - The string to validate as URL
   * @returns True if the string is a valid URL, false otherwise
   *
   * @example
   * ```typescript
   * Validate.isValidURL('https://example.com'); // true
   * Validate.isValidURL('invalid-url'); // false
   * ```
   */
  static isValidURL(url: string): boolean {
    const urlRegex =
      /^(https?:\/\/)?([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}(\/[^\s]*)?$/i
    return url.length > 0 && urlRegex.test(url)
  }

  /**
   * Checks if a number falls within a specified range.
   *
   * @param value - The number to check
   * @param min - The minimum allowed value
   * @param max - The maximum allowed value
   * @returns True if the value is within range, false otherwise
   *
   * @example
   * ```typescript
   * Validate.isInRange(5, 0, 10); // true
   * Validate.isInRange(15, 0, 10); // false
   * ```
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max
  }

  /**
   * Validates if a string's length falls within a specified range.
   *
   * @param str - The string to check
   * @param min - The minimum allowed length
   * @param max - The maximum allowed length
   * @returns True if the string length is within range, false otherwise
   *
   * @example
   * ```typescript
   * Validate.hasValidLength('test', 2, 6); // true
   * Validate.hasValidLength('toolong', 2, 6); // false
   * ```
   */
  static hasValidLength(str: string, min: number, max: number): boolean {
    return str.length >= min && str.length <= max
  }

  /**
   * Validates if a string is a properly formatted Brazilian CPF.
   *
   * @param cpf - The string to validate as CPF
   * @returns True if the string is a valid CPF, false otherwise
   *
   * @example
   * ```typescript
   * Validate.isValidCPF('123.456.789-09'); // true (if valid CPF)
   * Validate.isValidCPF('invalid-cpf'); // false
   * ```
   */
  static isValidCPF(cpf: string): boolean {
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
    if (!cpfRegex.test(cpf)) return false

    const numbers = cpf.replace(/\D/g, '')

    if (new Set(numbers).size === 1) return false

    let sum = 0
    let rest: number

    for (let i = 1; i <= 9; i++) {
      sum = sum + parseInt(numbers.substring(i - 1, i)) * (11 - i)
    }

    rest = (sum * 10) % 11
    if (rest === 10 || rest === 11) rest = 0
    if (rest !== parseInt(numbers.substring(9, 10))) return false

    sum = 0
    for (let i = 1; i <= 10; i++) {
      sum = sum + parseInt(numbers.substring(i - 1, i)) * (12 - i)
    }

    rest = (sum * 10) % 11
    if (rest === 10 || rest === 11) rest = 0
    if (rest !== parseInt(numbers.substring(10, 11))) return false

    return true
  }

  /**
   * Validates if a string is a properly formatted Brazilian CNPJ.
   *
   * @param cnpj - The string to validate as CNPJ
   * @returns True if the string is a valid CNPJ, false otherwise
   *
   * @example
   * ```typescript
   * Validate.isValidCNPJ('12.345.678/0001-90'); // true (if valid CNPJ)
   * Validate.isValidCNPJ('invalid-cnpj'); // false
   * ```
   */
  static isValidCNPJ(cnpj: string): boolean {
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
    if (!cnpjRegex.test(cnpj)) return false

    const numbers = cnpj.replace(/\D/g, '')

    if (new Set(numbers).size === 1) return false

    let size = numbers.length - 2
    let numbers12 = numbers.substring(0, size)
    const dv = numbers.substring(size)
    let sum = 0
    let pos = size - 7

    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers12.charAt(size - i)) * pos--
      if (pos < 2) pos = 9
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    if (result !== parseInt(dv.charAt(0))) return false

    size = size + 1
    numbers12 = numbers.substring(0, size)
    sum = 0
    pos = size - 7

    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers12.charAt(size - i)) * pos--
      if (pos < 2) pos = 9
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    if (result !== parseInt(dv.charAt(1))) return false

    return true
  }

  /**
   * Validates if a string is a properly formatted Brazilian CEP (postal code).
   *
   * @param cep - The string to validate as CEP
   * @returns True if the string is a valid CEP, false otherwise
   *
   * @example
   * ```typescript
   * Validate.isValidCEP('12345-678'); // true
   * Validate.isValidCEP('invalid-cep'); // false
   * ```
   */
  static isValidCEP(cep: string): boolean {
    const cepRegex = /^\d{5}-\d{3}$/
    return cepRegex.test(cep)
  }

  /**
   * Checks if every element in an array satisfies a predicate function.
   *
   * @param array - The array to check
   * @param predicate - The function to test each element
   * @returns True if all elements satisfy the predicate, false otherwise
   *
   * @example
   * ```typescript
   * const numbers = [2, 4, 6, 8];
   * Validate.arrayEvery(numbers, num => num % 2 === 0); // true
   * ```
   */
  static arrayEvery<T>(array: T[], predicate: (value: T) => boolean): boolean {
    return array.every(predicate)
  }

  /**
   * Checks if at least one element in an array satisfies a predicate function.
   *
   * @param array - The array to check
   * @param predicate - The function to test each element
   * @returns True if any element satisfies the predicate, false otherwise
   *
   * @example
   * ```typescript
   * const numbers = [1, 3, 4, 7];
   * Validate.arraySome(numbers, num => num % 2 === 0); // true
   * ```
   */
  static arraySome<T>(array: T[], predicate: (value: T) => boolean): boolean {
    return array.some(predicate)
  }

  /**
   * Checks if a date falls between two other dates.
   *
   * @param date - The date to check
   * @param start - The start of the date range
   * @param end - The end of the date range
   * @returns True if the date is within the range, false otherwise
   *
   * @example
   * ```typescript
   * const date = new Date('2023-06-15');
   * const start = new Date('2023-06-01');
   * const end = new Date('2023-06-30');
   * Validate.isDateBetween(date, start, end); // true
   * ```
   */
  static isDateBetween(date: Date, start: Date, end: Date): boolean {
    return date >= start && date <= end
  }

  /**
   * Checks if a date is in the future relative to the current time.
   *
   * @param date - The date to check
   * @returns True if the date is in the future, false otherwise
   *
   * @example
   * ```typescript
   * const futureDate = new Date('2025-01-01');
   * Validate.isDateInFuture(futureDate); // true
   * ```
   */
  static isDateInFuture(date: Date): boolean {
    return date > new Date()
  }

  /**
   * Checks if a date is in the past relative to the current time.
   *
   * @param date - The date to check
   * @returns True if the date is in the past, false otherwise
   *
   * @example
   * ```typescript
   * const pastDate = new Date('2020-01-01');
   * Validate.isDateInPast(pastDate); // true
   * ```
   */
  static isDateInPast(date: Date): boolean {
    return date < new Date()
  }
}
