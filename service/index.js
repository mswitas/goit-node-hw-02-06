const Contact = require('./schemas/contacts');
const User = require('./schemas/users');

const listContacts = async () => {
    return Contact.find();
};

const getContactById = async (contactId) => {
    return Contact.findOne({ _id: contactId });
};

const addContact = async (contact) => {
    return Contact.create(contact);
};

const removeContact = async (contactId) => {
    return Contact.findOneAndDelete({ _id: contactId });
};

const updateContact = async (contactId, body) => {
    return Contact.findByIdAndUpdate({ _id: contactId }, body, { new: true });
};

const updateContactStatus = async (contactId, body) => {
    return Contact.findByIdAndUpdate({ _id: contactId }, body, { new: true });
}

const addUser = async (user) => {
    return User.create(user);
}

module.exports = {
    listContacts,
    getContactById,
    addContact,
    removeContact,
    updateContact,
    updateContactStatus,
}