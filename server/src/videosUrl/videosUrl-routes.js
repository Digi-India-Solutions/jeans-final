const express = require('express');
const { addUrl, getAllVideos, getVideoById, updateVideo, deleteVideo, changeStatus ,getAdminUrlVideos , getCustomUrlVideos} = require('./videosUrl-controller');
const router = express.Router();

router.post('/add', addUrl);

router.get('/get-all-url', getAllVideos);

router.post("/change-status", changeStatus)

router.get('/get-url-by-id/:id', getVideoById);

router.post('/update-url/:id', updateVideo);

router.get('/delete-url/:id', deleteVideo);

router.get('/get-custom-url-videos', getCustomUrlVideos);

router.get('/get-admin-url-videos', getAdminUrlVideos);

module.exports = router;
