const Department = require('../models/Department');
const Designation = require('../models/Designation');

// DEPARTMENT CONTROLLERS

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('parentDepartment', 'departmentName')
      .populate('headOfDepartment', 'personalInfo employeeId')
      .sort({ departmentName: 1 });

    res.json({ departments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('parentDepartment')
      .populate('headOfDepartment');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({ department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();

    res.status(201).json({
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({
      message: 'Department updated successfully',
      department
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDepartmentTree = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('parentDepartment')
      .populate('headOfDepartment', 'personalInfo');

    // Build tree structure
    const buildTree = (parentId = null) => {
      return departments
        .filter(dept => String(dept.parentDepartment?._id) === String(parentId))
        .map(dept => ({
          ...dept.toObject(),
          children: buildTree(dept._id)
        }));
    };

    const tree = buildTree(null);

    res.json({ tree });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DESIGNATION CONTROLLERS

exports.getAllDesignations = async (req, res) => {
  try {
    const designations = await Designation.find({ isActive: true })
      .populate('department', 'departmentName')
      .populate('reportsTo', 'designationName')
      .sort({ level: 1, designationName: 1 });

    res.json({ designations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDesignationById = async (req, res) => {
  try {
    const designation = await Designation.findById(req.params.id)
      .populate('department')
      .populate('reportsTo');

    if (!designation) {
      return res.status(404).json({ message: 'Designation not found' });
    }

    res.json({ designation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDesignation = async (req, res) => {
  try {
    const designation = new Designation(req.body);
    await designation.save();

    res.status(201).json({
      message: 'Designation created successfully',
      designation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDesignation = async (req, res) => {
  try {
    const designation = await Designation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!designation) {
      return res.status(404).json({ message: 'Designation not found' });
    }

    res.json({
      message: 'Designation updated successfully',
      designation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDesignation = async (req, res) => {
  try {
    const designation = await Designation.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!designation) {
      return res.status(404).json({ message: 'Designation not found' });
    }

    res.json({ message: 'Designation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
