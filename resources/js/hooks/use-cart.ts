import { useCallback, useEffect, useState } from 'react';

export type CartItem = {
    id: string;
    name: string;
    price: number;
    variant?: string;
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

function write(items: CartItem[], added = false) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: { added } }));
}

export function useCart() {
    const [items, setItems] = useState<CartItem[]>([]);
    /**
     * Bumped only when something is actually added to the cart, so UI can react
     * to an add without mistaking the initial localStorage read for one.
     */
    const [addedAt, setAddedAt] = useState(0);

    useEffect(() => {
        const sync = (event?: Event) => {
            setItems(read());

            if (
                event instanceof CustomEvent &&
                (event.detail as { added?: boolean } | null)?.added
            ) {
                setAddedAt((previous) => previous + 1);
            }
        };

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
            true,
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

    return { items, count, subtotal, addedAt, add, setQty, remove, clear };
}

export const peso = (amount: number) => `₱${amount.toLocaleString('en-PH')}`;
