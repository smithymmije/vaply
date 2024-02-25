const Notes = require('../models/Notes');
const mongoose = require('mongoose');
const { insertMany } = require('../models/User');

/**
 * GET /
 * Dashboard
 */
exports.dashboard = async (req, res) => { 
    const locals = {
        title: "Dashboard",
        description: "Aplicativo de Notas.",
    };

    try {
        const notes = await Notes.find({});
        
        res.render('dashboard/index', {
            userName: req.user.firstName,
            locals,
            notes,
            layout:'../views/layouts/dashboard'
        });

    } catch (error) {
        console.log(error);
      }
    };
