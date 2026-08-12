import { useCallback, useEffect, useState } from 'react';

export type CartItem = {
    id: string;
    name: string;
    price: number;
    variant: string;
    qty: number;
    image: string;
};

const STORAGE_KEY = 'elmienda-cart';
const CART_EVENT = 'elmienda-cart-updated';

function read(): CartItem[] {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);

        return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
        return [];
    }
}

function write(items: CartItem[]) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CART_EVENT));
}

export function useCart() {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const sync = () => setItems(read());

        sync();
        window.addEventListener(CART_EVENT, sync);
        window.addEventListener('storage', sync);

        return () => {
            window.removeEventListener(CART_EVENT, sync);
            window.removeEventListener('storage', sync);
        };
    }, []);

    const add = useCallback((item: Omit<CartItem, 'id'> & { id?: string }) => {
        const id = item.id ?? `${item.name}-${item.variant}`;
        const current = read();
        const existing = current.find((line) => line.id === id);

        write(
            existing
                ? current.map((line) =>
                      line.id === id
                          ? { ...line, qty: line.qty + item.qty }
                          : line,
                  )
                : [...current, { ...item, id }],
        );
    }, []);

    const setQty = useCallback((id: string, qty: number) => {
        write(
            read().map((line) =>
                line.id === id ? { ...line, qty: Math.max(1, qty) } : line,
            ),
        );
    }, []);

    const remove = useCallback((id: string) => {
        write(read().filter((line) => line.id !== id));
    }, []);

    const clear = useCallback(() => write([]), []);

    const count = items.reduce((total, line) => total + line.qty, 0);
    const subtotal = items.reduce(
        (total, line) => total + line.price * line.qty,
        0,
    );

    return { items, count, subtotal, add, setQty, remove, clear };
}

export const peso = (amount: number) => `₱${amount.toLocaleString('en-PH')}`;
