import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  CreateShoppingListSchema,
  CreateShoppingItemSchema,
  UpdateShoppingItemSchema,
} from "../shared/types";

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use("*", async (c, next) => {
  await next();
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");
});

app.options("*", (c) => c.text("", 200));

// Get all shopping lists
app.get("/api/lists", async (c) => {
  try {
    const db = c.env.DB;
    const lists = await db.prepare(
      "SELECT * FROM shopping_lists ORDER BY created_at DESC"
    ).all();
    
    return c.json({ lists: lists.results || [] });
  } catch (error) {
    console.error("Error fetching lists:", error);
    return c.json({ error: "Failed to fetch lists" }, 500);
  }
});

// Create a new shopping list
app.post("/api/lists", zValidator("json", CreateShoppingListSchema), async (c) => {
  try {
    const { name } = c.req.valid("json");
    const db = c.env.DB;
    
    const result = await db.prepare(
      "INSERT INTO shopping_lists (name) VALUES (?) RETURNING *"
    ).bind(name).first();
    
    return c.json({ list: result });
  } catch (error) {
    console.error("Error creating list:", error);
    return c.json({ error: "Failed to create list" }, 500);
  }
});

// Get shopping list with items
app.get("/api/lists/:id", async (c) => {
  try {
    const listId = parseInt(c.req.param("id"));
    const db = c.env.DB;
    
    const list = await db.prepare(
      "SELECT * FROM shopping_lists WHERE id = ?"
    ).bind(listId).first();
    
    if (!list) {
      return c.json({ error: "List not found" }, 404);
    }
    
    const items = await db.prepare(
      "SELECT * FROM shopping_items WHERE shopping_list_id = ? ORDER BY created_at ASC"
    ).bind(listId).all();
    
    return c.json({ 
      list, 
      items: items.results || [] 
    });
  } catch (error) {
    console.error("Error fetching list:", error);
    return c.json({ error: "Failed to fetch list" }, 500);
  }
});

// Add item to shopping list
app.post("/api/lists/:id/items", zValidator("json", CreateShoppingItemSchema), async (c) => {
  try {
    const listId = parseInt(c.req.param("id"));
    const { name } = c.req.valid("json");
    const db = c.env.DB;
    
    const result = await db.prepare(
      "INSERT INTO shopping_items (shopping_list_id, name) VALUES (?, ?) RETURNING *"
    ).bind(listId, name).first();
    
    return c.json({ item: result });
  } catch (error) {
    console.error("Error adding item:", error);
    return c.json({ error: "Failed to add item" }, 500);
  }
});

// Update shopping item
app.put("/api/items/:id", zValidator("json", UpdateShoppingItemSchema), async (c) => {
  try {
    const itemId = parseInt(c.req.param("id"));
    const updates = c.req.valid("json");
    const db = c.env.DB;
    
    const setClauses = [];
    const values = [];
    
    if (updates.name !== undefined) {
      setClauses.push("name = ?");
      values.push(updates.name);
    }
    if (updates.is_in_cart !== undefined) {
      setClauses.push("is_in_cart = ?");
      values.push(updates.is_in_cart);
    }
    if (updates.price !== undefined) {
      setClauses.push("price = ?");
      values.push(updates.price);
    }
    if (updates.quantity !== undefined) {
      setClauses.push("quantity = ?");
      values.push(updates.quantity);
    }
    if (updates.is_sold_by_weight !== undefined) {
      setClauses.push("is_sold_by_weight = ?");
      values.push(updates.is_sold_by_weight);
    }
    if (updates.weight_kg !== undefined) {
      setClauses.push("weight_kg = ?");
      values.push(updates.weight_kg);
    }
    if (updates.price_per_kg !== undefined) {
      setClauses.push("price_per_kg = ?");
      values.push(updates.price_per_kg);
    }
    
    setClauses.push("updated_at = CURRENT_TIMESTAMP");
    values.push(itemId);
    
    const result = await db.prepare(
      `UPDATE shopping_items SET ${setClauses.join(", ")} WHERE id = ? RETURNING *`
    ).bind(...values).first();
    
    if (!result) {
      return c.json({ error: "Item not found" }, 404);
    }
    
    // Update list total
    await updateListTotal(db, result.shopping_list_id as number);
    
    return c.json({ item: result });
  } catch (error) {
    console.error("Error updating item:", error);
    return c.json({ error: "Failed to update item" }, 500);
  }
});

// Delete shopping item
app.delete("/api/items/:id", async (c) => {
  try {
    const itemId = parseInt(c.req.param("id"));
    const db = c.env.DB;
    
    const item = await db.prepare(
      "SELECT shopping_list_id FROM shopping_items WHERE id = ?"
    ).bind(itemId).first();
    
    if (!item) {
      return c.json({ error: "Item not found" }, 404);
    }
    
    await db.prepare("DELETE FROM shopping_items WHERE id = ?").bind(itemId).run();
    
    // Update list total
    await updateListTotal(db, item.shopping_list_id as number);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return c.json({ error: "Failed to delete item" }, 500);
  }
});

// Reset shopping list (unmark all items and clear prices)
app.put("/api/lists/:id/reset", async (c) => {
  try {
    const listId = parseInt(c.req.param("id"));
    const db = c.env.DB;
    
    await db.prepare(
      "UPDATE shopping_items SET is_in_cart = FALSE, price = 0.0, quantity = 1, is_sold_by_weight = FALSE, weight_kg = 0.0, price_per_kg = 0.0 WHERE shopping_list_id = ?"
    ).bind(listId).run();
    
    await db.prepare(
      "UPDATE shopping_lists SET total_amount = 0.0, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(listId).run();
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error resetting list:", error);
    return c.json({ error: "Failed to reset list" }, 500);
  }
});

// Helper function to update list total
async function updateListTotal(db: any, listId: number) {
  const result = await db.prepare(
    "SELECT SUM(CASE WHEN is_sold_by_weight = TRUE THEN weight_kg * price_per_kg ELSE price * quantity END) as total FROM shopping_items WHERE shopping_list_id = ? AND is_in_cart = TRUE"
  ).bind(listId).first();
  
  const total = result?.total || 0;
  
  await db.prepare(
    "UPDATE shopping_lists SET total_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(total, listId).run();
}

export default app;
