function IsPhoneNumber(number: any) {
  if (typeof number != 'string') return false;
  if (!number.match(/^(?:\+33|0)\s*[1-9](?:\s*\d{2}){4}$/)) return false;

  return true;
}

function clearPhone(phoneNumber: string): string {
  if (typeof phoneNumber != 'string') return '';
  phoneNumber = phoneNumber.trim();

  // Remove spaces, dots, dashes, and parentheses
  phoneNumber = phoneNumber.replace(/[ .\-()]/g, '');
  //replace all o by 0
  phoneNumber = phoneNumber.replace(/o/g, '0');
  phoneNumber = phoneNumber.replace('+33', '33');

  if (phoneNumber.startsWith('6') || phoneNumber.startsWith('7')) {
    phoneNumber = '0' + phoneNumber;
  }
  if (phoneNumber.startsWith('33') && phoneNumber.length == 11) {
    phoneNumber = '0' + phoneNumber.slice(2);
  }
  if (phoneNumber.length == 12 && phoneNumber.startsWith('06')) {
    phoneNumber = '+336' + phoneNumber.slice(2);
  }
  if (phoneNumber.startsWith('0')) {
    phoneNumber = phoneNumber.replace('0', '+33');
  }
  return phoneNumber;
}

export { IsPhoneNumber, clearPhone };
