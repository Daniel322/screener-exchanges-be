import {
  Injectable,
  OnApplicationShutdown,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Markup, Context } from 'telegraf';

import { UsersService } from 'src/modules/users/users.service';
import { Bind } from 'src/common/decorators';
import { CoinMarketCapService } from 'src/modules/coin-market-cap/coin-market-cap.service';
import { RedisService } from 'src/services/redis/redis.service';

@Injectable()
export class TelegramService implements OnApplicationShutdown, OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);

  private readonly bot: Telegraf;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly coinMarketCapService: CoinMarketCapService
  ) {
    this.bot = new Telegraf(this.configService.get('telegram.token'));
  }

  onModuleInit() {
      this.bot.start(this.onStart);
      this.bot.launch()
      .catch((error) => this.logger.error(`Bot launch: ${error.message}`, error.stack));
  }

  onApplicationShutdown(signal?: string): void {
    if (signal === 'SIGINT') this.bot.stop('SIGINT');
    else if (signal === 'SIGTERM') this.bot.stop('SIGTERM');
  }

  @Bind
  private async onStart(ctx: Context): Promise<void> {
    try {
      const { from } = ctx.message;
      const user = await this.usersService.findUser({
        where: { telegramId: from.id },
      });

      if (user == null) await this.usersService.createUser({ telegramId: from.id });
      this.bot.action(/^get-coins\|.+/, this.onGetCoins);
      this.bot.action(/^coin\|.+/, this.onSelectCoin);
      this.bot.on('message', this.onSearch);

      await ctx.reply('Добро пожаловать в Screener Exchange bot!');
      const buttonMarkup = [Markup.button.callback('Список монеток', 'get-coins|1')];
      await ctx.reply('Для поиска отправьте сообщение с символом (пр. USDT)', Markup.inlineKeyboard(buttonMarkup));
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }
  }

  @Bind
  private async onGetCoins(ctx: Context): Promise<void> {
    try {
      let page = 1;
      if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
        const [, rawPage] = (ctx.callbackQuery.data as string).split('|');
        page = Number(rawPage);
      }
      const coins = await this.coinMarketCapService.getCurrencyListMap(page);

      const buttonMarkup = coins.map((item) => [Markup.button.callback(item.name, `coin|${item.id}`)]);
        
      const paginationButtons = [];
      if (Number(page) > 1) {
        paginationButtons.push(Markup.button.callback('Назад', `get-coins|${page - 1}`));
      }
      if (coins.length !== 0) {
        paginationButtons.push(Markup.button.callback('Дальше', `get-coins|${page + 1}`));
      }

      buttonMarkup.push(paginationButtons);
      const message = coins.length === 0 ? 'Больше монеток нет...' : `Монетки биржы Coin Market Cup:`

      await Promise.all([
        ctx.callbackQuery && ctx.deleteMessage(ctx.callbackQuery.message.message_id),
        ctx.reply(message, Markup.inlineKeyboard(buttonMarkup)),
      ]);
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }
  }

  @Bind
  private async onSelectCoin(ctx: Context): Promise<void> {
    try {
      if ('data' in ctx.callbackQuery) {
        const [, id] = (ctx.callbackQuery.data as string).split('|');
        const data = await this.coinMarketCapService.getCurrencyQuotesLatest({ id })

        const coin = data[id];
        let message = `Цена для ${coin.name}:`;
        for (const key in coin.quote) {
          message += `\n${key}: ${coin.quote[key].price.toFixed(4)}`;
        }
        const buttonMarkup = [Markup.button.callback('Список монеток', 'get-coins|1')];

        await ctx.reply(message, Markup.inlineKeyboard(buttonMarkup));
      }
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }
  }

  @Bind
  private async onSearch(ctx: Context): Promise<void> {
    try {
      if ('text' in ctx.message) {
        const coins = await this.coinMarketCapService.getCurrencyQuotesLatest({ symbol: ctx.message.text.toLowerCase() });
        
        const buttonMarkup = Object.values(coins).flat().map((item) => [Markup.button.callback(item.name, `coin|${item.id}`)]);
          
        const paginationButtons = [];
    
        buttonMarkup.push(paginationButtons);
        const message = `Поиск по ${ctx.message.text}:`
  
        await ctx.reply(message, Markup.inlineKeyboard(buttonMarkup));
      }
    }
    catch (error) {
      this.logger.error(error.message, error.stack);
    }
  }
}
