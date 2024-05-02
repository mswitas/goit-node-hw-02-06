const Contact = require('./schemas/contacts');
const User = require('./schemas/users');

const listContacts = async (userId) => {
    return Contact.find({owner: userId});
};

const getContactById = async (userId, contactId) => {
    return Contact.findOne({ owner: userId, _id: contactId  });
};

const addContact = async (userId, contact) => {
    return Contact.create({ ...contact, owner: userId });
};

const removeContact = async (userId, contactId) => {
    return Contact.findOneAndDelete({ owner: userId, _id: contactId });
};

const updateContact = async (userId,contactId, body) => {
    return Contact.findByIdAndUpdate({ owner: userId, _id: contactId }, body, { new: true });
};

const updateContactStatus = async (userId, contactId, body) => {
    return Contact.findByIdAndUpdate({ owner: userId, _id: contactId }, body, { new: true });
}

const addUser = async (user) => {
    return User.create(user);
}

const getUserByEmail = async (email) => {
    return User.findOne({ email: email });
}

module.exports = {
    listContacts,
    getContactById,
    addContact,
    removeContact,
    updateContact,
    updateContactStatus,
    addUser,
    getUserByEmail,
}