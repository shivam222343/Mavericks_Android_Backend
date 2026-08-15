const mongoose = require('mongoose');

/**
 * AppConfig — singleton document storing global app configuration.
 * Only one document will ever exist (key: 'global').
 */
const appConfigSchema = new mongoose.Schema({
    key: {
        type: String,
        default: 'global',
        unique: true,
    },
    // The minimum Android versionCode the app must have to run
    minVersionCode: {
        type: Number,
        default: 1,
    },
    // Human-readable version label, e.g. "1.1.0"
    minVersionName: {
        type: String,
        default: '1.0.0',
    },
    // Play Store URL for the app
    playStoreUrl: {
        type: String,
        default: 'https://play.google.com/store/apps/details?id=com.mycompany.myauth',
    },
    // Custom message displayed on the ForceUpdateScreen
    updateMessage: {
        type: String,
        default: 'A new version of Mavericks is available with exciting features and improvements. Please update to continue.',
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

module.exports = mongoose.model('AppConfig', appConfigSchema);
