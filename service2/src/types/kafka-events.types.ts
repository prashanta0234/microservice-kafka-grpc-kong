export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface UserCreatedEvent {
  products?: CreateProductData[];
}

export function isUserCreatedEvent(obj: unknown): obj is UserCreatedEvent {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const event = obj as Record<string, unknown>;

  if ('products' in event) {
    if (!Array.isArray(event.products)) {
      return false;
    }

    for (const product of event.products) {
      if (!isCreateProductData(product)) {
        return false;
      }
    }
  }

  return true;
}

export function isCreateProductData(obj: unknown): obj is CreateProductData {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const product = obj as Record<string, unknown>;

  return (
    typeof product.name === 'string' &&
    typeof product.description === 'string' &&
    typeof product.price === 'number' &&
    typeof product.stock === 'number'
  );
}
