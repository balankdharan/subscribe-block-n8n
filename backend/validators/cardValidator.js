const { body } = require("express-validator");

const cardValidator = [
  body("blockId").isMongoId().withMessage("Valid blockId is required"),
  body("original")
    .trim()
    .notEmpty()
    .withMessage("Original content is required"),
  body("sourceType")
    .isIn(["ai", "user"])
    .withMessage("sourceType must be ai or user"),
  body("scheduledDate")
    .isISO8601()
    .withMessage("scheduledDate must be a valid date (YYYY-MM-DD)"),
];

module.exports = { cardValidator };
