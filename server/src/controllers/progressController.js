const Progress = require("../models/Progress");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");

const getProgress = asyncHandler(async (req, res) => {
  const history = await Progress.find({ studentId: req.user._id }).sort({ date: 1 });
  return success(res, { history });
});

module.exports = { getProgress };
