const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getStats,
    getAllUsers,
    changeUserRole,
    sendCustomNotification,
    getGames,
    updateGameConfig,
    getAppConfig,
    updateAppConfig,
} = require('../controllers/adminController');
const { getClubAttendanceReport } = require('../controllers/attendanceReportController');

// Public route — no auth needed (mobile checks version before login)
router.get('/app-config', getAppConfig);

router.use(protect);

// Publicly available within protected area
router.get('/games', getGames);

router.use(authorize('admin')); // Restrict remaining routes to admin only

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', changeUserRole);
router.post('/send-notification', sendCustomNotification);
router.post('/games', updateGameConfig);
router.get('/attendance-report/:clubId', getClubAttendanceReport);
router.get('/reports', (req, res) => res.json({ message: 'Reports placeholder' }));
router.put('/app-config', updateAppConfig);

module.exports = router;
