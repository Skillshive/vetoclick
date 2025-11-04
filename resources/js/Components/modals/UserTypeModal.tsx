import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const UserTypeModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisited');
        if (!hasVisited) {
            setIsOpen(true);
            localStorage.setItem('hasVisited', 'true');
        }
    }, []);

    const handleClientClick = () => {
        window.location.href = '/contact';
    };

    const handleVetClick = () => {
        window.location.href = '/';
    };

    if (!isOpen) {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-4">Êtes-vous un client ou un vétérinaire ?</h2>
                <div className="flex justify-around">
                    <button
                        onClick={handleClientClick}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Client
                    </button>
                    <button
                        onClick={handleVetClick}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Vétérinaire
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default UserTypeModal;
