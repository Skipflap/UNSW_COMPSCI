/**
 * Solution uses validator.isStrongPassword
 *
 * Note: external packages are forbidden in this lab.
 */

import { isStrongPassword } from 'validator';

export function checkPassword(password) {
  if (['123456', '123456789', '12345', 'qwerty', 'password'].includes(password)) {
    return 'Horrible Password';
  }
  const points = isStrongPassword(
    password,
    {
      returnScore: true,
      pointsPerUnique: 0,
      pointsPerRepeat: 0,
      pointsForContainingLower: 1,
      pointsForContainingUpper: 2,
      pointsForContainingNumber: 4,
    }
  );
  if (password.length >= 8 && points > 4) {
    if (password.length >= 12 && points === 7) {
      return 'Strong Password';
    }
    return 'Moderate Password';
  }
  return 'Poor Password';
}
