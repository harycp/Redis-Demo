const express = require("express");
const router = express.Router();
const client = require("./config");

// Middleware untuk validasi input
const validateInput = (req, res, next) => {
  const { key } = req.params;
  if (!key) return res.status(400).json({ error: "Key is required" });
  next();
};

// Strings
router.post("/strings/:key", validateInput, async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (!value) return res.status(400).json({ error: "Value is required" });

  try {
    await client.set(key, value);
    res.json({ message: `String stored with key: ${key}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/strings/:key", validateInput, async (req, res) => {
  const { key } = req.params;

  try {
    const value = await client.get(key);
    if (!value) return res.status(404).json({ error: "Key not found" });
    res.json({ key, value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hashes
router.post("/hashes/:key", validateInput, async (req, res) => {
  const { key } = req.params;
  const { field, value } = req.body;

  if (!field || !value)
    return res.status(400).json({ error: "Field and value are required" });

  try {
    await client.hSet(key, field, value);
    res.json({ message: `Field "${field}" stored in hash with key: ${key}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/hashes/:key/:field?", validateInput, async (req, res) => {
  const { key, field } = req.params;

  try {
    if (field) {
      const value = await client.hGet(key, field);
      if (!value) return res.status(404).json({ error: "Field not found" });
      res.json({ key, field, value });
    } else {
      const values = await client.hGetAll(key);
      if (!Object.keys(values).length)
        return res.status(404).json({ error: "Key not found" });
      res.json({ key, values });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/list/:key", validateInput, async (req, res) => {
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

router.get("/list/:key", validateInput, async (req, res) => {
  const { key } = req.params;

  try {
    const values = await client.lRange(key, 0, -1);
    res.json({ key, values });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/list/:key", validateInput, async (req, res) => {
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

router.delete("/list/clear/:key", validateInput, async (req, res) => {
  const { key } = req.params;

  try {
    await client.del(key);
    res.json({ message: `Cleared list "${key}"` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sets
router.post("/sets/:key", validateInput, async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (!value) return res.status(400).json({ error: "Value is required" });

  try {
    await client.sAdd(key, value);
    res.json({ message: `Value "${value}" added to set with key: ${key}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/sets/:key", validateInput, async (req, res) => {
  const { key } = req.params;

  try {
    const values = await client.sMembers(key);
    if (!values.length) return res.status(404).json({ error: "Key not found" });
    res.json({ key, values });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sorted Sets
router.post("/sorted-sets/:key", validateInput, async (req, res) => {
  const { key } = req.params;
  const { value, score } = req.body;

  if (!value || !score)
    return res.status(400).json({ error: "Value and score are required" });

  try {
    await client.zAdd(key, { score: parseFloat(score), value });
    res.json({
      message: `Value "${value}" added to sorted set with key: ${key}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/sorted-sets/:key", validateInput, async (req, res) => {
  const { key } = req.params;

  try {
    const values = await client.zRange(key, 0, -1, "WITHSCORES");
    if (!values.length) return res.status(404).json({ error: "Key not found" });
    res.json({ key, values });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
