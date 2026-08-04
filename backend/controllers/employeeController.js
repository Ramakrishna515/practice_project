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

    const ids = employees.map(e => e._id);
    const users = await User.find({ employee: { $in: ids } }).select('username email role isActive');
    const userMap = {};
    users.forEach(u => { userMap[String(u.employee)] = u; });
    const enriched = employees.map(e => {
      const obj = e.toObject();
      obj.linkedUser = userMap[String(e._id)] || null;
      return obj;
    });

    res.json({
      employees: enriched,
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

    const user = await User.findOne({ employee: employee._id }).select('username email role isActive');
    const enriched = employee.toObject();
    enriched.linkedUser = user || null;

    res.json({ employee: enriched });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new employee
exports.createEmployee = async (req, res) => {
  try {
    const { userAccount, ...employeeData } = req.body;

    // Auto-generate employeeId if not provided
    if (!employeeData.employeeId) {
      // Get the count of existing employees
      const count = await Employee.countDocuments();
      employeeData.employeeId = `BKN${count + 1}`;
    }

    const employee = new Employee({
      ...employeeData,
      createdBy: req.user._id
    });

    await employee.save();

    // Optionally create and link a login account for the employee
    if (userAccount && userAccount.createAccount) {
      const { username, email, password, role } = userAccount;
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email and password are required to create a login account' });
      }

      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ message: 'A user with this username or email already exists' });
      }

      const user = new User({
        username,
        email,
        password,
        role: role || 'Employee',
        employee: employee._id
      });
      await user.save();
    }

    res.status(201).json({
      message: 'Employee created successfully',
      employee
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
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

// Link a user account to an employee (existing user or create new one)
exports.linkUser = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    let user;
    if (req.body.userId) {
      user = await User.findById(req.body.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    } else {
      const { username, email, password, role } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email and password are required to create an account' });
      }

      // If a user with this username/email already exists, link that account instead of erroring
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        user = existingUser;
      } else {
        user = new User({
          username,
          email,
          password,
          role: role || 'Employee'
        });
        await user.save();
      }
    }

    if (user.employee && String(user.employee) !== String(employee._id)) {
      return res.status(400).json({ message: 'This user account is already linked to another employee' });
    }

    user.employee = employee._id;
    await user.save();

    res.json({
      message: 'User account linked to employee successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Unlink the user account from an employee
exports.unlinkUser = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await User.updateMany(
      { employee: employee._id },
      { $set: { employee: null } }
    );

    res.json({ message: 'User account unlinked from employee successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
