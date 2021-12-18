import { CronJob } from 'cron';

import { User } from '../models/user';

let tasks: { [websiteId: string]: CronJob } = {};

interface Website {
  id: string;
  url: string;
  notify: boolean;
}

const addTask = (website: Website) => {
  const task = new CronJob('0 */10 * * * *', function () {
    const controller = new AbortController();
    const signal = controller.signal;

    fetch(website.url, { signal })
      .then((response) => {
        if (!response.ok) {
          // send email
        }
      })
      .catch((e) => {
        // send email
      });

    setTimeout(() => {
      controller.abort();
    }, 400);
  });

  tasks[website.id] = task;
};

// it might be a more eficient way of doing this
const loadTasks = async () => {
  const users = await User.find({});

  users.forEach((user) => {
    user.websites!.forEach((website) => {
      if (website.monitor) {
        addTask(website as Website);
      }
    });
  });
};

const deleteTask = (websiteId: string) => {
  delete tasks[websiteId];
};
