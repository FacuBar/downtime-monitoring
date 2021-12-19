import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

import { User } from '../models/user';
import { requiresAuth } from '../middleware/requires-auth';
import { Reports } from '../controllers/cronjob';

const router = express.Router();

router.use(requiresAuth);

router.post(
  '/users/:user_id/websites',
  [
    body('url').notEmpty().isURL({
      require_protocol: true,
      require_host: true,
    }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    if (req.params.user_id !== req.currentUser!.id) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }

    const { url } = req.body;

    const user = await User.findById(req.params.user_id);
    if (!user) {
      res
        .status(400)
        .json({ error: 'tried to add website to non existent user' });
    }

    const webRegistered = user!.websites.some((website) => {
      if (website.url === url) {
        return true;
      }
    });

    if (webRegistered) {
      res.status(400).json({ error: 'website already registered' });
      return;
    }

    const index = user!.addWebsite({
      url,
      notifyTo: user!.email,
    });
    await user!.save();
    const website = user!.websites[index - 1];
    Reports.newReportTask(website as Website);

    res.status(201).json({ website });
  }
);

router.put(
  '/users/:user_id/websites/:website_id',
  [
    body('notify').isIn([undefined, true, false]),
    body('monitor').isIn([undefined, true, false]),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    if (req.params.user_id !== req.currentUser!.id) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }

    const user = await User.findById(req.params.user_id);
    if (!user) {
      res
        .status(400)
        .json({ error: 'tried to edit website of non existent user' });
      return;
    }

    const website = user!.websites.id(req.params.website_id);

    if (!website) {
      res.status(400).json({ error: 'tried to edit non existent website' });
      return;
    }

    website.notify =
      req.body.notify !== undefined ? req.body.notify : website.notify;
    website.monitor =
      req.body.monitor !== undefined ? req.body.monitor : website.monitor;

    if (req.body.monitor === false) {
      Reports.deleteTask(website.id);
    }

    await user.save();

    res.status(200).json({});
  }
);

interface Website {
  id: string;
  url: string;
  notify: boolean;
  notifyTo: string;
}

export { router as WebsiteRouter };
