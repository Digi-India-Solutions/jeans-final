const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const ErrorHandler = require("../../utils/ErrorHandler");
const AdminRole = require("./adminRole-model");


exports.createRolesByAdmin = catchAsyncErrors(async (req, res, next) => {
    const { name } = req.body;
    console.log("ROLE :=>", req.body);
    const exist = await AdminRole.findOne({ name });
    if (exist) return next(new ErrorHandler('Role already exists', 400));
    const role = await AdminRole.create(req.body);
    res.status(200).json({ status: true, message: 'Role created successfully', data: role });
    // sendResponse(res, 200, 'Role created successfully', role);
});

exports.getAllRoles = catchAsyncErrors(async (req, res) => {
    const roles = await AdminRole.find().sort({ createdAt: -1 });
    res.status(200).json({ status: true, message: "Roles fetched successfully", data: roles });
});

exports.updateRolesByAdmin = catchAsyncErrors(async (req, res, next) => {
    const role = await AdminRole.findByIdAndUpdate(req.params.id, req.body, {
        new: true, runValidators: true
    });
    if (!role) return next(new ErrorHandler('Role not found', 404));
    res.status(200).json({ status: true, message: "Role updated successfully", data: role });
});

exports.deleteRoleByAdmin = catchAsyncErrors(async (req, res, next) => {
    const role = await AdminRole.findByIdAndDelete(req.params.id);
    if (!role) return next(new ErrorHandler('Role not found', 404));
    res.status(200).json({ status: true, message: "Role deleted successfully", data: role });
});

exports.getAllRolesByRole = catchAsyncErrors(async (req, res) => {
    console.log("req.body.role==>", req.body.role);
    const roles = await AdminRole.find({ name: req.body.role }).sort({ createdAt: -1 });
    res.status(200).json({ status: true, message: "Roles fetched successfully", data: roles });
});