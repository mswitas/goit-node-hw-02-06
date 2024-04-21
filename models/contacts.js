const fs = require('fs/promises');
const path = require('path');
const nanoid = require('nanoid-esm');

const contactsPath = path.join(__dirname, 'contacts.json');

const listContacts = async () => {
  try {
    const data = await fs.readFile(contactsPath);
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
    const data = await fs.readFile(contactsPath);
    const contacts = JSON.parse(data);
    const contactById = contacts.find(contact => contact.id === contactId);
    console.log(`Contact with id: ${contactId} downloaded successfully`);
    return contactById;
  } catch (error) {
    console.error('Error reading contacts file: ', error);
    throw error;
  }
}

const removeContact = async (contactId) => {
  try {
    const data = await fs.readFile(contactsPath);
    const contacts = JSON.parse(data);
    const newConstacts = contacts.filter(contact => contact.id !== contactId);
    try {
      await fs.writeFile(contactsPath, JSON.stringify(newConstacts));
      return true;
    } catch (error) {
      console.error('Error writing contacts file: ', error);
      throw error;
    }
  } catch (error) {
    console.error('Error reading contacts file: ', error);
    throw error;
  }
}

const addContact = async ({name, email, phone}) => {
  const newContact = {
    id: nanoid(),
    name,
    email,
    phone,
  }

  try {
    const data = await fs.readFile(contactsPath);
    const contacts = JSON.parse(data);
    contacts.push(newContact);
    try {
      await fs.writeFile(contactsPath, JSON.stringify(contacts));
      return newContact;
    } catch (error) {
      console.error('Error writing contacts file: ', error);
      throw error;
    }
  } catch (error) {
    console.error('Error reading contacts file: ', error);
    throw error;
  }

}

const updateContact = async (contactId, body) => {
  const contact = await getContactById(contactId);
  const newContact = { ...contact, ...body };
  try {
    const data = await fs.readFile(contactsPath);
    const contacts = JSON.parse(data);
    const newConstacts = contacts.map(
      (contact) => (contact.id === contactId ? newContact : contact)
    )
    try {
      await fs.writeFile(contactsPath, JSON.stringify(newConstacts));
      return newContact;
    } catch (error) {
      console.error('Error writing contacts file: ', error)
      throw error;
    }
  } catch (error) {
    console.error('Error reading contacts file: ', error);
    throw error;
  }
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
