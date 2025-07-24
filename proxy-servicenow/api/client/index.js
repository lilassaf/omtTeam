const express = require('express');
const router = express.Router();
const clientController = require('../../controllers/Client/clientCRUD');

router.post('/login', clientController.login);
router.post('/', clientController.create);
router.get('/', clientController.getAll);
router.get('/:id', clientController.read);
router.put('/:id', clientController.update);
router.delete('/:id', clientController.delete);

module.exports = router;