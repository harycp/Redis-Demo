const express = require("express");
const router = express.Router();
const client = require("./config");

router.post("/list/:key", async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (!value) return res.status(400).json({ error: "Value is required" });

  try {
    await client.rPush(key, value);
    res.json({ message: `Added "${value}" to list "${key}"` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/list/:key", async (req, res) => {
  const { key } = req.params;

  try {
    const values = await client.lRange(key, 0, -1);
    res.json({ key, values });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/list/:key", async (req, res) => {
  const { key } = req.params;

  try {
    const removedValue = await client.lPop(key);
    if (!removedValue)
      return res.status(404).json({ error: "List is empty or key not found" });

    res.json({
      message: `Removed first item "${removedValue}" from list "${key}"`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/list/clear/:key", async (req, res) => {
  const { key } = req.params;

  try {
    await client.del(key);
    res.json({ message: `Cleared list "${key}"` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
