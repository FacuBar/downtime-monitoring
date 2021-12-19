import nodemailer from 'nodemailer';

interface IEmails {
  notify(website: Website): Promise<void>;
}

class Emails implements IEmails {
  transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.USER, pass: process.env.PASSWORD },
    });
  }

  async notify(website: Website) {
    await this.transporter.sendMail({
      from: `"downtime-monitoring" <${process.env.USER}>`,
      to: `${website.notifyTo}`,
      subject: `your website isn't working as expected`,
      text: `${website.url} is down.`,
    });
  }
}

interface Website {
  url: string;
  notifyTo: string;
}

const emails = new Emails();

export { emails as Emails, IEmails };
