const hrAccess = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'hr' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. HR role required' });
    }

    next();
};

module.exports = hrAccess; 