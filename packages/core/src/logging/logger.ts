import Logging from '.'
import { MessageCategories } from './types';

export default class Logger {
  name: string;
  logging: typeof Logging;

  constructor(name:string, logging: typeof Logging) {
    this.name = name;
    this.logging = logging;
  }

  getMessage(message: string) {
    return `${this.name} ${message}`;
  }

  info(message: string) {
    this.logging.log(MessageCategories.Info, this.getMessage(message));
  }

  warn(message: string) {
    this.logging.log(MessageCategories.Warn, this.getMessage(message));
  }

  error(message: string) {
    this.logging.log(MessageCategories.Error, this.getMessage(message));
  }

  debug(message: string) {
    this.logging.log(MessageCategories.Debug, this.getMessage(message));
  }  
}