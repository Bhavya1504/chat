const GROUPCHAT = require("../models/groupchat");
const GROUPS = require("../models/groups");
const sequelize = require("../database");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const { Op } = require("sequelize");

async function sendmess(req, res) {
  const t = await sequelize.transaction();
  try {
    const message = req.body.message;
    await GROUPCHAT.create(
      {
        type: "text",
        massage: message,
        name: req.user.name,
        userId: req.user.id,
        groupid: req.body.group_id,
      },
      { transaction: t }
    );
    await t.commit();
    res.status(200).json({ messages: "message sent", username: req.user.name });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: "something went wrong" });
  }
}

async function loadmsg(req, res) {
  const group_id = req.params.group_id;
  try {
    const messages = await GROUPCHAT.findAll({ where: { groupid: group_id } });
    res.status(200).json({ messages: messages, userId: req.user.id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "something went wrong" });
  }
}

async function creategroup(req, res) {
  const t = await sequelize.transaction();
  try {
    await GROUPS.create(
      {
        name: req.body.groupname,
        role: "Admin",
        memberName: req.user.name,
        userId: req.user.id,
        group_id: req.body.datenow,
      },
      { transaction: t }
    );
    await t.commit();
    res.status(200).json({ messages: "group created successfully" });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: "something went wrong" });
  }
}

async function getgroup(req, res) {
  try {
    const id = req.user.id;
    const data = await GROUPS.findAll({ where: { userId: id } });
    res.status(200).json({ data: data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "something went wrong" });
  }
}

async function memberdetail(req, res) {
  try {
    const data = await GROUPS.findAll({
      where: { group_id: req.body.group_id },
    });
    res.status(200).json({ data: data, user: req.user.id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "something went wrong" });
  }
}

async function sendfile(req, res) {
  upload.single("file")(req, res, async (err) => {
    const t = await sequelize.transaction();
    try {
      const userId = req.user.id;
      const filename = "File" + userId + "/" + Date.now() + req.file.originalname;
      // File handling logic here, if required.
      // For instance, you might save the file to a local directory instead of uploading to AWS S3.
      await GROUPCHAT.create(
        {
          groupid: req.params.group_id,
          userId: userId,
          massage: filename, // Store the filename or local file path.
          name: req.user.name,
          type: "file",
        },
        { transaction: t }
      );
      await t.commit();
      res.status(200).json({ data: filename, username: req.user.name, success: true });
    } catch (err) {
      await t.rollback();
      console.log(err);
      res.status(500).json({ message: "Something went wrong" });
    }
  });
}

module.exports = {
  sendmess,
  loadmsg,
  creategroup,
  getgroup,
  memberdetail,
  sendfile,
};
