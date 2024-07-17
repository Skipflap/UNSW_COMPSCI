/**
 * The solution below uses plain javascript.
 *
 * For a solution using regular expressions (RegEx), @see password.alternative.js
 */
export function checkPassword(password) {
  if (['123456', '123456789', '12345', 'qwerty', 'password'].includes(password)) {
    return 'Horrible Password';
  }

  let hasNumber = false;
  let hasLower = false;
  let hasUpper = false;
  for (const character of password) {
    if (!isNaN(character)) {
      hasNumber = true;
    } else if (character >= 'a' && character <= 'z') {
      hasLower = true;
    } else if (character >= 'A' && character <= 'Z') {
      hasUpper = true;
    }
  }

  if (password.length >= 8 && hasNumber && (hasLower || hasUpper)) {
    if (password.length >= 12 && hasLower && hasUpper) {
      return 'Strong Password';
    }
    return 'Moderate Password';
  }
  return 'Poor Password';
}
