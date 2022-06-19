import { Engine, DatabaseConfigurationType } from "@palmares/core";

import { InitializedModelsType } from "./types";

import { Sequelize, Dialect, Options, Op } from 'sequelize';


export class SequelizeEngine extends Engine {
    #isConnected: boolean | null = null;
    #initializedModels: InitializedModelsType = {};
    sequelizeInstance!: Sequelize | null;
    operations = {
        and: Op.and,
        or: Op.or,
        eq: Op.eq,
        ne: Op.ne,
        is: Op.is,
        not: Op.not,
        col: Op.col,
        gt: Op.gt,
        gte: Op.gte,
        lt: Op.lt,
        lte: Op.lte,
        between: Op.between,
        notBetween: Op.notBetween,
        all: Op.all,
        in: Op.in,
        notIn: Op.notIn,
        like: Op.like,
        notLike: Op.notLike,
        startsWith: Op.startsWith,
        endsWith: Op.endsWith,
        substring: Op.substring,
        iLike: Op.iLike,
        notILike: Op.notILike,
        regexp: Op.regexp,
        notRegexp: Op.notRegexp,
        iRegexp: Op.iRegexp,
        notIRegexp: Op.notIRegexp,
        any: Op.any,
        match: Op.match
    }

    constructor(databaseName: string, sequelizeInstance: Sequelize) {
        super(databaseName);
        this.sequelizeInstance = sequelizeInstance;
    }

    static async new(
        databaseName: string, 
        databaseSettings: DatabaseConfigurationType<Dialect, Options>
    ): Promise<Engine> {
        const isUrlDefined: boolean = typeof databaseSettings.url === "string";
        if (isUrlDefined) {
            const databaseUrl: string = databaseSettings.url || ''
            const sequelizeInstance = new Sequelize(databaseUrl, databaseSettings.extraOptions);
            return new this(databaseName, sequelizeInstance);
        }
        const sequelizeInstance = new Sequelize(
            databaseSettings.databaseName, 
            databaseSettings.username,
            databaseSettings.password,
            {
                host: databaseSettings.host,
                port: databaseSettings.port,
                dialect: databaseSettings.engine,
                ...databaseSettings.extraOptions
            }
        );
        return new this(databaseName, sequelizeInstance);
    }

    async isConnected(): Promise<boolean> {
        const isConnectedDefined: boolean = typeof this.#isConnected === "boolean";
        if (isConnectedDefined) return this.#isConnected ? true : false;

        const isSequelizeInstanceDefined = this.sequelizeInstance instanceof Sequelize;
        if (isSequelizeInstanceDefined) {
            try {
                await this.sequelizeInstance?.authenticate();
                this.#isConnected = true;
            } catch (error) {
                this.#isConnected = false;
            }

            if (this.#isConnected) return this.#isConnected;    
        }
        this.sequelizeInstance = null;
        return await super.isConnected();
    }
}

