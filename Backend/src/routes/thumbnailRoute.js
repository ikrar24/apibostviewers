import express from 'express';
import thumbnailControll from '../controllers/thumbnailController.js';

const router = express.Router();

router.post('/thumbnail-generetor', thumbnailControll);

export default router;