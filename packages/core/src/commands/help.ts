import { Domain } from '../domain';
import { DefaultCommandType, ExtractCommandsType } from './types';

import type coreDomain from '../domain/default';

function textWithEmptySpaces(length: number, text: string) {
  return `${' '.repeat(length)}${text}`;
}

/**
 * This is really similar to `logKeywordArgs` but it's used for logging the positional arguments. It will fully construct the syntax of the positional arguments and
 * it will also log the description of each positional argument.
 *
 * It will return an array where the first element is the syntax of the positional arguments and the second element is the string of the description to log.
 */
function logPositionalArgs(commandData: NonNullable<Domain['commands']>[string]) {
  let stringToLog = '';
  let syntax = '';
  const appendStringToLog = (text: string) => (stringToLog += '\n' + text);
  const appendStringToSyntax = (text: string) => (syntax += ' ' + text);

  if (commandData.positionalArgs && Object.keys(commandData.positionalArgs).length > 0) {
    appendStringToLog(textWithEmptySpaces(4, `\x1b[33mPOSITIONAL ARGS\x1b[0m`));
    const positionalArgsEntries = Object.entries(commandData.positionalArgs);
    for (let positionalIndex = 0; positionalIndex < positionalArgsEntries.length; positionalIndex++) {
      const [positionalArg, positionalArgData] = positionalArgsEntries[positionalIndex];

      const isPositionalArgOptional = positionalArgData.required !== true;
      const doesPositionalArgCanRepeat = positionalArgData.canBeMultiple;
      appendStringToSyntax(
        `${isPositionalArgOptional ? '[' : ''}${positionalArg.toUpperCase()}${
          doesPositionalArgCanRepeat ? ` ...` : ''
        }${isPositionalArgOptional ? ']' : ''}`
      );
      appendStringToLog(textWithEmptySpaces(6, `\x1b[1m${positionalArg}\x1b[0m`));
      appendStringToLog(textWithEmptySpaces(8, `\x1b[1mDESCRIPTION\x1b[0m`));
      appendStringToLog(textWithEmptySpaces(10, positionalArgData.description));
      appendStringToLog(textWithEmptySpaces(8, `\x1b[1mREQUIRED\x1b[0m: ${!isPositionalArgOptional}`));
      appendStringToLog(
        textWithEmptySpaces(
          8,
          `\x1b[1mTYPE\x1b[0m: ${
            ['string', 'boolean', 'number'].includes(positionalArgData.type as string)
              ? positionalArgData.type
              : 'string'
          }`
        )
      );
      if (positionalIndex < positionalArgsEntries.length - 1) appendStringToLog('');
    }
  }

  return [syntax, stringToLog];
}

/**
 * This is really similar to `logPositionalArgs` but it's used for logging the keyword arguments. It will fully construct the syntax of the keyword arguments and
 * it will also log the description of each keyword argument.
 *
 * It will return an array where the first element is the syntax of the keyword arguments and the second element is the string of the description to log.
 */
function logKeywordArgs(commandData: NonNullable<Domain['commands']>[string]) {
  let stringToLog = '';
  let syntax = '';
  const appendStringToLog = (text: string) => (stringToLog += '\n' + text);
  const appendStringToSyntax = (text: string) => (syntax += ' ' + text);

  if (commandData.keywordArgs && Object.keys(commandData.keywordArgs).length > 0) {
    appendStringToLog(textWithEmptySpaces(4, `\x1b[33mKEYWORD ARGS\x1b[0m`));
    const keywordArgsArgsEntries = Object.entries(commandData.keywordArgs);
    for (let keywordIndex = 0; keywordIndex < keywordArgsArgsEntries.length; keywordIndex++) {
      const [keywordArg, keywordArgData] = keywordArgsArgsEntries[keywordIndex];
      const doesKeywordArgHaveFlag = keywordArgData.hasFlag;
      const doesKeywordArgHaveDefault = keywordArgData.default !== undefined;
      const isKeywordChoicesArray = Array.isArray(keywordArgData.type);
      const doesKeywordArgHaveType =
        (typeof keywordArgData.type === 'string' && ['string', 'number'].includes(keywordArgData.type as string)) ||
        isKeywordChoicesArray;

      appendStringToSyntax(
        `[--${keywordArg}${doesKeywordArgHaveFlag ? `, -${keywordArg[0]}` : ''}${
          doesKeywordArgHaveType
            ? keywordArgData.canBeMultiple
              ? `=[${
                  isKeywordChoicesArray ? `{${(keywordArgData.type as string[]).join(',')}}` : keywordArg.toUpperCase()
                },...]`
              : `=${
                  isKeywordChoicesArray ? `{${(keywordArgData.type as string[]).join(',')}}` : keywordArg.toUpperCase()
                }`
            : ''
        }${doesKeywordArgHaveDefault ? `; default="${keywordArgData.default}"` : ''}]`
      );
      appendStringToLog(textWithEmptySpaces(6, `\x1b[1m${keywordArg}\x1b[0m`));
      appendStringToLog(textWithEmptySpaces(8, `\x1b[1mDESCRIPTION\x1b[0m`));
      appendStringToLog(textWithEmptySpaces(10, keywordArgData.description));
      if (doesKeywordArgHaveFlag) appendStringToLog(textWithEmptySpaces(8, `\x1b[1mFLAG\x1b[0m: -${keywordArg[0]}`));
      if (doesKeywordArgHaveDefault)
        appendStringToLog(textWithEmptySpaces(8, `\x1b[1mDEFAULT\x1b[0m: ${keywordArgData.default}`));
      if (doesKeywordArgHaveType)
        appendStringToLog(textWithEmptySpaces(8, `\x1b[1mTYPE\x1b[0m: ${keywordArgData.type}`));
      if (keywordArgData.canBeMultiple)
        appendStringToLog(textWithEmptySpaces(8, `\x1b[1mCAN APPEAR MORE THAN ONCE\x1b[0m`));
      if (keywordIndex < keywordArgsArgsEntries.length - 1) appendStringToLog('');
    }
  }
  return [syntax, stringToLog];
}

/**
 * The help command is used to show the user all of the available commands and their respective descriptions.
 *
 * You can also use to show
 */
export default function help(
  domains: Domain[],
  keywordArgs: ExtractCommandsType<typeof coreDomain, 'help'>['keywordArgs']
) {
  for (let i = 0; i < domains.length; i++) {
    const domain = domains[i];
    const shouldNotShowAnythingFromDomain =
      (keywordArgs?.domain && !keywordArgs.domain.includes(domain.name)) ||
      (keywordArgs?.command &&
        !Object.keys(domain.commands || {}).some((command) => keywordArgs?.command?.includes(command))) ||
      !domain.commands;

    if (shouldNotShowAnythingFromDomain) continue;

    console.log(textWithEmptySpaces(0, `\x1b[36m[${domain.name}]\x1b[0m`));
    const commandEntries = Object.entries(domain.commands as DefaultCommandType);

    for (let commandIndex = 0; commandIndex < commandEntries.length; commandIndex++) {
      const shouldNotShowCommand =
        keywordArgs?.command && !keywordArgs.command.includes(commandEntries[commandIndex][0]);
      if (shouldNotShowCommand) continue;

      const [command, commandData] = commandEntries[commandIndex];

      const [positionalArgsSyntax, positionalArgsToLog] = logPositionalArgs(commandData);
      const [keywordArgsSyntax, keywordArgsToLog] = logKeywordArgs(commandData);
      console.log(textWithEmptySpaces(2, `\x1b[1m${command}\x1b[0m`));
      console.log(textWithEmptySpaces(4, `\x1b[33mDESCRIPTION\x1b[0m`));
      console.log(textWithEmptySpaces(6, `${commandData.description}`));
      console.log('');
      console.log(textWithEmptySpaces(4, `\x1b[33mSYNTAX\x1b[0m`));
      console.log(
        textWithEmptySpaces(
          6,
          `manage.(ts|js) ${command}${positionalArgsSyntax !== '' ? positionalArgsSyntax : ''}${
            keywordArgsSyntax !== '' ? keywordArgsSyntax : ''
          }`
        )
      );
      if (positionalArgsToLog !== '') console.log(positionalArgsToLog);
      if (keywordArgsToLog !== '') console.log(keywordArgsToLog);

      if (commandIndex < commandEntries.length - 1) console.log('');
    }

    if (i < domains.length - 1) console.log('');
  }
}
