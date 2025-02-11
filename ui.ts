import { smsSender } from '../..';
import { User } from '../../models/user.model';
import ServicesClass from '../service';

//is used for sms-tools intercation. add this repo on subrepositories of sms-tools:https://github.com/sms-tools/sms-tools
class Utils extends ServicesClass {
  constructor() {
    super();
    this.name = 'ui';
    this.description = 'interface for sms-tools go on /ui/ and connect you !';
    this.version = '1.0';
    this.type = 'message';
    this.commands = [];
  }
  newMessage(contact: InstanceType<typeof User>, message: string) {
    smsSender.sendSms(
      contact,
      'your message has been received by ' +
        this.name +
        ', but the service has no response to give you',
      undefined,
      this.name,
    );
  }
}

export default Utils;
