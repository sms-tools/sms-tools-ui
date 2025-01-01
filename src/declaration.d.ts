type Message = {
  _id: string;
  date: Date;
  contactID: string | undefined;
  senderID: string | undefined;
  message: string;
  direction: boolean; // in or out in: true, out: false
  status: 'received' | 'sent' | 'delivered' | 'failed' | 'pending';
  messageId: string | undefined; // id from gateway
  deliveredAt: Date | undefined;
  sendAt: Date | undefined;
};
