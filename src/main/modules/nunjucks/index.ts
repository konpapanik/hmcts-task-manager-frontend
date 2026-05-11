import * as path from 'path';

import * as express from 'express';
import * as nunjucks from 'nunjucks';

export class Nunjucks {
  constructor(public developmentMode: boolean) {
    this.developmentMode = developmentMode;
  }

  enableFor(app: express.Express): void {
    const appViewsPath = path.join(__dirname, '..', '..', 'views');
    const govukViewsPath = path.resolve(require.resolve('govuk-frontend'), '..');

    app.set('view engine', 'njk');
    nunjucks.configure([appViewsPath, govukViewsPath], {
      autoescape: true,
      watch: this.developmentMode,
      express: app,
    });

    app.use((req, res, next) => {
      res.locals.pagePath = req.path;
      next();
    });
  }
}
