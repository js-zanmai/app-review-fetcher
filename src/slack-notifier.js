import Slack from 'slack-node';

class Field {
  constructor(title, value, short = true) {
    this.title = title;
    this.value = value;
    this.short = short;
  }
}

class Attachment {
  constructor(pretext, color, fields) {
    this.fallback = pretext; // pretextと同じにする
    this.pretext = pretext;
    this.color = color;
    this.fields = fields;
  }
}

export default class SlackNotifier {

  constructor(logger, slack = new Slack()) {
    this.logger = logger;
    this.slack = slack;
  }

  notify(reviewMap, platform, slackConfig) {
    if (!slackConfig.use) {
      this.logger.info('slack option is disabled.');
      return;
    }

    if (reviewMap.size === 0) {
      this.logger.info('SlackNotifier New review is nothing.');
      return;
    }

    try {
      reviewMap.forEach((reviews, appName) => {
        reviews.forEach((review) => {
          const attachments = this.buildAttachments(appName, review, platform);
          this.webhook(attachments, slackConfig);
        });
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  webhook(attachments, slackConfig) {
    this.slack.setWebhook(slackConfig.webhook);
    this.slack.webhook({
      'channel': '#' + slackConfig.channel,
      'username': 'app-review-bot',
      'icon_emoji': ':japanese_goblin:',
      'attachments': attachments
    }, (err, response) => {
      if (err !== null || response.statusCode !== 200) {
        this.logger.error(err);
        this.logger.error(response);
      }
    });
  }

  buildAttachments(appName, review, platform) {
    return [new Attachment(`「${appName}」の新着レビュー`, this.selectColor(review.rating), this.buildFields(review, platform))];
  }

  buildFields(review, platform) {
    return [
      new Field(review.title, review.content, false),
      new Field('Rating', Array(Number(review.rating) + 1).join(':star:')),
      new Field('Updated', review.date),
      new Field('Platform', platform),
      new Field('Version', review.version),
    ];
  }

  selectColor(rating) {
    switch (Number(rating)) {
    case 1:
      return '#990000';
    case 2:
      return '#EFA131';
    case 3:
      return '#999900';
    case 4:
      return '#66CC00';
    case 5:
      return '#16A085';
    default:
      throw new Error('invalid rating!!');
    }
  }

}
