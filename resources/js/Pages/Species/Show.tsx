import React from 'react';
import { router } from '@inertiajs/react';
import { Card, Button } from '@/components/ui';
import { Page } from '@/components/shared/Page';
import MainLayout from '@/layouts/MainLayout';
import { SpeciesShowPageProps } from '@/types/Species';
import { Eye, SquarePen, ArrowLeft } from 'lucide-react';

// Declare route helper
declare const route: (name: string, params?: any, absolute?: boolean) => string;

export default function Show({ species }: SpeciesShowPageProps) {
    const handleEdit = () => {
        router.visit(route('species.edit', species.id));
    };

    const handleBack = () => {
        router.visit(route('species.index'));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <MainLayout>
            <Page title={`Espèce: ${species.name}`}>
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="flex items-center space-x-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Retour</span>
                            </Button>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {species.name}
                            </h1>
                        </div>
                        <Button
                            onClick={handleEdit}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                        >
                            <SquarePen className="h-4 w-4" />
                            <span>Modifier</span>
                        </Button>
                    </div>

                    {/* Species Details */}
                    <Card className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Informations générales
                                </h3>
                                <dl className="space-y-3">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            ID
                                        </dt>
                                        <dd className="text-sm text-gray-900 dark:text-gray-100">
                                            {species.id}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            UUID
                                        </dt>
                                        <dd className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                                            {species.uuid}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Nom
                                        </dt>
                                        <dd className="text-sm text-gray-900 dark:text-gray-100">
                                            {species.name}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Métadonnées
                                </h3>
                                <dl className="space-y-3">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Date de création
                                        </dt>
                                        <dd className="text-sm text-gray-900 dark:text-gray-100">
                                            {formatDate(species.created_at)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Dernière modification
                                        </dt>
                                        <dd className="text-sm text-gray-900 dark:text-gray-100">
                                            {formatDate(species.updated_at)}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {species.description && (
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                    Description
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {species.description}
                                </p>
                            </div>
                        )}
                    </Card>

                    {/* Breeds Section */}
                    {species.breeds && species.breeds.length > 0 && (
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Races associées ({species.breeds.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {species.breeds.map((breed) => (
                                    <div
                                        key={breed.id}
                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    >
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                            {breed.name}
                                        </h4>
                                        {breed.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {breed.description}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                            ID: {breed.id}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </Page>
        </MainLayout>
    );
}
