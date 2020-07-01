
import { Inject } from 'typescript-ioc';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { RefDatabaseService } from '../services/ref-database';

export class ReloadRefCommand implements ICommand {

  static help = 'Reload the internal DM Reference entries!';

  aliases = ['reload'];

  @Inject private databaseService: RefDatabaseService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;
    message.reply('Reloading the ref...');

    await this.databaseService.loadRefsFromHTMLAndWriteToDisk();
    this.databaseService.reloadRef();

    return { resultString: args };
  }
}
