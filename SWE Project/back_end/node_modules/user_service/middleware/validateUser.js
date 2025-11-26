const { body, validationResult } = require('express-validator');

const validateCreateUser = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Tên đăng nhập phải từ 3 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Chỉ dùng chữ, số và gạch dưới'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải từ 6 ký tự'),
  body('roleId')
    .optional()
    .isUUID(4)
    .withMessage('RoleID phải là UUID v4'),
  // Admin fields
  body('fullName').optional().trim().isLength({ min: 2 }),
  body('phoneNumber').optional().matches(/^[\d\s\-\+\(\)]+$/),
  body('email').optional().isEmail(),
];

const validateUpdateUser = [
  body('username').optional().trim().isLength({ min: 3 }).matches(/^[a-zA-Z0-9_]+$/),
  body('roleId').optional().isUUID(4),
  body('fullName').optional().trim().isLength({ min: 2 }),
  body('phoneNumber').optional().matches(/^[\d\s\-\+\(\)]+$/),
  body('email').optional().isEmail(),
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array().map(e => e.msg),
    });
  }
  next();
};

module.exports = { validateCreateUser, validateUpdateUser, handleValidation };