/**
 * @fileoverview Module định tuyến (router) cho các API xác thực người dùng.
 * Cấu hình các endpoint cho đăng ký, đăng nhập, quên mật khẩu và đặt lại mật 
 * khẩu kèm theo các middleware kiểm tra dữ liệu hợp lệ.
 */

const express = require("express");
const router = express.Router();

const AuthController = require("./auth.controller");
const { body } = require('express-validator');
const { authLimiter } = require('../../middlewares/rate-limiter');
const { runValidation } = require('../../middlewares/validation');

router.post(
	"/register",
	[
		body('name').notEmpty().withMessage('Tên là bắt buộc'),
		body('email').isEmail().withMessage('Email không hợp lệ'),
		body('password')
			.matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]).{8,}$/)
			.withMessage('Mật khẩu phải từ 8 ký tự trở lên, chứa cả chữ cái, chữ số và ký tự đặc biệt')
	],
	runValidation,
	AuthController.register
);

router.post("/login", AuthController.login);

// refresh access token (reads refresh cookie or body/header)
router.post('/refresh', AuthController.refresh);

// logout (revoke refresh token)
router.post('/logout', AuthController.logout);

router.post(
	"/forgot",
	authLimiter,
	[body('email').isEmail().withMessage('Email không hợp lệ')],
	runValidation,
	AuthController.forgot
);

router.post(
	"/reset",
	[
		body('token').notEmpty().withMessage('Token là bắt buộc'),
		body('password')
			.matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]).{8,}$/)
			.withMessage('Mật khẩu phải từ 8 ký tự trở lên, chứa cả chữ cái, chữ số và ký tự đặc biệt')
	],
	runValidation,
	AuthController.reset
);

// verify email link
router.get('/verify-email', AuthController.verifyEmail);
router.post('/verify-email', AuthController.verifyEmail);

module.exports = router;
