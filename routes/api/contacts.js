const express = require('express');
const { listContacts, getContactById, removeContact, addContact, updateContact } = require('../../models/contacts.js');
const Joi = require('joi');
const router = express.Router()

const userSchemaPOST = Joi.object({
  name: Joi.string().min(5).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(9).required(),
});

const userSchemaPATCH = Joi.object({
  name: Joi.string().min(5),
  email: Joi.string().email(),
  phone: Joi.string().min(9),
})

router.get('/', async (req, res, next) => {
  const contacts = await listContacts();
  res.json(contacts);
})

router.get('/:contactId', async (req, res, next) => {
  const contact = await getContactById(req.params.contactId);
  if (contact) {
    return res.json(contact);
  }
  
  res
    .status(404)
    .json({ message: 'Not found' });

})

router.post('/', async (req, res, next) => {
  try {
    const body = req.body;
    const { error } = userSchemaPOST.validate(body);
    if (error) {
      const validatingErrorMessage = error.details[0].message;
      return res
        .status(400)
        .json({ message: `${validatingErrorMessage}` });
    }

    const addedContact = await addContact(body);
    console.log('Contact added successfully');
    res
      .status(201)
      .json(addedContact);
  } catch (error) {
    console.error('Error during adding contact');
    next(error);
  }
})

router.delete('/:contactId', async (req, res, next) => {
  const contactId = req.params.contactId;
  const contact = await getContactById(contactId);
  
  if (contact) {
    await removeContact(contactId);
    return res.json({ message: 'Contact deleted' });
  } 
    
  res.status(404).json({ message: 'Not found' });

})

router.patch('/:contactId', async (req, res, next) => {
  const contactId = req.params.contactId;
  const body = req.body;
  const { error } = userSchemaPATCH.validate(body);
  
  if (error) {
    const validatingErrorMessage = error.details[0].message;
    return res
        .status(400)
        .json({ message: `${validatingErrorMessage}` });
  }

  const contact = await getContactById(contactId);

  if (contact) {
    const newContact = await updateContact(contactId, body);
    return res
      .status(200)
      .json(newContact);
  }

  res.status(404).json({ message: 'Not found' });

})

module.exports = router
