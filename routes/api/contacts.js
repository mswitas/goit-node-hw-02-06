const express = require('express');
const Joi = require('joi');
const router = express.Router()
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateContactStatus,
} = require('../../service/index');
const authenticateToken = require('../../middlewares/authenticate');

const userSchemaPOST = Joi.object({
  name: Joi.string().min(5).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(9).required(),
});

const userSchemaPATCH = Joi.object({
  name: Joi.string().min(5),
  email: Joi.string().email(),
  phone: Joi.string().min(9),
});

const userSchemaFavorite = Joi.object({
  favorite: Joi.boolean(),
});

router.get('/', authenticateToken, async (req, res, next) => {
  const contacts = await listContacts(req.user._id);
  res.json(contacts);
})

router.get('/:contactId', authenticateToken, async (req, res, next) => {
  const contact = await getContactById(req.user._id, req.params.contactId);
  if (contact) {
    return res.json(contact);
  }
  
  res
    .status(404)
    .json({ message: 'Not found' });

})

router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const body = req.body;
    const { error } = userSchemaPOST.validate(body);
    if (error) {
      const validatingErrorMessage = error.details[0].message;
      return res
        .status(400)
        .json({ message: `${validatingErrorMessage}` });
    }

    const addedContact = await addContact(req.user._id, body);
    console.log('Contact added successfully');
    res
      .status(201)
      .json(addedContact);
  } catch (error) {
    console.error('Error during adding contact');
    next(error);
  }
})

router.delete('/:contactId', authenticateToken, async (req, res, next) => {
  const contactId = req.params.contactId;
  const contact = await getContactById(req.user._id, contactId);
  
  if (contact) {
    await removeContact(req.user._id, contactId);
    return res.json({ message: 'Contact deleted' });
  } 
    
  res.status(404).json({ message: 'Not found' });

})

router.patch('/:contactId', authenticateToken, async (req, res, next) => {
  const contactId = req.params.contactId;
  const body = req.body;
  const { error } = userSchemaPATCH.validate(body);
  
  if (error) {
    const validatingErrorMessage = error.details[0].message;
    return res
      .status(400)
      .json({ message: `${validatingErrorMessage}` });
  }

  const contact = await getContactById(req.user._id, contactId);

  if (contact) {
    const newContact = await updateContact(req.user._id, contactId, body);
    return res
      .status(200)
      .json(newContact);
  }

  res.status(404).json({ message: 'Not found' });

});

router.patch("/:contactId/favorite", authenticateToken, async (req, res, next) => {
  try {
    const body = req.body;
    const { error } = userSchemaFavorite.validate(body);

    if (error) {
      const validatingErrorMessage = error.details[0].message;
      return res
        .status(400)
        .json({ message: `${validatingErrorMessage}` });
    }

    const contactId = req.params.contactId;
    const updatedContactStatus = await updateContactStatus(req.user._id, contactId, body);
    res.status(200).json(updatedContactStatus);
    console.log("Contact updated successfully");
  } catch (error) {
    console.error("Error during updating contact: ", error);
    next();
  }
});

module.exports = router
