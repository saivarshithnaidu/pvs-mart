'use client';

import { useEffect } from 'react';
import { addToHistory } from '@/app/actions/history';

export default function ViewTracker({ productId }: { productId: number }) {
    useEffect(() => {
        if (productId) {
            addToHistory(productId);
        }
    }, [productId]);

    return null;
}
