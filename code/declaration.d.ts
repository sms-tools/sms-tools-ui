type Message = {
  date: Date;
  contactID: string | undefined;
  senderID: string | undefined;
  message: string;
  direction: boolean; // in or out in: true, out: false
  status: 'received' | 'sent' | 'delivered' | 'failed' | 'pending';
  deliveredAt: Date | undefined;
  sendAt: Date | undefined;
  messageID: string;
};

type contact = {
  createDate: Date;
  phoneNumber: string;
  contactName: string | undefined;
};

type realContact = {
  contactName: string | undefined;
  phoneNumber: string;
  message: string;
  messageID: string;
  date: Date;
  senderID: string | undefined;
  direction: boolean;
  status: 'received' | 'sent' | 'delivered' | 'failed' | 'pending';
  deliveredAt: Date | undefined;
  sendAt: Date | undefined;
};

type sseEvent = {
  contactID: string;
  messageID: string;
  phoneNumber: string;
  event: 'send' | 'delivered' | 'failed' | 'recevied';
  status: sendEvent | deliveredEvent | failedEvent | receivedEvent;
};

type sendEvent = {
  userID: string;
  message: string;
  sendAt: Date;
  contactName: string | undefined;
};

type deliveredEvent = {
  deliveredAt: Date;
};

type failedEvent = {
  deliveredAt: Date;
};

type receivedEvent = {
  deliveredAt: Date;
  message: string;
  contactName: string | undefined;
};
