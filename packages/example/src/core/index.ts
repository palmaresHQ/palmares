import { Domain } from "@palmares/core";

export default class CoreDomain extends Domain {
	constructor() {
		super(CoreDomain.name, __dirname);
	}
}
