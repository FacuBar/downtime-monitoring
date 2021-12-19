import { CronJob, timeout } from 'cron';
import fetch from 'cross-fetch';

import { User } from '../models/user';
import { Report } from '../models/report';
import { Emails, IEmails } from './email';

let tasks: { [websiteId: string]: CronJob } = {};

class Reports {
  tasks: { [websiteId: string]: CronJob };
  emails: IEmails;

  constructor(emails: IEmails) {
    this.tasks = {};
    this.emails = emails;
  }

  newReportTask(website: Website): void {
    const task = new CronJob('0 */5 * * * *', () => {
      // add timeout to fetch
      const controller = new AbortController();
      const signal = controller.signal;

      let statusC: number;

      fetch(website.url, { signal })
        .then((response) => {
          statusC = response.status;
          if (!response.ok) {
            this.emails.notify(website);
          }
        })
        .catch((e) => {
          this.emails.notify(website);
        })
        .finally(async () => {
          const report = Report.build({
            website: website.id,
            result: {
              httpStatus: statusC ? statusC : -1,
            },
          });
          await report.save();
        });

      setTimeout(() => {
        controller.abort();
      }, 1200);
    });
    task.start();
    this.tasks[website.id] = task;
  }

  async loadReportTasks(): Promise<void> {
    const websites = await User.aggregate([
      { $unwind: '$websites' },
      { $match: { 'websites.monitor': true } },
      {
        $replaceRoot: {
          newRoot: '$websites',
        },
      },
    ]);

    websites.forEach((website) => {
      this.newReportTask({
        id: website._id.toString(),
        url: website.url,
        notify: website.notify,
        notifyTo: website.notifyTo,
      });
    });
  }

  deleteTask(websiteId: string): void {
    this.tasks[websiteId].stop();
    delete tasks[websiteId];
  }
}

interface Website {
  id: string;
  url: string;
  notify: boolean;
  notifyTo: string;
}

const reports = new Reports(Emails);

export { reports as Reports };
