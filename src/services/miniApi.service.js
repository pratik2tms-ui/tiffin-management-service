const { TiffinCenter, User } = require('../models');

exports.fetchTiffinCentersDropdown = async () => {
  const tiffinCenters = await TiffinCenter.findAll({
    where: { 
      isActive: true, 
      isDeleted: false,
      status: 'active' 
    },
    attributes: ['id', 'name'], // Fetch only required fields
    order: [['name', 'ASC']],   // Sort alphabetically
  });
  
  return tiffinCenters;
};

exports.fetchCustomersDropdown = async (centerId) => {
  const where = { role: 'user', isActive: true, isDeleted: false };
  if (centerId) {
    where.centerId = centerId;
  }
  const customers = await User.findAll({
    where,
    attributes: ['id', 'name'],
    order: [['name', 'ASC']],
  });
  
  return customers;
};
