const Employee = require('../models/Employee');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      department,
      designation,
      status
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { 'contactInfo.email': { $regex: search, $options: 'i' } }
      ];
    }

    if (department) query['employmentInfo.department'] = department;
    if (designation) query['employmentInfo.designation'] = designation;
    if (status) query['employmentInfo.employmentStatus'] = status;

    const employees = await Employee.find(query)
      .populate('employmentInfo.department')
      .populate('employmentInfo.designation')
      .populate('employmentInfo.reportingManager', 'personalInfo employeeId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Employee.countDocuments(query);

    res.json({
      employees,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('employmentInfo.department')
      .populate('employmentInfo.designation')
      .populate('employmentInfo.reportingManager');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new employee
exports.createEmployee = async (req, res) => {
  try {
    const employee = new Employee({
      ...req.body,
      createdBy: req.user._id
    });

    await employee.save();

    res.status(201).json({
      message: 'Employee created successfully',
      employee
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      message: 'Employee updated successfully',
      employee
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete employee (soft delete)
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { isActive: false, 'employmentInfo.employmentStatus': 'Inactive' },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload employee document
exports.uploadDocument = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const { documentType, documentName, documentUrl } = req.body;

    employee.documents.push({
      documentType,
      documentName,
      documentUrl,
      uploadedDate: new Date()
    });

    await employee.save();

    res.json({
      message: 'Document uploaded successfully',
      employee
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get employee documents
exports.getEmployeeDocuments = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('documents');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ documents: employee.documents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search employees
exports.searchEmployees = async (req, res) => {
  try {
    const { query } = req.query;

    const employees = await Employee.find({
      isActive: true,
      $or: [
        { 'personalInfo.firstName': { $regex: query, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: query, $options: 'i' } },
        { employeeId: { $regex: query, $options: 'i' } },
        { 'contactInfo.email': { $regex: query, $options: 'i' } }
      ]
    })
      .select('employeeId personalInfo contactInfo employmentInfo')
      .limit(10);

    res.json({ employees });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
