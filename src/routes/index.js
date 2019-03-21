import express from 'express';
import userController from '../controllers/userController';

const router = express.Router();

router.get('/status', (req, res) => {
  res.json({ status: `Server running at PORT ${process.env.PORT || 5000}` });
});

router.use('/api/users', userController);

module.exports = router;
