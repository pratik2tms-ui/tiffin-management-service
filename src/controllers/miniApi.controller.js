const miniApiService = require('../services/miniApi.service');

exports.getTiffinCentersDropdown = async (req, res, next) => {
  try {
    const tiffinCenters = await miniApiService.fetchTiffinCentersDropdown();

    res.status(200).json({
      status: 'success',
      data: tiffinCenters
    });
  } catch (error) {
    next(error);
  }
};

exports.getCustomersDropdown = async (req, res, next) => {
  try {
    const centerId = req.query.centerId || (req.user && req.user.role === 'center' ? req.user.centerId : null);
    const customers = await miniApiService.fetchCustomersDropdown(centerId);

    res.status(200).json({
      status: 'success',
      data: customers
    });
  } catch (error) {
    next(error);
  }
};
