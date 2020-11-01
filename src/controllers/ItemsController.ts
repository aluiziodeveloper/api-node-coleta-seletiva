import {Request, Response} from 'express';
import knex from '../database/connection';

import env from '../config/env';

class ItemsController {

  async index(request: Request, response: Response) {
    const items = await knex('items').select('*');
  
    const serializedItems = items.map(item => {
      return {
        id: item.id,
        title: item.title,
        image_url: `${env.host}:${env.port}/uploads/${item.image}`
      };
    });
  
    return response.json(serializedItems);
  }

}

export default ItemsController;
