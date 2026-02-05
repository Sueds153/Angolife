import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Interfaces for what we store
interface FavoriteItem {
    id: string;
    type: 'job' | 'news' | 'promotion';
    title: string;
    image?: string;
    companyOrDate?: string; // Company for jobs, Date for news
}

interface FavoritesContextData {
    favorites: FavoriteItem[];
    addFavorite: (item: FavoriteItem) => void;
    removeFavorite: (id: string) => void;
    isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextData>({} as FavoritesContextData);

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('angolife_favorites');
        if (saved) {
            try {
                setFavorites(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse favorites", e);
            }
        }
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('angolife_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const addFavorite = (item: FavoriteItem) => {
        setFavorites((prev) => {
            if (prev.some(f => f.id === item.id)) return prev;
            return [...prev, item];
        });
    };

    const removeFavorite = (id: string) => {
        setFavorites((prev) => prev.filter(f => f.id !== id));
    };

    const isFavorite = (id: string) => {
        return favorites.some(f => f.id === id);
    };

    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};
