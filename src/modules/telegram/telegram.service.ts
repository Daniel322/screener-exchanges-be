import { Injectable, OnApplicationShutdown, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Markup, Context } from 'telegraf';

import { TelegramMockService } from './telegram.mock.service';

@Injectable()
export class TelegramService implements OnApplicationShutdown {
  private readonly logger = new Logger(TelegramService.name);

  private readonly bot: Telegraf;

  constructor(
    private readonly configService: ConfigService,
    private readonly telegramMockService: TelegramMockService,
  ) {
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
    const exchanges = this.telegramMockService.getExchanges();

    const buttonMarkup = exchanges.map((item) => [Markup.button.callback(item.name, `exchange|${item.id}|1`)]);

    ctx.reply('Выберите биржу:', Markup.inlineKeyboard(buttonMarkup));

    this.bot.action(/exchange|.+/, this.onSelectEchange.bind(this));
  }

  private onSelectEchange(ctx: Context): void {
    if ('data' in ctx.callbackQuery) {
      console.log(ctx.callbackQuery.data);
      const [, id, rawPage] = (ctx.callbackQuery.data as string).split('|');
      
      const page = Number(rawPage);
      const exchange = this.telegramMockService.getExchangeById(id);
      const companies = this.telegramMockService.getCompaniesByExchangeId(id, page);

      const buttonMarkup = companies.map((item) => [Markup.button.callback(item.name, `company|${item.id}`)]);
      
      const paginationButtons = [];
      if (Number(page) > 1) {
        paginationButtons.push(Markup.button.callback('Назад', `exchange|${exchange.id}|${page - 1}`));
      }
      if (companies.length !== 0) {
        paginationButtons.push(Markup.button.callback('Дальше', `exchange|${exchange.id}|${page + 1}`));
      }

      buttonMarkup.push(paginationButtons);
      const message = companies.length === 0 ? 'Больше компаний нет...' : `Компании биржы ${exchange.name}:`
      ctx.reply(message, Markup.inlineKeyboard(buttonMarkup));
    }
  }
}