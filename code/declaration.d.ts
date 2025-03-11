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
  phoneNumber: String;
  contactName: string | undefined;
};

type sseEvent = {
  contactID: string;
  messageID: string;
  phoneNumber: string;
  event: 'send' | 'delivered' | 'failed' | 'recevied';
  status: sendEvent | deliveredEvent | failedEvent | receivedEvent;
};

type sendEvent = {
  userID: mongoose.Schema.ObjectId;
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
