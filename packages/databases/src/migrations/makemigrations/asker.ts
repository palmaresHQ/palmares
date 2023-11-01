import { getDefaultStd } from '@palmares/std';

class Asker {
  async theNewAttributeCantHaveNullDoYouWishToContinue(modelName: string, fieldName: string): Promise<boolean> {
    const question =
      `\x1b[0mIf the model \x1b[33m${modelName}\x1b[0m already have data, ` +
      `it can cause issues when migrating the new \x1b[36m${fieldName}\x1b[0m column ` +
      `because you didn't set a \x1b[33mdefaultValue\x1b[0m or \x1b[33mallowNull \x1b[0mis ` +
      `set to \x1b[33mfalse\x1b[0m. \n` +
      `You can safely ignore this message if you didn't add any data to the table. \n\n` +
      `Press any key to continue or 'CTRL+C' to stop and define the attributes yourself.\n`;
    const answer = await getDefaultStd().asker.ask(question);
    if (answer.toLowerCase() === 'n') return false;
    else return true;
  }

  async didUserRename(modelOrFieldThatWasRenamed: string, renamedTo: string): Promise<boolean> {
    const question = `\nDid you rename '${modelOrFieldThatWasRenamed}' to '${renamedTo}'? [y/n]\n`;
    const answer = await getDefaultStd().asker.ask(question);
    if (['y', 'n'].includes(answer)) return answer === 'y';
    else return false;
  }

  async didUserRenameToOneOption(valueThatWasRenamed: string, renamedToOptions: string[]): Promise<string | null> {
    const toOptions = renamedToOptions.map((renamedTo, index) => `${index + 1}. ${renamedTo}`);
    const explanation = '\nPlease type the corresponding number or leave blank if you have not renamed';
    const question = `\nDid you rename '${valueThatWasRenamed}' to one of the following options? \n${toOptions.join(
      '\n'
    )} \n\n${explanation}\n`;
    const answer = await getDefaultStd().asker.ask(question);
    if (answer === '') return null;
    else {
      try {
        return renamedToOptions[parseInt(answer) - 1];
      } catch {
        return null;
      }
    }
  }
}

export default new Asker();
