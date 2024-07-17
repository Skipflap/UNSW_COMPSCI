/**
 * The solution below makes heavy use of regular expression. While useful,
 * regex knowledge is not a requirement for COMP1531
 *
 * /\d/ for containing a digit
 * /[A-Z]/ for containing an upper case
 * /[a-z]/ for containing a lower case
 * /[a-z]/i for upper or lower (the 'i' stands for ignore-case)
 */
export function checkPassword(password) {
  if (['123456', '123456789', '12345', 'qwerty', 'password'].includes(password)) {
    return 'Horrible Password';
  }
  if (password.length >= 8 && /\d/.test(password) && /[a-z]/i.test(password)) {
    if (password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password)) {
      return 'Strong Password';
    }
    return 'Moderate Password';
  }
  return 'Poor Password';
}
