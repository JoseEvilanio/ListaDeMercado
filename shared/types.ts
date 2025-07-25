import z from "zod";

export const ShoppingListSchema = z.object({
  id: z.number(),
  name: z.string(),
  user_id: z.string(),
  total_amount: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ShoppingItemSchema = z.object({
  id: z.number(),
  shopping_list_id: z.number(),
  name: z.string(),
  is_in_cart: z.boolean(),
  price: z.number(),
  quantity: z.number(),
  is_sold_by_weight: z.boolean(),
  weight_kg: z.number(),
  price_per_kg: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateShoppingListSchema = z.object({
  name: z.string().min(1, "Nome da lista é obrigatório"),
});

export const CreateShoppingItemSchema = z.object({
  shopping_list_id: z.number(),
  name: z.string().min(1, "Nome do produto é obrigatório"),
});

export const UpdateShoppingItemSchema = z.object({
  name: z.string().optional(),
  is_in_cart: z.boolean().optional(),
  price: z.number().min(0, "Preço deve ser positivo").optional(),
  quantity: z.number().min(1, "Quantidade deve ser maior que 0").optional(),
  is_sold_by_weight: z.boolean().optional(),
  weight_kg: z.number().min(0, "Peso deve ser positivo").optional(),
  price_per_kg: z.number().min(0, "Preço por kg deve ser positivo").optional(),
});

export type ShoppingList = z.infer<typeof ShoppingListSchema>;
export type ShoppingItem = z.infer<typeof ShoppingItemSchema>;
export type CreateShoppingList = z.infer<typeof CreateShoppingListSchema>;
export type CreateShoppingItem = z.infer<typeof CreateShoppingItemSchema>;
export type UpdateShoppingItem = z.infer<typeof UpdateShoppingItemSchema>;
