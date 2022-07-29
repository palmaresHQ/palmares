import { Domain, DomainReadyFunctionArgs, SettingsType } from "@palmares/core";
import ExpressAdapter from "@palmares/express-adapter";
import { Post } from "./models";

export default class CoreDomain extends Domain {
	constructor() {
		super(CoreDomain.name, __dirname);
	}

  async ready(options: DomainReadyFunctionArgs<SettingsType>) {
    /*options.app.get('/', async(req, res) => {
      const teste = await Post.default.get({ id: 1 });
      teste?.map(val => val.number)
      res.send('ok')
    });*/
  }
}
