import { Injectable, OnApplicationShutdown, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Markup, Context } from 'telegraf';

import { UsersService } from 'src/modules/users/users.service';
import { TelegramMockService } from 'src/modules/telegram/telegram.mock.service';

@Injectable()
export class TelegramService implements OnApplicationShutdown {
  private readonly logger = new Logger(TelegramService.name);

  private readonly bot: Telegraf;

  constructor(
    private readonly configService: ConfigService,
    private readonly telegramMockService: TelegramMockService,
    private readonly usersService: UsersService,
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

  private async onStart(ctx: Context): Promise<void> {
    try {
      const { from } = ctx.message;

      const user = await this.usersService.findUser({
        where: { telegramId: from.id },
      });

      if (user == null) await this.usersService.createUser({ telegramId: from.id });

      const exchanges = this.telegramMockService.getExchanges();
      
      const buttonMarkup = exchanges.map((item) => [Markup.button.callback(item.name, `exchange|${item.id}|1`)]);
      this.bot.action(/^exchange\|.+/, this.onSelectEchange.bind(this));
  
      await ctx.reply('Выберите биржу:', Markup.inlineKeyboard(buttonMarkup));
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }
  }

  private async onSelectEchange(ctx: Context): Promise<void> {
    try {
      if ('data' in ctx.callbackQuery) {
        console.log('here', ctx.callbackQuery.data);
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
  
        await Promise.all([
          ctx.deleteMessage(ctx.callbackQuery.message.message_id),
          ctx.reply(message, Markup.inlineKeyboard(buttonMarkup)),
        ]);
      }
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }
  }
}
