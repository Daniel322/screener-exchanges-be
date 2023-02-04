import { Injectable, OnApplicationShutdown, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Markup, Context } from 'telegraf';

@Injectable()
export class TelegramService implements OnApplicationShutdown {
  private readonly logger = new Logger(TelegramService.name);

  private readonly bot: Telegraf;

  constructor(private readonly configService: ConfigService) {
    this.bot = new Telegraf(this.configService.get('telegram.token'));
      this.bot.start(this.onStart.bind(this));
      this.bot.launch()
      .catch((error) => this.logger.error(`Bot launch: ${error.message}`, error.stack));
  }

  onApplicationShutdown(signal?: string): void {
    if (signal === 'SIGINT') this.bot.stop('SIGINT');
    else if (signal === 'SIGTERM') this.bot.stop('SIGTERM');
  }

  private onStart(ctx: Context): void {
    ctx.reply(`Welcome! ${JSON.stringify(ctx.from, null, 2)}`);
    ctx.reply('1', Markup.inlineKeyboard([
      [Markup.button.callback('Кнопка #1', 'button1')]
    ]));

    this.bot.action('button1', (ctx: Context) => {
      ctx.reply('Button 1 was clicked');
    })
  }
}