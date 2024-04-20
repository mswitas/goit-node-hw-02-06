const fs = require('fs/promises');
const path = require('path');

const contactsPath = path.join(__dirname, 'contacts.json');

const listContacts = async () => {
  try {
    const data = await fs.readFile(contactsPath, 'utf-8');
    const contacts = JSON.parse(data);
    console.log('Contacts downloaded successfully');
    return contacts;
  } catch (error) {
    console.error('Error reading contacts file: ', error);
    throw error;
  }
}

const getContactById = async (contactId) => {
  try {
    const data = await fs.readFile(contactsPath, 'utf-8');
    const contacts = JSON.parse(data);
    const contactById = contacts.find(contact => contact.id === contactId);
    console.log(`Contact with id: ${contactId} downloaded successfully`);
    return contactById;
  } catch (error) {
    console.error('Error reading contacts file: ', error);
    throw error;
  }
}

const removeContact = async (contactId) => {}

const addContact = async (body) => {}

const updateContact = async (contactId, body) => {}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
