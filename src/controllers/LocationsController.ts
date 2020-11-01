import {Request, Response} from 'express';
import knex from '../database/connection';

import env from '../config/env';

class LocationsController {

  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    if (city && uf && items) {
      const parsedItems = String(items)
        .split(',')
        .map(item => Number(item.trim()));

      const locations = await knex('locations')
        .join('location_items', 'locations.id', '=', 'location_items.location_id')
        .whereIn('location_items.item_id', parsedItems)
        .where('city', '=', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('locations.*');
      
      const serializedLocations = locations.map(location => {
        return {
          ...location,
          image_url: `${env.host}:${env.port}/uploads/${location.image}`
        };
      });

      return response.json(serializedLocations);
    }

    const locations = await knex('locations').select('*');
    return response.json(locations);
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const location = await knex('locations').where('id', id).first();

    if (!location) {
      return response.status(400).json({message: 'Location not found.'});
    }

    const serializedLocation = {
      ...location,
      image_url: `${env.host}:${env.port}/uploads/${location.image}`
    }

    const items = await knex('items')
      .join('location_items', 'items.id', '=', 'location_items.item_id')
      .where('location_items.location_id', id)
      .select('items.title');

    return response.json({location: serializedLocation, items});
  }

  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = request.body;

    const transaction = await knex.transaction();

    const location = {
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    };
  
    const newIds = await transaction('locations').insert(location);
  
    const location_id = newIds[0];
  
    const locationItems = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {
      return {
        item_id,
        location_id,
      };
    });

    await transaction('location_items').insert(locationItems);

    await transaction.commit();

    return response.json({
      id: location_id,
      ...location,
    });
    
  }
}

export default LocationsController;
