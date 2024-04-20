const express = require('express');
const { listContacts, getContactById, removeContact, addContact, updateContact } = require('../../models/contacts.js');

const router = express.Router()

router.get('/', async (req, res, next) => {
  const contacts = await listContacts();
  res.json(contacts);
})

router.get('/:contactId', async (req, res, next) => {
  const contact = await getContactById(req.params.contactId);
  res.json(contact);
})

router.post('/', async (req, res, next) => {
  res.json({ message: 'template message' })
})

router.delete('/:contactId', async (req, res, next) => {
  res.json({ message: 'template message' })
})

router.put('/:contactId', async (req, res, next) => {
  res.json({ message: 'template message' })
})

module.exports = router
