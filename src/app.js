import 'babel-polyfill';// for async/await
import yaml from 'js-yaml';
import fs from 'fs';
import util from './utility';
import { AppStoreScraper, GooglePlayScraper } from './scraper';
import ExcelGenerator from './excel-generator';
import SqliteArchiver from './sqlite-archiver';
import MailNotifier from './mail-notifier';
import SlackNotifier from './slack-notifier';

const Platform = {
  IOS: Symbol(),
  ANDROID: Symbol()
};

class AppKind {
  constructor(service, platform) {
    this.service = service;
    this.platform = platform;
  }
}

class Application {
  constructor(
    logger = util.getLogger(),
    config = yaml.safeLoad(fs.readFileSync(`${__dirname}/../config.yml`, 'utf8')),
    excel = new ExcelGenerator(logger),
    sqlite = new SqliteArchiver(config.sqlite.dbPath, logger),
    mail = new MailNotifier(logger),
    slack = new SlackNotifier(logger),
    appStore = new AppStoreScraper(logger),
    googlePlay = new GooglePlayScraper(logger)
    ) {
    this.logger = logger;
    this.config = config;
    this.mail = mail;
    this.excel = excel;
    this.sqlite = sqlite;
    this.slack = slack;
    this.appStore = appStore;
    this.googlePlay = googlePlay;
  }

  async fetchAsyncBody(appSettings, scraper) {
    const reviewMap = new Map();
    for (const appSetting of appSettings) {
      const reviews = await scraper.fetchAsync(appSetting.id);
      this.logger.info(`${reviews.length} reviews fetched. [App name] ${appSetting.name}`);
      reviewMap.set(appSetting.name, reviews);
      await util.sleep();
    }
    return reviewMap;
  }

  async fetchAsync(platform) {
    switch(platform) {
    case Platform.IOS:
      return await this.fetchAsyncBody(this.config.appStore, this.appStore);
    case Platform.ANDROID:
      return await this.fetchAsyncBody(this.config.googlePlay, this.googlePlay);
    default:
      throw new Error('invalid platform!!');
    }
  }

  getKind(platform) {
    switch(platform) {
    case Platform.IOS:
      return new AppKind('AppStore', 'iOS');
    case Platform.ANDROID:
      return new AppKind('GooglePlay', 'Android');
    default:
      throw new Error('invalid platform!!');
    }
  }

  async runAsync(platform) {
    const reviewMap = await this.fetchAsync(platform);
    const kind = this.getKind(platform);
    this.excel.generate(reviewMap, this.config.excel.outDir, kind.service + 'Reviews');
    const newReviewMap = await this.sqlite.archiveAsync(reviewMap, kind.service.toLowerCase());
    await this.mail.notifyAsync(newReviewMap, kind.service, this.config.mail);
    this.slack.notify(newReviewMap, platform, this.config.slack);
  }

  async main() {
    try {
      await this.runAsync(Platform.IOS);
      await this.runAsync(Platform.ANDROID);
    } catch (err) {
      this.logger.error(err);
    } finally {
      this.sqlite.close();
    }
  }
}

module.exports = Application; // for ES5