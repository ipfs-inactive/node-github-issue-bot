# node-github-issue-bot

> Automatically schedule and create GitHub issues

## Install

```
npm i node-github-issue-bot
```

## Usage

I suggest using `forever` to keep the process up and running.

```
forever run cron.js
```

This uses `node-cron`, so you don't need to edit your crontab. Edit the templates file as needed. You'll need a `NODE_GITHUB_ISSUE_BOT` token from GitHub to create issues.

## Maintainers

Captain: [@RichardLitt](https://github.com/RichardLitt)

## Contribute

Please do!

## License

[MIT](LICENSE) © 2016 Protocol Labs, Inc.