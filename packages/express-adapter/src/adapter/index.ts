import { BaseAdapter } from "@palmares/core";

import express from "express";
import http from 'http';

export default class ExpressAdapter extends BaseAdapter {
  async init(): Promise<http.RequestListener> {
    const app = express();
    return app
  }

  async configureRoutes(rootUrlconf: string): Promise<void> {
  }
}
