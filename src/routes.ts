import { Router } from 'express';
import {celebrate, Joi} from 'celebrate';
import multer from 'multer';
import multerConfig from './config/multer';

import LocationsController from './controllers/LocationsController';
import ItemsController from './controllers/ItemsController';

const routes = Router();
const upload = multer(multerConfig);

const itemsController = new ItemsController();
const locationsController = new LocationsController();

routes.get('/items', itemsController.index);

routes.get('/locations/:id', locationsController.show);
routes.get('/locations', locationsController.index);

routes.post('/locations',
  upload.single('image'),
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      whatsapp: Joi.number().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      city: Joi.string().required(),
      uf: Joi.string().required().max(2),
      items: Joi.string().required(),
    })
  }, {
    abortEarly: false
  }),
  locationsController.create
);

export default routes;
